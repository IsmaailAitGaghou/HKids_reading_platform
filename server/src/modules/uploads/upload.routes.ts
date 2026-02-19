import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { uploadImage } from "./upload.controller";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../types/auth";

const router = Router();

const upload = multer({
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

router.post("/image", requireAuth, requireRole(ROLES.ADMIN), upload.single("file"), uploadImage);

export default router;
