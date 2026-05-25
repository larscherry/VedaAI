import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import Notification from "../models/Notification";
import { Assignment } from "../models/Assignment";
import { createNotification } from "../services/notificationService";

const router = Router();
router.use(authMiddleware);

async function checkDueAssignments(userId: string) {
  try {
    const now = new Date();
    const dueAssignments = await Assignment.find({
      userId,
      dueDate: { $lte: now },
      status: { $ne: "completed" },
    });

    for (const assignment of dueAssignments) {
      const existing = await Notification.findOne({
        userId,
        relatedId: assignment._id.toString(),
        type: "due_date",
      });
      if (!existing) {
        await createNotification({
          userId,
          type: "due_date",
          title: "Assignment Due",
          message: `"${assignment.title}" is overdue. Due was ${assignment.dueDate.toLocaleDateString()}.`,
          link: `/assignments`,
          relatedId: assignment._id.toString(),
        });
      }
    }
  } catch {
    // silently fail - non-critical
  }
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { limit = "20", unread } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (unread === "true") filter.read = false;

    // Check for due assignments (non-blocking)
    checkDueAssignments(req.userId!);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit as string, 10) || 20, 100))
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true }
    );
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

router.put("/read-all", async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
