// src/controllers/customerController.ts
import { Request, Response } from "express";
import Customer from "../models/customer";
import { uploadToCloudinary } from "../utils/cloudinaryUploader";
import type { ICustomer } from "../models/customer"
import type { FileMeta } from "../models/File";        // type-only import
import type { Document } from "mongoose";
/**
 * Create new customer with file uploads (Health + Motor)
 */
export const createCustomer = async (req: Request, res: Response) => {
   // ---- DEBUG LOGS ----
    console.log("🟩 DEBUG START ---------------------------");
    console.log("Headers:", req.headers["content-type"]);
    console.log("Is multipart? →", req.headers["content-type"]?.includes("multipart/form-data"));
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files:", req.files);
    console.log("🟩 DEBUG END -----------------------------");
    // ---------------------
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    console.log("📥 Received request body keys:", Object.keys(req.body));
    console.log("📥 customerData field:", req.body.customerData);
    console.log("📁 Files received:", req.files);

     // ✅ Validate customerData exists
    if (!req.body.customerData) {
      return res.status(400).json({ 
        message: "Missing customerData in request",
        receivedFields: Object.keys(req.body)
      });
    }
     // Parse the customer data from request body
    let payload;
    try {
      payload = JSON.parse(req.body.customerData);
    } catch (parseError: any) {
      console.error("❌ JSON parse error:", parseError);
      return res.status(400).json({ 
        message: "Invalid JSON in customerData",
        error: parseError.message,
        receivedData: req.body.customerData
      });
    }

    console.log("✅ Parsed payload:", payload);

    // Cast req.files as Express.Multer.File[]
    const files = req.files as Express.Multer.File[] | undefined;

    // -----------------------------
    // 🔵 Upload HEALTH files
    // -----------------------------
    if (payload.healthDetails?.length > 0) {
      payload.healthDetails = await Promise.all(
        payload.healthDetails.map(async (item: any, index: number) => {
          const matchingFiles = (files || []).filter(
            (f) => f.fieldname === `health_${index}`
          );

          const uploads = await Promise.all(
            matchingFiles.map((file) => uploadToCloudinary(file))
            
          );

          return {
            ...item,
            files: uploads,
          };
        })
      );
    }

    // -----------------------------
    // 🔵 Upload VEHICLE files
    // -----------------------------
    if (payload.vehicles?.length > 0) {
      payload.vehicles = await Promise.all(
        payload.vehicles.map(async (item: any, index: number) => {
          const matchingFiles = (files || []).filter(
            (f) => f.fieldname === `vehicle_${index}`
          );
           // Log each file before upload
      matchingFiles.forEach((file) => {
        console.log("Uploading VEHICLE file to Cloudinary:", file.originalname);
      });

          const uploads = await Promise.all(
            matchingFiles.map((file) => uploadToCloudinary(file))

          );
          

          return {
            ...item,
            files: uploads,
            
          };
        })
      );
    }

    // Auto counts
    payload.healthCount = payload.healthDetails?.length || 0;
    payload.vehicleCount = payload.vehicles?.length || 0;

    // Create customer in DB
    const newCustomer = await Customer.create({
      ...payload,
      userId,
    });

    return res.status(201).json(newCustomer);
  } catch (err: any) {
    console.error("createCustomer error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get all customers
 */

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const customers = await Customer.find({ userId })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(customers);
  } catch (err: any) {
    console.error("getCustomers error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get customer by ID
 */
type LeanICustomer = Omit<ICustomer, keyof Document>;
type HealthDetail = LeanICustomer['healthDetails'] extends Array<infer U> ? U : any;
type VehicleDetail = LeanICustomer['vehicles'] extends Array<infer U> ? U : any;
//If healthDetails is an array of something,then take the type of one item inside the array ,
// otherwise use any.

export const getCustomerByCustomerId = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // use lean() to get a plain JS object and type it
    const customer = (await Customer.findOne({ customerId: id, userId }).lean()) as LeanICustomer | null;

    if (!customer) {
      return res.status(404).json({ message: "Customer not found or unauthorized" });
    }

    // DEBUG raw
    console.log("DEBUG — raw customer (lean):", JSON.stringify(customer, null, 2));

    // Normalize nested files while preserving types
    if (customer.healthDetails) {
      customer.healthDetails = customer.healthDetails.map((h: HealthDetail) => ({
        ...h,
        files: (h.files || []).map((f: FileMeta) => ({
          url: f.url,
          publicId: f.publicId,
          originalName: f.originalName,
          uploadedAt: f.uploadedAt,
          _id: f._id,
        })),
      }));
    }

    if (customer.vehicles) {
      customer.vehicles = customer.vehicles.map((v: VehicleDetail) => ({
        ...v,
        files: (v.files || []).map((f: FileMeta) => ({
          url: f.url,
          publicId: f.publicId,
          originalName: f.originalName,
          uploadedAt: f.uploadedAt,
          _id: f._id,
        })),
      }));
    }

    // DEBUG final
    console.log("DEBUG — normalized healthDetails:", JSON.stringify(customer.healthDetails, null, 2));

    return res.json(customer);
  } catch (err: any) {
    console.error("getCustomerByCustomerId error:", err);
    return res.status(500).json({ message: "Server error", error: err.message || err });
  }
};


/**
 * Update customer (no file upload here)
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const updates = req.body;

    updates.healthCount = updates.healthDetails?.length || 0;
    updates.vehicleCount = updates.vehicles?.length || 0;

    // ✅ Preserve existing files if frontend didn’t send new ones
    // new
    const existing = await Customer.findOne({ customerId: id, userId });

    if (!existing) {
      return res
        .status(404)
        .json({ message: "Customer not found or unauthorized" });
    }

    // merge file data
    const mergeFiles = (oldArr: any[], newArr: any[]) =>
      newArr.map((item: any, index: number) => ({
        ...item,
        files:
          item.files && item.files.length
            ? item.files
            : oldArr?.[index]?.files || [],
      }));

    if (updates.healthDetails) {
      updates.healthDetails = mergeFiles(
        existing.healthDetails,
        updates.healthDetails
      );
    }

    if (updates.vehicles) {
      updates.vehicles = mergeFiles(
        existing.vehicles,
        updates.vehicles
      );
    }
    // end new

    const updated = await Customer.findOneAndUpdate(
      { customerId: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Customer not found or unauthorized" });
    }

    return res.json(updated);
  } catch (err: any) {
    console.error("updateCustomer error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};