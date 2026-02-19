import { Types } from "mongoose";
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slug";
import { AgeGroupModel } from "../age-groups/age-group.model";
import { CategoryModel } from "../categories/category.model";
import { BookDocument, BookModel } from "./book.model";

interface BookPageInput {
  pageNumber: number;
  title?: string;
  text: string;
  imageUrl?: string;
  narrationUrl?: string;
}

const sanitizeBook = (book: BookDocument) => ({
  id: String(book._id),
  title: book.title,
  slug: book.slug,
  summary: book.summary,
  coverImageUrl: book.coverImageUrl,
  ageGroupId: String(book.ageGroupId),
  categoryIds: book.categoryIds.map((value) => String(value)),
  pages: [...book.pages].sort((a, b) => a.pageNumber - b.pageNumber),
  tags: book.tags,
  status: book.status,
  visibility: book.visibility,
  isApproved: book.isApproved,
  publishedAt: book.publishedAt ?? null
});

const ensureUniquePageNumbers = (pages: BookPageInput[]): void => {
  const uniqueNumbers = new Set<number>();
  for (const page of pages) {
    if (uniqueNumbers.has(page.pageNumber)) {
      throw new HttpError(400, `Duplicate pageNumber detected: ${page.pageNumber}`);
    }
    uniqueNumbers.add(page.pageNumber);
  }
};

const ensureCategoriesExist = async (categoryIds: string[]): Promise<void> => {
  if (categoryIds.length === 0) return;
  const uniqueIds = [...new Set(categoryIds)];
  const count = await CategoryModel.countDocuments({
    _id: { $in: uniqueIds.map((value) => new Types.ObjectId(value)) }
  });
  if (count !== uniqueIds.length) {
    throw new HttpError(400, "One or more category ids are invalid");
  }
};

const ensureAgeGroupExists = async (ageGroupId: string): Promise<void> => {
  const ageGroup = await AgeGroupModel.findById(ageGroupId);
  if (!ageGroup || !ageGroup.isActive) {
    throw new HttpError(400, "Invalid ageGroupId");
  }
};

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new HttpError(401, "Authentication required");
  }

  const body = req.body as {
    title: string;
    summary: string;
    coverImageUrl: string;
    ageGroupId: string;
    categoryIds: string[];
    pages: BookPageInput[];
    tags: string[];
    visibility: "private" | "public";
  };

  await ensureAgeGroupExists(body.ageGroupId);
  await ensureCategoriesExist(body.categoryIds);
  ensureUniquePageNumbers(body.pages);

  const slug = slugify(body.title);
  const existing = await BookModel.findOne({ slug });
  if (existing) {
    throw new HttpError(409, "Book with same title already exists");
  }

  const book = await BookModel.create({
    title: body.title,
    slug,
    summary: body.summary ?? "",
    coverImageUrl: body.coverImageUrl ?? "",
    ageGroupId: new Types.ObjectId(body.ageGroupId),
    categoryIds: body.categoryIds.map((value) => new Types.ObjectId(value)),
    pages: body.pages,
    tags: body.tags,
    visibility: body.visibility,
    status: "draft",
    createdBy: req.auth.sub,
    updatedBy: req.auth.sub
  });

  res.status(201).json({
    message: "Book created",
    book: sanitizeBook(book)
  });
});

export const listAdminBooks = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as {
    status?: "draft" | "published" | "archived";
    visibility?: "private" | "public";
    approved?: boolean;
    q?: string;
  };

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.visibility) filter.visibility = query.visibility;
  if (typeof query.approved === "boolean") filter.isApproved = query.approved;
  if (query.q) {
    const regex = new RegExp(query.q, "i");
    filter.$or = [{ title: regex }, { summary: regex }];
  }

  const books = await BookModel.find(filter).sort({ updatedAt: -1 });
  res.status(200).json({
    total: books.length,
    books: books.map(sanitizeBook)
  });
});

