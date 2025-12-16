// src/routes/customerRoutes.ts
import { Router } from "express";
import { createCustomer, getCustomers, getCustomerByCustomerId ,updateCustomer } from "../controller/customercontroller";
import authMiddleware from "../middleware/authMiddleware"; 
import {upload} from "../middleware/upload"


const router = Router();

// POST /api/customers  -> create
router.post("/", authMiddleware, upload.any(), createCustomer);

// GET /api/customers -> list
router.get("/", authMiddleware, getCustomers);

// GET /api/customers/:id -> get by customerId
router.get("/:id", authMiddleware, getCustomerByCustomerId);

// PUT /api/customers/:id -> update the customer by id
router.put("/:id",authMiddleware, updateCustomer);

export default router;
