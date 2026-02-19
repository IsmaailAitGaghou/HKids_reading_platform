import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGIN: z.string().default("*"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  ADMIN_BOOTSTRAP_KEY: z.string().min(8, "ADMIN_BOOTSTRAP_KEY is required"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const { fieldErrors } = parsed.error.flatten();
  throw new Error(`Invalid environment configuration: ${JSON.stringify(fieldErrors)}`);
}

export const env = parsed.data;
