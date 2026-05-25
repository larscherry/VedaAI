import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  number: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  answerKey: string[];
  subject: string;
  className: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    marks: { type: Number, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      unique: true,
    },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [String], default: [] },
    subject: { type: String, default: "" },
    className: { type: String, default: "" },
  },
  { timestamps: true }
);

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  "QuestionPaper",
  QuestionPaperSchema
);
