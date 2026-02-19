import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  createCategory,
  deleteCategory,
  listCategories,
  listPublicCategories,
  updateCategory
} from "./category.controller";
import {
  categoryIdParamsSchema,
  categoryQuerySchema,
  createCategoryBodySchema,
  updateCategoryBodySchema
} from "./category.schema";

const router = Router();

router.get("/public", listPublicCategories);

router.get(
  "/",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ query: categoryQuerySchema }),
  listCategories
);
router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ body: createCategoryBodySchema }),
  createCategory
);
router.patch(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ params: categoryIdParamsSchema, body: updateCategoryBodySchema }),
  updateCategory
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ params: categoryIdParamsSchema }),
  deleteCategory
);

export default router;
