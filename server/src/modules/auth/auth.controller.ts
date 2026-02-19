import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { env } from "../../config/env";
import { ROLES } from "../../types/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { issueToken } from "../../utils/token";
import { ChildModel } from "../children/child.model";
import { UserModel } from "./auth.model";

const sanitizeUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  role: "ADMIN" | "PARENT";
  isActive: boolean;
  lastLoginAt?: Date | null;
}) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt ?? null
});

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role = ROLES.PARENT, bootstrapKey } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "PARENT";
    bootstrapKey?: string;
  };

  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new HttpError(409, "Email already in use");
  }

  const adminCount = await UserModel.countDocuments({ role: ROLES.ADMIN });
  const creatingAdmin = role === ROLES.ADMIN;

  if (creatingAdmin) {
    const isBootstrapFlow = adminCount === 0;
    if (isBootstrapFlow) {
      if (bootstrapKey !== env.ADMIN_BOOTSTRAP_KEY) {
        throw new HttpError(403, "Invalid bootstrap key");
      }
    } else {
      if (!req.auth) {
        throw new HttpError(401, "Only authenticated admin can create another admin");
      }
      if (req.auth.role !== ROLES.ADMIN) {
        throw new HttpError(403, "Only admin can create another admin");
      }
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role
  });

  const token = issueToken({
    sub: String(user._id),
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    message: `${user.role} account created`,
    token,
    user: sanitizeUser(user)
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = issueToken({
    sub: String(user._id),
    email: user.email,
    role: user.role
  });

  res.status(200).json({
    message: "Login successful",
    token,
    user: sanitizeUser(user)
  });
});

export const loginChildWithPin = asyncHandler(async (req: Request, res: Response) => {
  const { childId, pin } = req.body as { childId: string; pin: string };

  const child = await ChildModel.findById(childId);
  if (!child || !child.isActive) {
    throw new HttpError(401, "Invalid child credentials");
  }

  if (!child.pinHash) {
    throw new HttpError(400, "This child profile does not support PIN login");
  }

  const isValid = await bcrypt.compare(pin, child.pinHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid child credentials");
  }

  const token = issueToken({
    sub: String(child._id),
    role: ROLES.CHILD,
    parentId: String(child.parentId)
  });

  res.status(200).json({
    message: "Child login successful",
    token,
    child: {
      id: String(child._id),
      parentId: String(child.parentId),
      name: child.name,
      age: child.age,
      avatar: child.avatar
    }
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new HttpError(401, "Authentication required");
  }

  if (req.auth.role === ROLES.CHILD) {
    const child = await ChildModel.findById(req.auth.sub);
    if (!child) {
      throw new HttpError(404, "Child profile not found");
    }
    res.status(200).json({
      user: {
        id: String(child._id),
        role: ROLES.CHILD,
        name: child.name,
        parentId: String(child.parentId)
      }
    });
    return;
  }

  const user = await UserModel.findById(req.auth.sub);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json({
    user: sanitizeUser(user)
  });
});
