import { z } from "zod";
import { ROLES } from "../../types/auth";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const registerUserBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum([ROLES.PARENT, ROLES.ADMIN] as const).default(ROLES.PARENT),
  bootstrapKey: z.string().optional()
});

export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

export const childPinLoginBodySchema = z.object({
  childId: z.string().regex(objectIdRegex, "Invalid child id"),
  pin: z
    .string()
    .min(4)
    .max(8)
    .regex(/^\d+$/, "PIN must contain only digits")
});
