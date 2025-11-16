// src/utils/otp.ts
import crypto from "crypto";

export const generateOtp = (length = 6): string => {
  // allow leading zeros
  const min = 0;
  const max = Math.pow(10, length) - 1;
  const num = Math.floor(Math.random() * (max - min + 1));
  return String(num).padStart(length, "0");
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};
