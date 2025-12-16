import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ⛔ Never hardcode secrets — always from environment
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Extend Express Request to include userId and role
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: "user" | "admin";
    }
  }
}

/**
 * 🔐 Auth Middleware
 * Validates JWT and attaches userId + role to req
 */
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1️⃣ Get the token from Authorization header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization header missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    // 2️⃣ Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3️⃣ Extract user data from JWT
    req.userId = decoded.userId || decoded.id; // supporting both names
    req.role = decoded.role || "user"; // default role = user

    if (!req.userId) {
      return res.status(403).json({
        message: "Invalid token: user ID missing",
      });
    }

    // 4️⃣ Pass control to next middleware/route
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}
