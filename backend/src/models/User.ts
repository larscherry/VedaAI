import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  teacherId: string;
  name: string;
  email: string;
  password: string;
  subject: string;
  school: string;
  location: string;
  className: string;
  apiKey: string;
  mockMode: boolean;
  llmBaseUrl: string;
  llmModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    teacherId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    subject: { type: String, default: "" },
    school: { type: String, default: "" },
    location: { type: String, default: "" },
    className: { type: String, default: "" },
    apiKey: { type: String, default: "" },
    mockMode: { type: Boolean, default: true },
    llmBaseUrl: { type: String, default: "" },
    llmModel: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
