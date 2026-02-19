import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  createBook,
  deleteBook,
  getAdminBookById,
  listAdminBooks,
  publishBook,
  reorderBookPages,
  reviewBook,
  unpublishBook,
  updateBook
} from "./book.controller";
import {
  adminBooksQuerySchema,
  bookIdParamsSchema,
  createBookBodySchema,
  reorderBookPagesBodySchema,
  reviewBookBodySchema,
  updateBookBodySchema
} from "./book.schema";

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/", validate({ query: adminBooksQuerySchema }), listAdminBooks);
router.get("/:id", validate({ params: bookIdParamsSchema }), getAdminBookById);
router.post("/", validate({ body: createBookBodySchema }), createBook);
router.patch(
  "/:id",
  validate({ params: bookIdParamsSchema, body: updateBookBodySchema }),
  updateBook
);
router.patch(
  "/:id/review",
  validate({ params: bookIdParamsSchema, body: reviewBookBodySchema }),
  reviewBook
);
router.patch(
  "/:id/pages/reorder",
  validate({ params: bookIdParamsSchema, body: reorderBookPagesBodySchema }),
  reorderBookPages
);
router.patch("/:id/publish", validate({ params: bookIdParamsSchema }), publishBook);
router.patch("/:id/unpublish", validate({ params: bookIdParamsSchema }), unpublishBook);
router.delete("/:id", validate({ params: bookIdParamsSchema }), deleteBook);

export default router;
