import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { HttpError } from "../utils/httpError";

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
}

interface UploadResult {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format: string;
}

export const uploadImageBuffer = async (
  buffer: Buffer,
  folder = "hkids/books"
): Promise<UploadResult> => {
  if (!isConfigured) {
    throw new HttpError(500, "Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format
        });
      }
    );
    stream.end(buffer);
  });
};
