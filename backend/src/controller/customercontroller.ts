// src/controllers/customerController.ts
import { Request, Response } from "express";
import Customer from "../models/customer";

/**
 * ✅ Create a new customer document linked to the logged-in user
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    // Ensure userId is available from authMiddleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const payload = req.body;

    // Basic validation
    if (!payload.customerId || !payload.customerName) {
      return res.status(400).json({ message: "customerId and customerName are required" });
    }

    // Recalculate counts
    if (Array.isArray(payload.healthDetails)) {
      payload.healthCount = payload.healthDetails.length;
    }
    if (Array.isArray(payload.vehicles)) {
      payload.vehicleCount = payload.vehicles.length;
    }

    // ✅ Attach logged-in user's ID
    const customer = new Customer({
      ...payload,
      userId,
    });

    const saved = await customer.save();
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error("createCustomer error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate customerId" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get all customers belonging to the logged-in user
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // ✅ Fetch only customers created by this user
    const customers = await Customer.find({ userId }).sort({ createdAt: -1 }).limit(100);
    return res.json(customers);
  } catch (err: any) {
    console.error("getCustomers error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get a single customer by customerId (only if it belongs to the logged-in user)
 */
export const getCustomerByCustomerId = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // id = customerId

    const customer = await Customer.findOne({ customerId: id, userId });
    if (!customer) return res.status(404).json({ message: "Customer not found or unauthorized" });

    return res.json(customer);
  } catch (err: any) {
    console.error("getCustomerByCustomerId error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Update customer by customerId (only if owned by the logged-in user)
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;

    if (Array.isArray(updates.healthDetails)) {
      updates.healthCount = updates.healthDetails.length;
    }
    if (Array.isArray(updates.vehicles)) {
      updates.vehicleCount = updates.vehicles.length;
    }

    // ✅ Update only if this customer's userId matches the logged-in user
    const updated = await Customer.findOneAndUpdate(
      { customerId: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Customer not found or unauthorized" });
    }

    return res.json(updated);
  } catch (err: any) {
    console.error("updateCustomer error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
