// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User";
import { generateOtp, hashOtp } from "../utils/otp";
import { sendOtpEmail } from "../utils/emailOTP"; // or smtp version

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const OTP_EXPIRY_MINUTES = 10;
const RESEND_MIN_INTERVAL_MS = 60 * 1000; // 1 min

// ========== REGISTER ==========
export const register = async (req: Request, res: Response) => {
  console.log("📥 Incoming Register Request Body:", req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password){
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields required" });
    }
    if (!validator.isEmail(email)){
      console.log(" Invalid email format:", email);
      return res.status(400).json({ message: "Invalid email" });
    }
    //check existing user
    const existing = await User.findOne({ email });
    if (existing){
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    //generate otp + password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp(6);
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    console.log("🧩 Generated OTP:", otp, " Expiry:", otpExpires);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otpHash,
      otpExpires,
      lastOtpSentAt: new Date(),
    });

    await user.save();
    console.log("💾 User saved successfully in DB:", email);


       // 5️⃣ Log environment before sending mail
    console.log("📦 SMTP ENV:", {
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? "***" : "❌ MISSING",
    });
    
  // 6️⃣ Send OTP email (debug wrapped)
    try {
      console.log("📨 Calling sendOtpEmail() for:", email);
      await sendOtpEmail(email, otp);
      console.log("✅ sendOtpEmail completed successfully");
    } catch (mailError) {
      console.error("❌ sendOtpEmail threw an error:", mailError);
      return res
        .status(500)
        .json({ message: "Failed to send OTP email", error: mailError });
    }


    res.status(201).json({
      message: "User registered. OTP sent to email.",
      email: user.email,
    });
  } catch (err) {
    console.error("🔥 General register() error:", err);
    res.status(500).json({ message: "Server error" });
  }
  console.log(req.body);
};

// ========== VERIFY OTP ==========
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    if (!user.otpHash || !user.otpExpires)
      return res.status(400).json({ message: "No OTP found" });

    if (user.otpExpires.getTime() < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    if (hashOtp(otp) !== user.otpHash)
      return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "23h" });
    res.json({ message: "Email verified successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ========== RESEND OTP ==========
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const last = user.lastOtpSentAt ? user.lastOtpSentAt.getTime() : 0;
    if (Date.now() - last < RESEND_MIN_INTERVAL_MS)
      return res
        .status(429)
        .json({ message: "Please wait before resending OTP" });

    const otp = generateOtp(6);
    user.otpHash = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP resent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ========== LOGIN ==========
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Email not verified. Please verify first." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "23h" });
    res.json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
