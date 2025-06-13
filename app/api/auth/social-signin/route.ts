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

    const { email, displayName, photoURL, uid, provider } = await request.json()

    // Connect to database
    await connectDB()

    // Check if user already exists
    let user = await User.findOne({ uid })

    if (!user) {
      // Create new user for OAuth providers
      user = new User({
        email,
        displayName,
        photoURL,
        provider,
        uid,
        emailVerified: true, // OAuth providers verify email
        onboardingComplete: false,
      })

      await user.save()
    }

    return NextResponse.json({ message: "User authenticated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Social signin error:", error)
    return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 })
  }
}
