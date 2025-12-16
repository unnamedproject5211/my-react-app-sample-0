import { Schema } from "mongoose";

export interface FileMeta {
  url: string;      // Cloudinary secure url
  publicId: string; // Cloudinary public_id
  uploadedAt: Date;
  originalName: string;   // ✅ ADD THIS
   _id?: any;    
}

export const FileSchema = new Schema<FileMeta>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  originalName: {type: String } 
});
