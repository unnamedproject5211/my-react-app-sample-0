// src/controller/customerFileController.ts
import { Request, Response } from "express";
import Customer from "../models/customer";
import { uploadToCloudinary } from "../utils/cloudinaryUploader";
import cloudinary from "../config/cloudinary";

/**
 * Upload a file and push to customer.vehicles[index].files
 * Route: POST /vehicle/:customerId/:index  (multer single 'file')
 */
export const uploadVehicleFile = async (req: Request, res: Response) => {
  try {
    const { customerId, index } = req.params;
    const file = req.file as Express.Multer.File | undefined;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const customer = await Customer.findOne({
      customerId,
      userId: req.userId,
    });

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const upload = await uploadToCloudinary(file);

    const fileMeta = {
      url: upload.url,
      publicId: upload.publicId,
      originalName: file.originalname,
      uploadedAt: new Date(),
    };

    const idx = Number(index);

    // ✅ Ensure structure exists
    customer.vehicles = customer.vehicles || [];
    customer.vehicles[idx] = customer.vehicles[idx] || {
      vehicleNo: "",
      policyCompany: "",
      policyExpiry: "",
      files: [],
    };

    // ✅ If old file exists – delete from Cloudinary
    const oldFile = customer.vehicles[idx].files?.[0];
    if (oldFile?.publicId) {
      try {
        await cloudinary.uploader.destroy(oldFile.publicId, { resource_type: "raw" });
      } catch (err) {
        console.warn("Old file delete failed:", err);
      }
    }

    // ✅ Replace with single file
    customer.vehicles[idx].files = [fileMeta as any];

    await customer.save();

    return res.json({
      message: "File uploaded",
      file: customer.vehicles[idx].files[0],
    });
  } catch (err: any) {
    console.error("uploadVehicleFile error:", err);
    return res.status(500).json({ message: "Server error", error: err?.message || err });
  }
};

/**
 * Upload a file and push to customer.healthDetails[index].files
 * Route: POST /health/:customerId/:index  (multer single 'file')
 */
export const uploadHealthFile = async (req: Request, res: Response) => {
  try {
    const { customerId, index } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const customer = await Customer.findOne({
      customerId,
      userId: req.userId,
    });

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const upload = await uploadToCloudinary(file as any);

    const fileMeta = {
      url: upload.url,
      publicId: upload.publicId,
      originalName: file.originalname,
      uploadedAt: new Date(),
    };

    const idx = Number(index);

    customer.healthDetails = customer.healthDetails || [];
    customer.healthDetails[idx] = customer.healthDetails[idx] || {
      company: "",
      product: "",
      expiry: "",
      files: [],
    };

    const oldFile = customer.healthDetails[idx].files?.[0];
    if (oldFile?.publicId) {
      try {
        await cloudinary.uploader.destroy(oldFile.publicId, { resource_type: "raw" });
      } catch (err) {
        console.warn("Old file delete failed:", err);
      }
    }

    customer.healthDetails[idx].files = [fileMeta as any];

    await customer.save();

    return res.json({
      message: "File uploaded",
      file: customer.healthDetails[idx].files[0],
    });
  } catch (err: any) {
    console.error("uploadHealthFile error:", err);
    return res.status(500).json({ message: "Server error", error: err?.message || err });
  }
};


/**
 * DELETE a file from a policy's files array, and optionally delete from Cloudinary.
 * Route: DELETE /api/customers/:customerId/files
 * Body: { section: 'health'|'vehicles', index: number, fileId?: string, publicId?: string }
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { customerId } = req.params;

    const { section, index } = req.query as {
      section?: string;
      index?: string;
    };

    const idx = Number(index);

    if (!section || isNaN(idx)) {
      return res.status(400).json({ message: "Missing section or index" });
    }

    const customer = await Customer.findOne({ customerId, userId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const collection =
      section === "health"
        ? customer.healthDetails
        : customer.vehicles;

    if (!collection?.[idx]) {
      return res.status(400).json({ message: "Invalid index" });
    }

    const oldFile = collection[idx].files?.[0];

    if (oldFile?.publicId) {
      try {
        await cloudinary.uploader.destroy(oldFile.publicId, {
          resource_type: "raw",
        });
      } catch (err) {
        console.warn("Cloud delete failed:", err);
      }
    }

    // ✅ Clear file
    collection[idx].files = [];

    await customer.save();

    res.json({ success: true, message: "File deleted" });
  } catch (err: any) {
    console.error("deleteFile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


