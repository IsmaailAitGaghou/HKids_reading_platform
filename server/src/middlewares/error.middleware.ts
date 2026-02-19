import { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/httpError";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? null
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({
    message: "Internal server error",
    details: message
  });
};
