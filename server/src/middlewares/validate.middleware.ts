import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError";

interface ValidateShape {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export const validate = ({ body, params, query }: ValidateShape): RequestHandler => {
  return (req, _res, next) => {
    if (body) {
      const parsed = body.safeParse(req.body);
      if (!parsed.success) {
        next(new HttpError(400, "Invalid request body", parsed.error.flatten()));
        return;
      }
      (req as unknown as { body: unknown }).body = parsed.data;
    }

    if (params) {
      const parsed = params.safeParse(req.params);
      if (!parsed.success) {
        next(new HttpError(400, "Invalid request params", parsed.error.flatten()));
        return;
      }
      (req as unknown as { params: unknown }).params = parsed.data;
    }

    if (query) {
      const parsed = query.safeParse(req.query);
      if (!parsed.success) {
        next(new HttpError(400, "Invalid request query", parsed.error.flatten()));
        return;
      }
      (req as unknown as { query: unknown }).query = parsed.data;
    }

    next();
  };
};
