import { NextResponse } from "next/server"
import { sendOTP } from "@/lib/sms/send-sms"
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

    const { phoneNumber } = await request.json()

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please use international format (e.g., +1234567890)" },
        { status: 400 },
      )
    }

    // Connect to database
    await connectDB()

    // Check if phone number is already in use by another user
    const existingUser = await User.findOne({
      phoneNumber,
      uid: { $ne: decodedToken.user_id },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Phone number is already in use" }, { status: 409 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in user document with expiry (10 minutes)
    await User.findOneAndUpdate(
      { uid: decodedToken.user_id },
      {
        phoneNumberTemp: phoneNumber,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    )

    // Send OTP via SMS
    const { otpSent }: { otpSent: boolean } = await sendOTP(phoneNumber, otp);

    if(otpSent){
      return NextResponse.json(
        {
          message: "OTP sent successfully",
          expiresIn: 600, // 10 minutes in seconds
        },
        { status: 200 },
      )
    }else{
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