export const getAdminBookById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }
  res.status(200).json({ book: sanitizeBook(book) });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new HttpError(401, "Authentication required");
  }

  const { id } = req.params as { id: string };
  const body = req.body as {
    title?: string;
    summary?: string;
    coverImageUrl?: string;
    ageGroupId?: string;
    categoryIds?: string[];
    pages?: BookPageInput[];
    tags?: string[];
    visibility?: "private" | "public";
    status?: "draft" | "published" | "archived";
  };

  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  if (body.title && body.title !== book.title) {
    const slug = slugify(body.title);
    const exists = await BookModel.findOne({ slug, _id: { $ne: id } });
    if (exists) {
      throw new HttpError(409, "Another book already uses this title");
    }
    book.title = body.title;
    book.slug = slug;
  }

  if (typeof body.summary === "string") book.summary = body.summary;
  if (typeof body.coverImageUrl === "string") book.coverImageUrl = body.coverImageUrl;
  if (body.ageGroupId) {
    await ensureAgeGroupExists(body.ageGroupId);
    book.ageGroupId = new Types.ObjectId(body.ageGroupId);
  }
  if (body.categoryIds) {
    await ensureCategoriesExist(body.categoryIds);
    book.set(
      "categoryIds",
      body.categoryIds.map((value) => new Types.ObjectId(value))
    );
  }
  if (body.pages) {
    ensureUniquePageNumbers(body.pages);
    book.set("pages", body.pages);
  }
  if (body.tags) book.set("tags", body.tags);
  if (body.visibility) book.visibility = body.visibility;
  if (body.status) {
    book.status = body.status;
    if (body.status === "published") {
      book.publishedAt = new Date();
    }
  }

  book.updatedBy = new Types.ObjectId(req.auth.sub);
  await book.save();

  res.status(200).json({
    message: "Book updated",
    book: sanitizeBook(book)
  });
});

export const reorderBookPages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { orderedPageNumbers } = req.body as { orderedPageNumbers: number[] };

  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  const existingNumbers = book.pages.map((value) => value.pageNumber).sort((a, b) => a - b);
  const requested = [...orderedPageNumbers].sort((a, b) => a - b);
  if (JSON.stringify(existingNumbers) !== JSON.stringify(requested)) {
    throw new HttpError(400, "orderedPageNumbers must include all existing page numbers exactly once");
  }

  const orderMap = new Map<number, number>();
  orderedPageNumbers.forEach((pageNumber, index) => {
    orderMap.set(pageNumber, index + 1);
  });

  const nextPages = [...book.pages].map((page) => ({
    pageNumber: orderMap.get(page.pageNumber) ?? page.pageNumber,
    title: page.title,
    text: page.text,
    imageUrl: page.imageUrl,
    narrationUrl: page.narrationUrl
  }));
  book.set("pages", nextPages);
  await book.save();

  res.status(200).json({
    message: "Book pages reordered",
    book: sanitizeBook(book)
  });
});

export const reviewBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { isApproved } = req.body as { isApproved: boolean };

  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  book.isApproved = isApproved;
  await book.save();

  res.status(200).json({
    message: isApproved ? "Book approved" : "Book approval revoked",
    book: sanitizeBook(book)
  });
});

export const publishBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  if (!book.isApproved) {
    throw new HttpError(400, "Book must be approved before publishing");
  }
  if (!book.pages.length) {
    throw new HttpError(400, "Book must have at least one page before publishing");
  }

  book.status = "published";
  book.publishedAt = new Date();
  await book.save();

  res.status(200).json({
    message: "Book published",
    book: sanitizeBook(book)
  });
});

export const unpublishBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  book.status = "draft";
  await book.save();

  res.status(200).json({
    message: "Book moved back to draft",
    book: sanitizeBook(book)
  });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const deleted = await BookModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, "Book not found");
  }

  res.status(200).json({
    message: "Book deleted"
  });
});
