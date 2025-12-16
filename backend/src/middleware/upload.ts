// src/middleware/upload.ts
import multer from "multer";

// memory storage so we can stream buffers to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
