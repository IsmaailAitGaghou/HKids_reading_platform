import { Types } from "mongoose";
import { Request, Response } from "express";
import { ROLES } from "../../types/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { BookModel } from "../books/book.model";
import { CategoryModel } from "../categories/category.model";
import { ChildModel } from "../children/child.model";
import {
  assertChildCanReadNow,
  getOrCreateChildPolicy,
  isBookAllowedForChild
} from "../children/children.service";
import { ReadingSessionModel } from "../children/reading-session.model";

const requireChildAuth = (req: Request): { childId: string; parentId: string } => {
  if (!req.auth || req.auth.role !== ROLES.CHILD || !req.auth.parentId) {
    throw new HttpError(403, "Child authentication is required");
  }
  return { childId: req.auth.sub, parentId: req.auth.parentId };
};

const getResumePageIndex = (session: {
  pagesRead: number[];
  progressEvents: Array<{ pageIndex: number }>;
}): number => {
  const lastProgress = session.progressEvents[session.progressEvents.length - 1];
  if (lastProgress) {
    return lastProgress.pageIndex;
  }
  if (session.pagesRead.length > 0) {
    return Math.max(...session.pagesRead);
  }
  return 0;
};

export const listKidsBooks = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);

  const child = await ChildModel.findById(childId);
  if (!child || !child.isActive) {
    throw new HttpError(403, "Child profile is inactive");
  }

  const { policy, todayMinutes } = await assertChildCanReadNow(childId);

  const filter: Record<string, unknown> = {
    status: "published",
    visibility: "public",
    isApproved: true
  };

  if (policy.allowedCategoryIds.length > 0) {
    filter.categoryIds = { $in: policy.allowedCategoryIds };
  }
  if (policy.allowedAgeGroupIds.length > 0) {
    filter.ageGroupId = { $in: policy.allowedAgeGroupIds };
  }

  const books = await BookModel.find(filter).sort({ publishedAt: -1 });
  const allowedCategoryIds = policy.allowedCategoryIds.map((value) => String(value));

  const categoryIdsForLookup =
    allowedCategoryIds.length > 0
      ? allowedCategoryIds
      : [...new Set(books.flatMap((book) => book.categoryIds.map((value) => String(value))))];

  const categories =
    categoryIdsForLookup.length > 0
      ? await CategoryModel.find({
          _id: { $in: categoryIdsForLookup.map((value) => new Types.ObjectId(value)) }
        })
          .sort({ sortOrder: 1, name: 1 })
          .select({ name: 1, slug: 1 })
      : [];

  res.status(200).json({
    total: books.length,
    remainingMinutes: Math.max(policy.dailyLimitMinutes - todayMinutes, 0),
    categories: categories.map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug
    })),
    books: books.map((book) => ({
      id: String(book._id),
      title: book.title,
      summary: book.summary,
      coverImageUrl: book.coverImageUrl,
      pageCount: book.pages.length,
      categoryIds: book.categoryIds.map((value) => String(value))
    }))
  });
});

export const getKidsBook = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);
  const { id } = req.params as { id: string };
  const allowed = await isBookAllowedForChild(childId, id);
  if (!allowed) {
    throw new HttpError(403, "This book is not allowed for this child");
  }

  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }
  res.status(200).json({
    book: {
      id: String(book._id),
      title: book.title,
      summary: book.summary,
      coverImageUrl: book.coverImageUrl,
      pageCount: book.pages.length,
      categoryIds: book.categoryIds.map((value) => String(value))
    }
  });
});

export const getKidsBookPages = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);
  const { id } = req.params as { id: string };
  const allowed = await isBookAllowedForChild(childId, id);
  if (!allowed) {
    throw new HttpError(403, "This book is not allowed for this child");
  }

  await assertChildCanReadNow(childId);
  const book = await BookModel.findById(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }

  const pages = [...book.pages].sort((a, b) => a.pageNumber - b.pageNumber);
  res.status(200).json({
    book: {
      id: String(book._id),
      title: book.title,
      summary: book.summary,
      pageCount: pages.length
    },
    pages
  });
});

