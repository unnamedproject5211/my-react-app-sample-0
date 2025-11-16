import { Router } from "express";
import { login, register , verifyOtp , resendOtp } from "../controller/authController";
import { verifyLimiter , resendLimiter } from "../middleware/rateLimit";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyLimiter , verifyOtp);
router.post("/resend-otp", resendLimiter , resendOtp);

// Example protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "This is protected data", userId: (req as any).user.id });
});

export default router;
