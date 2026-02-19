import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  createChild,
  deleteParentChild,
  getChildAnalytics,
  getChildPolicy,
  getParentChildById,
  listParentChildren,
  updateChildPolicy,
  updateParentChild
} from "./parent.controller";
import {
  analyticsQuerySchema,
  childIdParamsSchema,
  createChildBodySchema,
  updateChildBodySchema,
  updatePolicyBodySchema
} from "./parent.schema";

const router = Router();

router.use(requireAuth, requireRole(ROLES.PARENT));

router.get("/children", listParentChildren);
router.post("/children", validate({ body: createChildBodySchema }), createChild);
router.get("/children/:id", validate({ params: childIdParamsSchema }), getParentChildById);
router.patch(
  "/children/:id",
  validate({ params: childIdParamsSchema, body: updateChildBodySchema }),
  updateParentChild
);
router.delete("/children/:id", validate({ params: childIdParamsSchema }), deleteParentChild);

router.get("/children/:id/policy", validate({ params: childIdParamsSchema }), getChildPolicy);
router.patch(
  "/children/:id/policy",
  validate({ params: childIdParamsSchema, body: updatePolicyBodySchema }),
  updateChildPolicy
);

router.get(
  "/children/:id/analytics",
  validate({ params: childIdParamsSchema, query: analyticsQuerySchema }),
  getChildAnalytics
);

export default router;
