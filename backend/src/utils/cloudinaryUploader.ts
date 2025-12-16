// src/utils/cloudinaryUploader.ts

import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

/* ✅ NEW — Always define the return type */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  originalName:string;
}

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "trustedata",
        resource_type: "raw",
        type: "private"
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Upload failed"));


        resolve({
          url: result?.secure_url || "",
          publicId: result?.public_id || "",
          originalName:file.originalname || "",
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(upload);
  });
};
