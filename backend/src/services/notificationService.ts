import Notification from "../models/Notification";

type NotificationType = "assignment_completed" | "assignment_failed" | "assignment_processing" | "due_date" | "info";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
}) {
  try {
    await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      relatedId: params.relatedId,
    });
  } catch {
    // Silently fail - notifications are non-critical
  }
}
