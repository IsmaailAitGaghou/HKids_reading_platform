import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const pageSchema = z.object({
  pageNumber: z.number().int().positive(),
  title: z.string().max(200).optional(),
  text: z.string().min(1).max(3000),
  imageUrl: z.string().url().max(2000).optional(),
  narrationUrl: z.string().url().max(2000).optional()
});

const bookContentTypeSchema = z.enum(["structured", "pdf"]);

export const createBookBodySchema = z
  .object({
    title: z.string().min(2).max(160),
    summary: z.string().max(800).optional(),
    coverImageUrl: z.string().url().max(2000).optional(),
    ageGroupId: z.string().regex(objectIdRegex),
    categoryIds: z.array(z.string().regex(objectIdRegex)).default([]),
    tags: z.array(z.string().min(1).max(32)).default([]),
    visibility: z.enum(["private", "public"]).default("private"),
    contentType: bookContentTypeSchema.default("structured"),
    pages: z.array(pageSchema).min(1, "At least one page is required").optional(),
    pdfUrl: z.string().url().max(2000).optional(),
    pdfPageCount: z.number().int().positive().optional()
  })
  .superRefine((value, ctx) => {
    if (value.contentType === "structured") {
      if (!value.pages || value.pages.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one page is required",
          path: ["pages"]
        });
      }
      return;
    }

    if (!value.pdfUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pdfUrl is required for PDF books",
        path: ["pdfUrl"]
      });
    }

    if (!value.pdfPageCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pdfPageCount is required for PDF books",
        path: ["pdfPageCount"]
      });
    }
  });

export const updateBookBodySchema = z
  .object({
  title: z.string().min(2).max(160).optional(),
  summary: z.string().max(800).optional(),
  coverImageUrl: z.string().url().max(2000).optional(),
  ageGroupId: z.string().regex(objectIdRegex).optional(),
  categoryIds: z.array(z.string().regex(objectIdRegex)).optional(),
  contentType: bookContentTypeSchema.optional(),
  pages: z.array(pageSchema).min(1, "At least one page is required").optional(),
  pdfUrl: z.string().url().max(2000).optional(),
  pdfPageCount: z.number().int().positive().optional(),
  tags: z.array(z.string().min(1).max(32)).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional()
  })
  .superRefine((value, ctx) => {
    if (value.contentType === "structured") {
      if (value.pdfUrl !== undefined || value.pdfPageCount !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "pdfUrl and pdfPageCount are not allowed for structured books",
          path: ["pdfUrl"]
        });
      }
      return;
    }

    if (value.contentType === "pdf" && value.pages !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pages are not allowed for PDF books",
        path: ["pages"]
      });
    }
  });

export const bookIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid book id")
});

export const adminBooksQuerySchema = z.object({
  ageGroupId: z.string().regex(objectIdRegex).optional(),
  categoryId: z.string().regex(objectIdRegex).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  approved: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  q: z.string().trim().min(1).max(80).optional()
});

export const reviewBookBodySchema = z.object({
  isApproved: z.boolean()
});

export const reorderBookPagesBodySchema = z.object({
  orderedPageNumbers: z.array(z.number().int().positive()).min(1)
});
