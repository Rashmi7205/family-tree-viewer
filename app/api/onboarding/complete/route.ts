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

    // Find user
    const user = await User.findOne({ uid: decodedToken.user_id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate that all required onboarding steps are complete
    const validationErrors: string[] = [];

    // Check phone verification
    if (!user.phoneNumber) {
      validationErrors.push("Phone number verification is required");
    }

    // Check profile completion
    if (
      !user.profile?.fullName ||
      !user.profile?.gender ||
      !user.profile?.dateOfBirth
    ) {
      validationErrors.push("Complete profile information is required");
    }

    // Check address
    if (!user.address?.city) {
      validationErrors.push("Address information is required");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Onboarding incomplete",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Mark onboarding and profile as complete
    const updatedUser = await User.findOneAndUpdate(
      { uid: decodedToken.user_id },
      {
        $set: {
          onboardingComplete: true,
          profileComplete: true,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Onboarding completed successfully",
        user: {
          onboardingComplete: updatedUser?.onboardingComplete,
          profileComplete: updatedUser?.profileComplete,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
