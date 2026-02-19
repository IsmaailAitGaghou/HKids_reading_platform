import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerDocument } from "./docs/swagger";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import ageGroupRoutes from "./modules/age-groups/age-group.routes";
import authRoutes from "./modules/auth/auth.routes";
import bookRoutes from "./modules/books/book.routes";
import categoryRoutes from "./modules/categories/category.routes";
import healthRoutes from "./modules/health/health.routes";
import kidsRoutes from "./modules/kids/kids.routes";
import parentRoutes from "./modules/parent/parent.routes";
import uploadRoutes from "./modules/uploads/upload.routes";

export const app = express();

const corsOrigin =
  env.CORS_ORIGIN === "*"
    ? true
    : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "HKids API",
    version: "0.1.0",
    docs: "/docs"
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/age-groups", ageGroupRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/parent", parentRoutes);
app.use("/api/v1/kids", kidsRoutes);
app.use("/api/v1/admin/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
