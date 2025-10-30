// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 verify attempts per IP in window
  message: "Too many verification attempts, please try again later.",
});

export const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many OTP resend requests, try again later.",
});
