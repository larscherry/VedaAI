import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  filePath: string | null;
  fileContent: string | null;
  dueDate: Date;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  instructions: string;
  subject: string;
  className: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    filePath: { type: String, default: null },
    fileContent: { type: String, default: null },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length > 0, "At least one question type required"],
    },
    numQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    instructions: { type: String, default: "" },
    subject: { type: String, default: "" },
    className: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
