import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { BookModel } from "../books/book.model";
import { ChildModel } from "../children/child.model";
import { ReadingSessionModel } from "../children/reading-session.model";
import { UserModel } from "../auth/auth.model";
import { ROLES } from "../../types/auth";

export const getAdminOverviewAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalParents, totalChildren, totalBooks, publishedBooks, sessionStats] = await Promise.all([
    UserModel.countDocuments({ role: ROLES.PARENT, isActive: true }),
    ChildModel.countDocuments({ isActive: true }),
    BookModel.countDocuments(),
    BookModel.countDocuments({ status: "published", visibility: "public", isApproved: true }),
    ReadingSessionModel.aggregate([
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: "$minutes" },
          totalSessions: { $sum: 1 }
        }
      }
    ])
  ]);

  res.status(200).json({
    overview: {
      totalParents,
      totalChildren,
      totalBooks,
      publishedBooks,
      totalSessions: sessionStats[0]?.totalSessions ?? 0,
      totalMinutesRead: sessionStats[0]?.totalMinutes ?? 0
    }
  });
});

export const getAdminReadingAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: Date; to?: Date };
  const match: Record<string, unknown> = {};

  if (from || to) {
    match.startedAt = {};
    if (from) {
      (match.startedAt as Record<string, unknown>).$gte = from;
    }
    if (to) {
      (match.startedAt as Record<string, unknown>).$lte = to;
    }
  }

  const rows = await ReadingSessionModel.aggregate([
    { $match: match },
    {
      $project: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
        minutes: "$minutes"
      }
    },
    {
      $group: {
        _id: "$day",
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: "$minutes" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    rows: rows.map((row) => ({
      day: row._id,
      totalSessions: row.totalSessions,
      totalMinutes: row.totalMinutes
    }))
  });
});

export const getTopBooksAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: Date; to?: Date };
  const match: Record<string, unknown> = {};
  if (from || to) {
    match.startedAt = {};
    if (from) {
      (match.startedAt as Record<string, unknown>).$gte = from;
    }
    if (to) {
      (match.startedAt as Record<string, unknown>).$lte = to;
    }
  }

  const top = await ReadingSessionModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$bookId",
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: "$minutes" }
      }
    },
    { $sort: { totalMinutes: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "book"
      }
    },
    { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        bookId: "$_id",
        title: "$book.title",
        totalSessions: 1,
        totalMinutes: 1
      }
    }
  ]);

  res.status(200).json({
    topBooks: top
  });
});
