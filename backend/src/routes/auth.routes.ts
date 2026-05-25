import { Router, Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { hashPassword, comparePassword } from "../services/authService";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId, name, email, password, subject, school, location, className } = req.body;
    if (!teacherId || !name || !email || !password) {
      res.status(400).json({ error: "teacherId, name, email, and password are required" });
      return;
    }
    const result = await registerUser({ teacherId, name, email, password, subject, school, location, className });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId, password } = req.body;
    if (!teacherId || !password) {
      res.status(400).json({ error: "teacherId and password are required" });
      return;
    }
    const result = await loginUser(teacherId, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password -__v");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/profile", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, subject, school, location, className } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name, subject, school, location, className } },
      { new: true }
    ).select("-password -__v");
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/apikey", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { apiKey } = req.body;
    await User.findByIdAndUpdate(req.userId, { $set: { apiKey } });
    res.json({ message: "API key updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/mockmode", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mockMode } = req.body;
    await User.findByIdAndUpdate(req.userId, { $set: { mockMode: !!mockMode } });
    res.json({ message: "Mock mode updated", mockMode: !!mockMode });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/llmconfig", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { llmBaseUrl, llmModel } = req.body;
    await User.findByIdAndUpdate(req.userId, { $set: { llmBaseUrl: llmBaseUrl || "", llmModel: llmModel || "" } });
    res.json({ message: "LLM config updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/password", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const match = await comparePassword(currentPassword, user.password);
    if (!match) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
