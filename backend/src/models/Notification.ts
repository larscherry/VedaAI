import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "assignment_completed" | "assignment_failed" | "assignment_processing" | "due_date" | "info";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  relatedId?: string;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["assignment_completed", "assignment_failed", "assignment_processing", "due_date", "info"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String, default: undefined },
    relatedId: { type: String, default: undefined },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
