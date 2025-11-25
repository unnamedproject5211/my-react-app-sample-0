// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import {startExpiryReminderJob} from "./tasks/expiryReminderJob";



// ✅ Connect MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins
const allowedOrigins: string[] = [
  "http://localhost:5173", // local dev
  process.env.ALLOWED_ORIGIN || "", // main vercel domain
];

// ✅ CORS setup
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow if no origin (like Postman) or in allowed list or any subdomain of vercel.app
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS middleware globally
app.use(cors(corsOptions));

// ✅ Preflight (important for Vercel → Render)
app.options("*", cors(corsOptions));

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);


if (process.env.NODE_ENV === "production") {
  console.log("🕒 Running expiry reminder cron locally...");
  startExpiryReminderJob();
}

// ✅ Root test route
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend running successfully on Render!");
});

// ✅ Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked: origin not allowed" });
  }
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
