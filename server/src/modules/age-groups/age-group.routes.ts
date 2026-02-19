import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  createAgeGroup,
  deleteAgeGroup,
  listAgeGroups,
  listPublicAgeGroups,
  updateAgeGroup
} from "./age-group.controller";
import {
  ageGroupIdParamsSchema,
  createAgeGroupBodySchema,
  updateAgeGroupBodySchema
} from "./age-group.schema";

const router = Router();

router.get("/public", listPublicAgeGroups);

router.get("/", requireAuth, requireRole(ROLES.ADMIN), listAgeGroups);
router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ body: createAgeGroupBodySchema }),
  createAgeGroup
);
router.patch(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ params: ageGroupIdParamsSchema, body: updateAgeGroupBodySchema }),
  updateAgeGroup
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ params: ageGroupIdParamsSchema }),
  deleteAgeGroup
);

export default router;
