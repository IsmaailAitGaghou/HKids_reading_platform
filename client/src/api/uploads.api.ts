import { API_ENDPOINTS } from "@/utils/constants";
import { uploadFile } from "@/api/client";

interface UploadedImageFile {
   secureUrl: string;
   publicId: string;
   bytes: number;
   format: string;
}

interface UploadedFile {
   secureUrl: string;
   publicId: string;
   bytes: number;
   format: string;
}

interface UploadImageResponse {
   message: string;
   file: UploadedImageFile;
}

interface UploadFileResponse {
   message: string;
   file: UploadedFile;
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

export const uploadPdfFile = async (
   file: File,
   onProgress?: (progress: number) => void
): Promise<UploadedFile> => {
   const formData = new FormData();
   formData.append("file", file);

   const response = await uploadFile<UploadFileResponse>(
      API_ENDPOINTS.UPLOADS.FILE,
      formData,
      onProgress
   );

   return response.file;
};
