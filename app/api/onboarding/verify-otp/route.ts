import { NextResponse } from "next/server"

import { verifyFirebaseToken, getTokenFromRequest } from "@/lib/auth/verify-token"
import connectDB from "../../../../lib/mongodb"
import User from "../../../../models/User"

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await verifyFirebaseToken(token)
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { otp } = await request.json()

    // Connect to database
    await connectDB()

    // Find user and check OTP
    const user = await User.findOne({
      uid: decodedToken.user_id,
      otp,
      otpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Update user with verified phone number
    user.phoneNumber = user.phoneNumberTemp
    user.phoneNumberTemp = undefined
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    return NextResponse.json({ message: "Phone number verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}
