import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";

// ✅ Connect to MongoDB
connectDB();

const exp = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins from environment + defaults
const allowedOrigins = [
  "http://localhost:5173", // local
  process.env.ALLOWED_ORIGIN, // deployed Vercel frontend
].filter(Boolean); // remove undefined

// ✅ Reusable CORS options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // allow
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies/tokens
};

// ✅ Apply CORS middleware globally
exp.use(cors(corsOptions));

// ✅ Handle preflight (OPTIONS) requests for all routes
exp.options("*", cors(corsOptions));

// ✅ Parse JSON
exp.use(express.json());

// ✅ Routes
exp.use("/api/customers", customerRoutes);
exp.use("/api/auth", authRoutes);

// ✅ Error handler
exp.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked: origin not allowed" });
  }
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start
exp.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
