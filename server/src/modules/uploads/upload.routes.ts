import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { uploadFile, uploadImage } from "./upload.controller";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../types/auth";

const router = Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new HttpError(400, "Only image files are allowed"));
      return;
    }
    callback(null, true);
  }
});

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      callback(new HttpError(400, "Only PDF files are allowed"));
      return;
    }
    callback(null, true);
  }
});

router.post("/image", requireAuth, requireRole(ROLES.ADMIN), imageUpload.single("file"), uploadImage);
router.post("/file", requireAuth, requireRole(ROLES.ADMIN), fileUpload.single("file"), uploadFile);

export default router;
