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

    const { email, displayName, uid, provider } = await request.json()

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ uid })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = new User({
      email,
      displayName,
      provider,
      uid,
      emailVerified: false,
      onboardingComplete: false,
    })

    await newUser.save()

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
