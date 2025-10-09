import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { login, register } from "../controller/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Example protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "This is protected data", userId: (req as any).user.id });
});

export default router;
