import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slug";
import { CategoryDocument, CategoryModel } from "./category.model";

const sanitizeCategory = (category: CategoryDocument) => ({
  id: String(category._id),
  name: category.name,
  slug: category.slug,
  description: category.description,
  sortOrder: category.sortOrder,
  isActive: category.isActive
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const slug = slugify(body.name);
  const existing = await CategoryModel.findOne({ slug });
  if (existing) {
    throw new HttpError(409, "Category with same name already exists");
  }

  const category = await CategoryModel.create({
    ...body,
    slug
  });

  res.status(201).json({
    message: "Category created",
    category: sanitizeCategory(category)
  });
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as {
    isActive?: boolean;
  };

  const filter: Record<string, unknown> = {};
  if (typeof query.isActive === "boolean") {
    filter.isActive = query.isActive;
  }

  const categories = await CategoryModel.find(filter).sort({ sortOrder: 1, name: 1 });
  res.status(200).json({
    total: categories.length,
    categories: categories.map(sanitizeCategory)
  });
});

export const listPublicCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.status(200).json({
    total: categories.length,
    categories: categories.map(sanitizeCategory)
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.body as {
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  if (body.name && body.name !== category.name) {
    const nextSlug = slugify(body.name);
    const existing = await CategoryModel.findOne({ slug: nextSlug, _id: { $ne: id } });
    if (existing) {
      throw new HttpError(409, "Another category already uses this name");
    }
    category.slug = nextSlug;
    category.name = body.name;
  }

  if (typeof body.description === "string") category.description = body.description;
  if (typeof body.sortOrder === "number") category.sortOrder = body.sortOrder;
  if (typeof body.isActive === "boolean") category.isActive = body.isActive;

  await category.save();

  res.status(200).json({
    message: "Category updated",
    category: sanitizeCategory(category)
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const deleted = await CategoryModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, "Category not found");
  }

  res.status(200).json({
    message: "Category deleted"
  });
});
