import { Types } from "mongoose";
import { HttpError } from "../../utils/httpError";
import { AgeGroupModel } from "../age-groups/age-group.model";
import { BookModel } from "../books/book.model";
import { CategoryModel } from "../categories/category.model";
import { ChildModel } from "./child.model";
import { ChildPolicyModel } from "./child-policy.model";
import { ReadingSessionModel } from "./reading-session.model";

const getStartOfTodayUtc = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const minutesFromScheduleTime = (value: string): number => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

export const ensureChildBelongsToParent = async (childId: string, parentId: string) => {
  const child = await ChildModel.findOne({ _id: childId, parentId });
  if (!child) {
    throw new HttpError(404, "Child profile not found");
  }
  return child;
};

export const getOrCreateChildPolicy = async (childId: string) => {
  const existing = await ChildPolicyModel.findOne({ childId });
  if (existing) {
    return existing;
  }
  return ChildPolicyModel.create({
    childId,
    allowedCategoryIds: [],
    allowedAgeGroupIds: [],
    dailyLimitMinutes: 20
  });
};

export const ensurePolicyReferencesExist = async (policy: {
  allowedCategoryIds?: string[];
  allowedAgeGroupIds?: string[];
}) => {
  if (policy.allowedCategoryIds && policy.allowedCategoryIds.length > 0) {
    const uniqueCategoryIds = [...new Set(policy.allowedCategoryIds)];
    const count = await CategoryModel.countDocuments({
      _id: { $in: uniqueCategoryIds.map((id) => new Types.ObjectId(id)) }
    });
    if (count !== uniqueCategoryIds.length) {
      throw new HttpError(400, "One or more allowedCategoryIds are invalid");
    }
  }

  if (policy.allowedAgeGroupIds && policy.allowedAgeGroupIds.length > 0) {
    const uniqueAgeGroupIds = [...new Set(policy.allowedAgeGroupIds)];
    const count = await AgeGroupModel.countDocuments({
      _id: { $in: uniqueAgeGroupIds.map((id) => new Types.ObjectId(id)) }
    });
    if (count !== uniqueAgeGroupIds.length) {
      throw new HttpError(400, "One or more allowedAgeGroupIds are invalid");
    }
  }
};

export const getChildMinutesReadToday = async (childId: string): Promise<number> => {
  const startOfToday = getStartOfTodayUtc();
  const sessions = await ReadingSessionModel.find({
    childId,
    startedAt: { $gte: startOfToday },
    endedAt: { $ne: null }
  });
  return sessions.reduce((sum, session) => sum + (session.minutes ?? 0), 0);
};

export const checkChildSchedule = (schedule?: { start: string; end: string } | null): boolean => {
  if (!schedule) {
    return true;
  }
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = minutesFromScheduleTime(schedule.start);
  const endMinutes = minutesFromScheduleTime(schedule.end);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};

export const assertChildCanReadNow = async (childId: string) => {
  const policy = await getOrCreateChildPolicy(childId);
  if (!checkChildSchedule(policy.schedule)) {
    throw new HttpError(403, "Reading is not allowed at this time");
  }
  const todayMinutes = await getChildMinutesReadToday(childId);
  if (todayMinutes >= policy.dailyLimitMinutes) {
    throw new HttpError(403, "Daily reading limit reached");
  }
  return { policy, todayMinutes };
};

export const isBookAllowedForChild = async (childId: string, bookId: string): Promise<boolean> => {
  const child = await ChildModel.findById(childId);
  if (!child || !child.isActive) {
    return false;
  }
  const policy = await getOrCreateChildPolicy(childId);

  const filter: Record<string, unknown> = {
    _id: bookId,
    status: "published",
    visibility: "public",
    isApproved: true
  };

  if (policy.allowedCategoryIds.length > 0) {
    filter.categoryIds = { $in: policy.allowedCategoryIds };
  }

  if (policy.allowedAgeGroupIds.length > 0) {
    filter.ageGroupId = { $in: policy.allowedAgeGroupIds };
  }

  const match = await BookModel.findOne(filter).select("_id");
  return Boolean(match);
};
