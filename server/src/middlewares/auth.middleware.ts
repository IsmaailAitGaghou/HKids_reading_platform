import { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyToken } from "../utils/token";
import { HttpError } from "../utils/httpError";
import { Role } from "../types/auth";

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
};

export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.header("authorization"));
  if (!token) {
    next(new HttpError(401, "Authorization token is required"));
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    next(new HttpError(401, "Invalid or expired token"));
    return;
  }

  req.auth = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    parentId: payload.parentId
  };
  next();
};

export const attachAuthIfPresent: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = extractBearerToken(req.header("authorization"));
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.auth = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        parentId: payload.parentId
      };
    }
  }
  next();
};

export const requireRole = (...roles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new HttpError(401, "Not authenticated"));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new HttpError(403, "Forbidden"));
      return;
    }
    next();
  };
};
