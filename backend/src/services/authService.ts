import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "vedaai-jwt-secret-dev-only";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user._id.toString(), teacherId: user.teacherId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): { id: string; teacherId: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string; teacherId: string };
}

export async function registerUser(data: {
  teacherId: string;
  name: string;
  email: string;
  password: string;
  subject?: string;
  school?: string;
  location?: string;
  className?: string;
}) {
  const existing = await User.findOne({
    $or: [{ teacherId: data.teacherId }, { email: data.email }],
  });
  if (existing) {
    throw new Error("Teacher ID or email already exists");
  }

  const hashed = await hashPassword(data.password);
  const user = await User.create({ ...data, password: hashed });
  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      teacherId: user.teacherId,
      name: user.name,
      email: user.email,
      subject: user.subject,
      school: user.school,
      location: user.location,
      className: user.className,
      apiKey: user.apiKey,
      mockMode: user.mockMode,
    },
  };
}

export async function loginUser(teacherId: string, password: string) {
  const user = await User.findOne({ teacherId });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      teacherId: user.teacherId,
      name: user.name,
      email: user.email,
      subject: user.subject,
      school: user.school,
      location: user.location,
      className: user.className,
      apiKey: user.apiKey,
      mockMode: user.mockMode,
    },
  };
}
