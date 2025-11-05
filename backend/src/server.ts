// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";

// ✅ Connect MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow these frontend origins
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://my-react-app-sample-0-ilir.vercel.app", // your deployed Vercel frontend
];

// ✅ CORS setup (Render + Vercel friendly)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile/postman/no-origin
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight (important for Vercel→Render)
app.options("*", cors());

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

// ✅ Default root route (optional health check)
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend running successfully!");
});

// ✅ Global Error Handler
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
