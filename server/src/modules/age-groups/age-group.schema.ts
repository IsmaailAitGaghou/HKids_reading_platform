import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const baseAgeGroupBodySchema = z.object({
  name: z.string().min(2).max(120),
  minAge: z.number().int().min(0).max(17),
  maxAge: z.number().int().min(0).max(17),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
});

export const createAgeGroupBodySchema = baseAgeGroupBodySchema
  .refine((value) => value.minAge <= value.maxAge, {
    message: "minAge must be less than or equal to maxAge"
  });

export const updateAgeGroupBodySchema = baseAgeGroupBodySchema.partial().refine(
  (value) => {
    if (typeof value.minAge !== "number" || typeof value.maxAge !== "number") {
      return true;
    }
    return value.minAge <= value.maxAge;
  },
  { message: "minAge must be less than or equal to maxAge" }
);

export const ageGroupIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid age group id")
});
