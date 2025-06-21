import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import connectDB from "./mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  // Try to get token from Authorization header first
  let token = request.headers.get("authorization")?.replace("Bearer ", "");

  // If no Authorization header, try to get from cookies
  if (!token) {
    token = request.cookies.get("auth-token")?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();

  const user = await User.findById(payload.userId)
    .select("_id email displayName")
    .lean();

  if (!user) return null;

  return {
    id: user?._id.toString(),
    email: user?.email,
    displayName: user?.displayName,
  };
}

export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
