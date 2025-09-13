// src/routes/customerRoutes.ts
import { Router } from "express";
import { createCustomer, getCustomers, getCustomerByCustomerId } from "../controller/customercontroller";

const router = Router();

// POST /api/customers  -> create
router.post("/", createCustomer);

// GET /api/customers -> list
router.get("/", getCustomers);

// GET /api/customers/:id -> get by customerId
router.get("/:id", getCustomerByCustomerId);

export default router;
