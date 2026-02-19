import { API_ENDPOINTS } from "@/utils/constants";
import { uploadFile } from "@/api/client";

interface UploadedImageFile {
   secureUrl: string;
   publicId: string;
   bytes: number;
   format: string;
}

interface UploadImageResponse {
   message: string;
   file: UploadedImageFile;
}

export const uploadImage = async (
   file: File,
   onProgress?: (progress: number) => void
): Promise<UploadedImageFile> => {
   const formData = new FormData();
   formData.append("file", file);

   const response = await uploadFile<UploadImageResponse>(
      API_ENDPOINTS.UPLOADS.IMAGE,
      formData,
      onProgress
   );

   return response.file;
};

