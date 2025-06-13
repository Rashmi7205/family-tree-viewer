import { NextResponse } from "next/server";
import {
  verifyFirebaseToken,
  getTokenFromRequest,
} from "@/lib/auth/verify-token";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Reset onboarding data
    const user = await User.findOneAndUpdate(
      { uid: decodedToken.user_id },
      {
        $set: {
          onboardingComplete: false,
          profileComplete: false,
        },
        $unset: {
          phoneNumber: 1,
          phoneNumberTemp: 1,
          profile: 1,
          address: 1,
          otp: 1,
          otpExpiry: 1,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Onboarding reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to reset onboarding" },
      { status: 500 }
    );
  }
}
