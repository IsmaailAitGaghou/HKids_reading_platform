import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { AgeGroupDocument, AgeGroupModel } from "./age-group.model";

const sanitizeAgeGroup = (ageGroup: AgeGroupDocument) => ({
  id: String(ageGroup._id),
  name: ageGroup.name,
  minAge: ageGroup.minAge,
  maxAge: ageGroup.maxAge,
  description: ageGroup.description,
  isActive: ageGroup.isActive,
  sortOrder: ageGroup.sortOrder
});

export const createAgeGroup = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    name: string;
    minAge: number;
    maxAge: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  const exists = await AgeGroupModel.findOne({ name: body.name });
  if (exists) {
    throw new HttpError(409, "Age group with same name already exists");
  }

  const ageGroup = await AgeGroupModel.create({
    name: body.name,
    minAge: body.minAge,
    maxAge: body.maxAge,
    description: body.description ?? "",
    isActive: body.isActive ?? true,
    sortOrder: body.sortOrder ?? 0
  });

  res.status(201).json({
    message: "Age group created",
    ageGroup: sanitizeAgeGroup(ageGroup)
  });
});

export const listAgeGroups = asyncHandler(async (_req: Request, res: Response) => {
  const ageGroups = await AgeGroupModel.find().sort({ sortOrder: 1, minAge: 1, name: 1 });
  res.status(200).json({
    total: ageGroups.length,
    ageGroups: ageGroups.map(sanitizeAgeGroup)
  });
});

export const listPublicAgeGroups = asyncHandler(async (_req: Request, res: Response) => {
  const ageGroups = await AgeGroupModel.find({ isActive: true }).sort({ sortOrder: 1, minAge: 1 });
  res.status(200).json({
    total: ageGroups.length,
    ageGroups: ageGroups.map(sanitizeAgeGroup)
  });
});

export const updateAgeGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.body as {
    name?: string;
    minAge?: number;
    maxAge?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  const ageGroup = await AgeGroupModel.findById(id);
  if (!ageGroup) {
    throw new HttpError(404, "Age group not found");
  }

  if (body.name && body.name !== ageGroup.name) {
    const exists = await AgeGroupModel.findOne({ name: body.name, _id: { $ne: id } });
    if (exists) {
      throw new HttpError(409, "Another age group already uses this name");
    }
    ageGroup.name = body.name;
  }

  if (typeof body.minAge === "number") ageGroup.minAge = body.minAge;
  if (typeof body.maxAge === "number") ageGroup.maxAge = body.maxAge;
  if (ageGroup.minAge > ageGroup.maxAge) {
    throw new HttpError(400, "minAge must be less than or equal to maxAge");
  }
  if (typeof body.description === "string") ageGroup.description = body.description;
  if (typeof body.isActive === "boolean") ageGroup.isActive = body.isActive;
  if (typeof body.sortOrder === "number") ageGroup.sortOrder = body.sortOrder;

  await ageGroup.save();

  res.status(200).json({
    message: "Age group updated",
    ageGroup: sanitizeAgeGroup(ageGroup)
  });
});

export const deleteAgeGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const deleted = await AgeGroupModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, "Age group not found");
  }
  res.status(200).json({
    message: "Age group deleted"
  });
});
