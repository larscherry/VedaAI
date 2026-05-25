import mongoose, { Schema, Document } from "mongoose";

export interface IStudent {
  name: string;
  rollNumber: string;
  email: string;
}

export interface IGroup extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  students: IStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroup>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    students: { type: [StudentSchema], default: [] },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>("Group", GroupSchema);
