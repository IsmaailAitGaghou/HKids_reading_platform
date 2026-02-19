import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { ROLES } from "../../types/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { AgeGroupModel } from "../age-groups/age-group.model";
import { ChildModel } from "../children/child.model";
import {
  ensureChildBelongsToParent,
  ensurePolicyReferencesExist,
  getOrCreateChildPolicy
} from "../children/children.service";
import { ChildPolicyModel } from "../children/child-policy.model";
import { ReadingSessionModel } from "../children/reading-session.model";

const sanitizeChild = (child: {
  _id: unknown;
  parentId: unknown;
  name: string;
  age: number;
  avatar?: string;
  ageGroupId?: unknown;
  isActive: boolean;
}) => ({
  id: String(child._id),
  parentId: String(child.parentId),
  name: child.name,
  age: child.age,
  avatar: child.avatar ?? "",
  ageGroupId: child.ageGroupId ? String(child.ageGroupId) : null,
  isActive: child.isActive
});

const sanitizePolicy = (policy: {
  childId: unknown;
  allowedCategoryIds: unknown[];
  allowedAgeGroupIds: unknown[];
  dailyLimitMinutes: number;
  schedule?: { start: string; end: string } | null;
}) => ({
  childId: String(policy.childId),
  allowedCategoryIds: policy.allowedCategoryIds.map((value) => String(value)),
  allowedAgeGroupIds: policy.allowedAgeGroupIds.map((value) => String(value)),
  dailyLimitMinutes: policy.dailyLimitMinutes,
  schedule: policy.schedule ?? null
});

const requireParentId = (req: Request): string => {
  if (!req.auth || req.auth.role !== ROLES.PARENT) {
    throw new HttpError(403, "Only parent access is allowed");
  }
  return req.auth.sub;
};

export const listParentChildren = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const children = await ChildModel.find({ parentId }).sort({ createdAt: -1 });
  res.status(200).json({
    total: children.length,
    children: children.map(sanitizeChild)
  });
});

export const createChild = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const body = req.body as {
    name: string;
    age: number;
    avatar?: string;
    ageGroupId?: string;
    pin?: string;
  };

  if (body.ageGroupId) {
    const ageGroup = await AgeGroupModel.findById(body.ageGroupId);
    if (!ageGroup) {
      throw new HttpError(400, "Invalid ageGroupId");
    }
  }

  const pinHash = body.pin ? await bcrypt.hash(body.pin, 12) : undefined;

  const child = await ChildModel.create({
    parentId,
    name: body.name,
    age: body.age,
    avatar: body.avatar ?? "",
    ageGroupId: body.ageGroupId ? new Types.ObjectId(body.ageGroupId) : undefined,
    pinHash
  });

  await ChildPolicyModel.create({
    childId: child._id,
    allowedCategoryIds: [],
    allowedAgeGroupIds: body.ageGroupId ? [new Types.ObjectId(body.ageGroupId)] : [],
    dailyLimitMinutes: 20
  });

  res.status(201).json({
    message: "Child profile created",
    child: sanitizeChild(child)
  });
});

export const getParentChildById = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const child = await ensureChildBelongsToParent(id, parentId);
  res.status(200).json({
    child: sanitizeChild(child)
  });
});

export const updateParentChild = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const body = req.body as {
    name?: string;
    age?: number;
    avatar?: string;
    ageGroupId?: string;
    pin?: string;
    isActive?: boolean;
  };
  const child = await ensureChildBelongsToParent(id, parentId);

  if (body.ageGroupId) {
    const ageGroup = await AgeGroupModel.findById(body.ageGroupId);
    if (!ageGroup) {
      throw new HttpError(400, "Invalid ageGroupId");
    }
    child.ageGroupId = new Types.ObjectId(body.ageGroupId);
  }

  if (typeof body.name === "string") child.name = body.name;
  if (typeof body.age === "number") child.age = body.age;
  if (typeof body.avatar === "string") child.avatar = body.avatar;
  if (typeof body.isActive === "boolean") child.isActive = body.isActive;
  if (typeof body.pin === "string") {
    child.pinHash = await bcrypt.hash(body.pin, 12);
  }

  await child.save();

  res.status(200).json({
    message: "Child profile updated",
    child: sanitizeChild(child)
  });
});

export const deleteParentChild = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const child = await ensureChildBelongsToParent(id, parentId);

  await ChildPolicyModel.deleteOne({ childId: child._id });
  await ReadingSessionModel.deleteMany({ childId: child._id });
  await ChildModel.deleteOne({ _id: child._id });

  res.status(200).json({
    message: "Child profile deleted"
  });
});

export const getChildPolicy = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const child = await ensureChildBelongsToParent(id, parentId);
  const policy = await getOrCreateChildPolicy(String(child._id));

  res.status(200).json({
    policy: sanitizePolicy(policy)
  });
});

export const updateChildPolicy = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const body = req.body as {
    allowedCategoryIds?: string[];
    allowedAgeGroupIds?: string[];
    dailyLimitMinutes?: number;
    schedule?: { start: string; end: string };
  };

  const child = await ensureChildBelongsToParent(id, parentId);
  await ensurePolicyReferencesExist(body);

  const policy = await getOrCreateChildPolicy(String(child._id));
  if (body.allowedCategoryIds) {
    policy.allowedCategoryIds = body.allowedCategoryIds.map((value) => new Types.ObjectId(value));
  }
  if (body.allowedAgeGroupIds) {
    policy.allowedAgeGroupIds = body.allowedAgeGroupIds.map((value) => new Types.ObjectId(value));
  }
  if (typeof body.dailyLimitMinutes === "number") {
    policy.dailyLimitMinutes = body.dailyLimitMinutes;
  }
  if (body.schedule) {
    policy.schedule = body.schedule;
  }

  await policy.save();

  res.status(200).json({
    message: "Child policy updated",
    policy: sanitizePolicy(policy)
  });
});

export const getChildAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const parentId = requireParentId(req);
  const { id } = req.params as { id: string };
  const { from, to } = req.query as { from?: Date; to?: Date };
  const child = await ensureChildBelongsToParent(id, parentId);

  const dateFilter: Record<string, unknown> = {};
  if (from || to) {
    dateFilter.startedAt = {};
    if (from) {
      (dateFilter.startedAt as Record<string, unknown>).$gte = from;
    }
    if (to) {
      (dateFilter.startedAt as Record<string, unknown>).$lte = to;
    }
  }

  const sessions = await ReadingSessionModel.find({
    childId: child._id,
    ...dateFilter
  }).sort({ startedAt: -1 });

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.minutes ?? 0), 0);
  const lastReadAt = sessions[0]?.endedAt ?? sessions[0]?.startedAt ?? null;

  const topBooksMap = new Map<string, { bookId: string; sessions: number; minutes: number }>();
  for (const session of sessions) {
    const key = String(session.bookId);
    const existing = topBooksMap.get(key) ?? { bookId: key, sessions: 0, minutes: 0 };
    existing.sessions += 1;
    existing.minutes += session.minutes ?? 0;
    topBooksMap.set(key, existing);
  }

  const topBooks = [...topBooksMap.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 5);

  res.status(200).json({
    child: sanitizeChild(child),
    analytics: {
      totalSessions,
      totalMinutes,
      lastReadAt,
      topBooks
    }
  });
});
