import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const bookIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid book id")
});

export const startReadingBodySchema = z.object({
  bookId: z.string().regex(objectIdRegex, "Invalid book id")
});

export const readingProgressBodySchema = z.object({
  sessionId: z.string().regex(objectIdRegex, "Invalid session id"),
  pageIndex: z.number().int().min(0)
});

export const endReadingBodySchema = z.object({
  sessionId: z.string().regex(objectIdRegex, "Invalid session id")
});
