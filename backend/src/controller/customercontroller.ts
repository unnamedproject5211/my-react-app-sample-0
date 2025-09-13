// src/controllers/customerController.ts
import { Request, Response } from "express";
import Customer from "../models/customer";

/**
 * Create a new customer document in MongoDB
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    // Request body should match your frontend structure
    const payload = req.body;

    // Basic server-side validation (expand as needed)
    if (!payload.customerId || !payload.customerName) {
      return res.status(400).json({ message: "customerId and customerName required" });
    }

    // Optionally sanitize/transform fields (e.g. ensure counts match array lengths)
    if (payload.healthCount && Array.isArray(payload.healthDetails)) {
      payload.healthCount = payload.healthDetails.length;
    }
    if (payload.vehicleCount && Array.isArray(payload.vehicles)) {
      payload.vehicleCount = payload.vehicles.length;
    }

    // Create & save
    const customer = new Customer(payload);
    const saved = await customer.save();
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error("createCustomer error:", err);
    // handle duplicate key error for unique customerId
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate customerId" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get all customers (simple)
 */
export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }).limit(100);
    return res.json(customers);
  } catch (err: any) {
    console.error("getCustomers error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get single customer by id (customerId)
 */
export const getCustomerByCustomerId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id is customerId
    const customer = await Customer.findOne({ customerId: id });
    if (!customer) return res.status(404).json({ message: "Not found" });
    return res.json(customer);
  } catch (err: any) {
    console.error("getCustomerByCustomerId error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
