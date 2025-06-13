import { NextResponse } from "next/server";

import {
  verifyFirebaseToken,
  getTokenFromRequest,
} from "@/lib/auth/verify-token";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function GET(request: Request) {
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

    // Get user onboarding status
    const user = await User.findOne(
      { uid: decodedToken.user_id },
      {
        onboardingComplete: 1,
        profileComplete: 1,
        phoneNumber: 1,
        profile: 1,
        address: 1,
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine current step
    let currentStep = "phone";
    if (user.phoneNumber) {
      currentStep = "profile";
    }
    if (user.phoneNumber && user.profile?.fullName && user.address?.city) {
      currentStep = "complete";
    }

    const status = {
      onboardingComplete: user.onboardingComplete,
      profileComplete: user.profileComplete,
      currentStep,
      steps: {
        phone: {
          completed: !!user.phoneNumber,
          data: user.phoneNumber ? { phoneNumber: user.phoneNumber } : null,
        },
        profile: {
          completed: !!(
            user.profile?.fullName &&
            user.profile?.gender &&
            user.profile?.dateOfBirth
          ),
          data: user.profile || null,
        },
        address: {
          completed: !!user.address?.city,
          data: user.address || null,
        },
      },
    };

    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return NextResponse.json(
      { error: "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}
