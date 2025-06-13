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

    const profileData = await request.json();

    // Connect to database
    await connectDB();

    // Update user profile
    const user = await User.findOneAndUpdate(
      { uid: decodedToken.uid },
      {
        profile: profileData.profile,
        address: profileData.address,
        profileComplete: true,
        onboardingComplete:true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Profile completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
