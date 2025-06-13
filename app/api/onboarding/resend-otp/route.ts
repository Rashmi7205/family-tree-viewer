import { NextResponse } from "next/server";

import { sendOTP } from "@/lib/sms/send-sms";
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

    // Get user with temporary phone number
    const user = await User.findOne({ uid: decodedToken.user_id });

    if (!user || !user.phoneNumberTemp) {
      return NextResponse.json(
        { error: "No pending phone verification found" },
        { status: 400 }
      );
    }

    // Check if enough time has passed since last OTP (prevent spam)
    if (user.otpExpiry && user.otpExpiry > new Date(Date.now() - 30 * 1000)) {
      const remainingTime = Math.ceil(
        (user.otpExpiry.getTime() - (Date.now() - 30 * 1000)) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${remainingTime} seconds before requesting a new OTP`,
        },
        { status: 429 }
      );
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP in user document with new expiry
    await User.findOneAndUpdate(
      { uid: decodedToken.user_id },
      {
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    );

    // Send new OTP via SMS
    await sendOTP(user.phoneNumberTemp, otp);

    return NextResponse.json(
      {
        message: "New OTP sent successfully",
        expiresIn: 600, // 10 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
