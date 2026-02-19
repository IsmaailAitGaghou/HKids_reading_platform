import { Request, Response } from "express";
import { uploadImageBuffer } from "../../config/cloudinary";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new HttpError(400, "No image file received");
  }

  const uploaded = await uploadImageBuffer(req.file.buffer);

  res.status(201).json({
    message: "Image uploaded",
    file: uploaded
  });
});
