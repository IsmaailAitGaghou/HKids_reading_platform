import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCategoryBodySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial();

export const categoryIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid category id")
});

export const categoryQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});
