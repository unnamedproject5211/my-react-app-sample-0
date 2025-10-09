import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes"
import customerRoutes from "./routes/customerRoutes";

connectDB();

const exp = express();
const PORT = process.env.PORT || 5000;

//middleware
exp.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*", // safer in production
    credentials: true,
  })
);
exp.use(express.json());

//routes
exp.use("/api/customers", customerRoutes);
exp.use("/api/auth",authRoutes);

exp.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});