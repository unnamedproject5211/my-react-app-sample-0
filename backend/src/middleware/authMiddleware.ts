import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}
