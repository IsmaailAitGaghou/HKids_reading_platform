import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ROLES } from "../../types/auth";
import {
  getAdminOverviewAnalytics,
  getAdminReadingAnalytics,
  getTopBooksAnalytics
} from "./analytics.controller";
import { analyticsRangeQuerySchema } from "./analytics.schema";

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/overview", getAdminOverviewAnalytics);
router.get("/reading", validate({ query: analyticsRangeQuerySchema }), getAdminReadingAnalytics);
router.get("/books/top", validate({ query: analyticsRangeQuerySchema }), getTopBooksAnalytics);

export default router;
