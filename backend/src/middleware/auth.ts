import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService";

export interface AuthRequest extends Request {
  userId?: string;
  teacherId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  // Check Authorization header first
  const header = req.headers.authorization;
  let token: string | null = null;

  if (header && header.startsWith("Bearer ")) {
    token = header.slice(7);
  }

  // Fall back to query parameter (for PDF download links)
  if (!token && typeof req.query.token === "string") {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    req.teacherId = decoded.teacherId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