export const getKidsBookResume = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);
  const { id } = req.params as { id: string };
  const allowed = await isBookAllowedForChild(childId, id);
  if (!allowed) {
    throw new HttpError(403, "This book is not allowed for this child");
  }

  const activeSession = await ReadingSessionModel.findOne({
    childId,
    bookId: id,
    endedAt: null
  }).sort({ startedAt: -1 });

  if (activeSession) {
    res.status(200).json({
      resume: {
        hasProgress: true,
        pageIndex: getResumePageIndex(activeSession),
        sessionId: String(activeSession._id),
        hasActiveSession: true,
        lastActivityAt:
          activeSession.progressEvents[activeSession.progressEvents.length - 1]?.at ??
          activeSession.startedAt
      }
    });
    return;
  }

  const lastSession = await ReadingSessionModel.findOne({
    childId,
    bookId: id
  }).sort({ startedAt: -1 });

  if (!lastSession) {
    res.status(200).json({
      resume: {
        hasProgress: false,
        pageIndex: 0,
        sessionId: null,
        hasActiveSession: false,
        lastActivityAt: null
      }
    });
    return;
  }

  res.status(200).json({
    resume: {
      hasProgress: true,
      pageIndex: getResumePageIndex(lastSession),
      sessionId: String(lastSession._id),
      hasActiveSession: false,
      lastActivityAt:
        lastSession.progressEvents[lastSession.progressEvents.length - 1]?.at ?? lastSession.endedAt
    }
  });
});

export const startReading = asyncHandler(async (req: Request, res: Response) => {
  const { childId, parentId } = requireChildAuth(req);
  const { bookId } = req.body as { bookId: string };

  await assertChildCanReadNow(childId);
  const allowed = await isBookAllowedForChild(childId, bookId);
  if (!allowed) {
    throw new HttpError(403, "This book is not allowed for this child");
  }

  const activeSession = await ReadingSessionModel.findOne({
    childId,
    bookId,
    endedAt: null
  }).sort({ startedAt: -1 });

  if (activeSession) {
    res.status(200).json({
      message: "Resumed existing reading session",
      session: {
        id: String(activeSession._id),
        childId: String(activeSession.childId),
        bookId: String(activeSession.bookId),
        startedAt: activeSession.startedAt,
        resumePageIndex: getResumePageIndex(activeSession),
        resumed: true
      }
    });
    return;
  }

  const lastSession = await ReadingSessionModel.findOne({
    childId,
    bookId
  }).sort({ startedAt: -1 });
  const resumePageIndex = lastSession ? getResumePageIndex(lastSession) : 0;

  const session = await ReadingSessionModel.create({
    childId: new Types.ObjectId(childId),
    parentId: new Types.ObjectId(parentId),
    bookId: new Types.ObjectId(bookId),
    startedAt: new Date(),
    pagesRead: [],
    progressEvents: []
  });

  res.status(201).json({
    message: "Reading session started",
    session: {
      id: String(session._id),
      childId: String(session.childId),
      bookId: String(session.bookId),
      startedAt: session.startedAt,
      resumePageIndex,
      resumed: false
    }
  });
});

export const trackReadingProgress = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);
  const { sessionId, pageIndex } = req.body as { sessionId: string; pageIndex: number };

  const session = await ReadingSessionModel.findOne({ _id: sessionId, childId });
  if (!session) {
    throw new HttpError(404, "Reading session not found");
  }
  if (session.endedAt) {
    throw new HttpError(400, "Reading session already ended");
  }

  if (!session.pagesRead.includes(pageIndex)) {
    session.pagesRead.push(pageIndex);
  }
  session.progressEvents.push({ pageIndex, at: new Date() });
  await session.save();

  res.status(200).json({
    message: "Reading progress updated",
    session: {
      id: String(session._id),
      pagesReadCount: session.pagesRead.length
    }
  });
});

export const endReading = asyncHandler(async (req: Request, res: Response) => {
  const { childId } = requireChildAuth(req);
  const { sessionId } = req.body as { sessionId: string };

  const session = await ReadingSessionModel.findOne({ _id: sessionId, childId });
  if (!session) {
    throw new HttpError(404, "Reading session not found");
  }
  if (session.endedAt) {
    res.status(200).json({
      message: "Reading session already ended",
      session: {
        id: String(session._id),
        minutes: session.minutes
      }
    });
    return;
  }

  const endedAt = new Date();
  const diffMs = endedAt.getTime() - session.startedAt.getTime();
  const minutes = Math.max(Math.round(diffMs / 60000), 1);
  session.endedAt = endedAt;
  session.minutes = minutes;
  await session.save();

  const policy = await getOrCreateChildPolicy(childId);
  const todaySessions = await ReadingSessionModel.find({
    childId,
    startedAt: {
      $gte: new Date(Date.UTC(endedAt.getUTCFullYear(), endedAt.getUTCMonth(), endedAt.getUTCDate()))
    },
    endedAt: { $ne: null }
  });
  const todayMinutes = todaySessions.reduce((sum, value) => sum + (value.minutes ?? 0), 0);

  res.status(200).json({
    message: "Reading session ended",
    session: {
      id: String(session._id),
      minutes: session.minutes,
      pagesRead: session.pagesRead.length,
      endedAt: session.endedAt
    },
    limits: {
      dailyLimitMinutes: policy.dailyLimitMinutes,
      consumedTodayMinutes: todayMinutes,
      remainingMinutes: Math.max(policy.dailyLimitMinutes - todayMinutes, 0)
    }
  });
});
