import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  endReading,
  getKidsBook,
  getKidsBookPages,
  getKidsBookResume,
  listKidsBooks,
  startReading,
  trackReadingProgress
} from "./kids.controller";
import {
  bookIdParamsSchema,
  endReadingBodySchema,
  readingProgressBodySchema,
  startReadingBodySchema
} from "./kids.schema";

const router = Router();

router.use(requireAuth, requireRole(ROLES.CHILD));

router.get("/books", listKidsBooks);
router.get("/books/:id", validate({ params: bookIdParamsSchema }), getKidsBook);
router.get("/books/:id/pages", validate({ params: bookIdParamsSchema }), getKidsBookPages);
router.get("/books/:id/resume", validate({ params: bookIdParamsSchema }), getKidsBookResume);

router.post("/reading/start", validate({ body: startReadingBodySchema }), startReading);
router.post("/reading/progress", validate({ body: readingProgressBodySchema }), trackReadingProgress);
router.post("/reading/end", validate({ body: endReadingBodySchema }), endReading);

export default router;
