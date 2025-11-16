import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ✅ Always keep secrets in environment variables (never hardcode)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Extend Express's Request interface to safely add `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user ID to request
 */
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1️⃣ Get token from "Authorization" header (format: "Bearer <token>")
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  // 2️⃣ If no token, deny access
  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    // 3️⃣ Verify token using secret key
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 4️⃣ Attach the user's ID to the request object
    req.userId = decoded.id;

    // 5️⃣ Move on to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
