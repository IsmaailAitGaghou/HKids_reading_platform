import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const childIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid child id")
});

export const createChildBodySchema = z.object({
  name: z.string().min(2).max(80),
  age: z.number().int().min(2).max(17),
  avatar: z.string().url().max(2000).optional(),
  ageGroupId: z.string().regex(objectIdRegex).optional(),
  pin: z
    .string()
    .min(4)
    .max(8)
    .regex(/^\d+$/, "PIN must contain only digits")
    .optional()
});

export const updateChildBodySchema = z.object({
  name: z.string().min(2).max(80).optional(),
  age: z.number().int().min(2).max(17).optional(),
  avatar: z.string().url().max(2000).optional(),
  ageGroupId: z.string().regex(objectIdRegex).optional(),
  pin: z
    .string()
    .min(4)
    .max(8)
    .regex(/^\d+$/, "PIN must contain only digits")
    .optional(),
  isActive: z.boolean().optional()
});

export const updatePolicyBodySchema = z.object({
  allowedCategoryIds: z.array(z.string().regex(objectIdRegex)).optional(),
  allowedAgeGroupIds: z.array(z.string().regex(objectIdRegex)).optional(),
  dailyLimitMinutes: z.number().int().min(1).max(600).optional(),
  schedule: z
    .object({
      start: z.string().regex(hhmmRegex, "Invalid time format HH:mm"),
      end: z.string().regex(hhmmRegex, "Invalid time format HH:mm")
    })
    .optional()
});

export const analyticsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});
