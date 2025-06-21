import { NextResponse } from "next/server"

import { verifyFirebaseToken, getTokenFromRequest } from "@/lib/auth/verify-token"
import connectDB from "../../../../lib/mongodb"
import User from "../../../../models/User"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await verifyFirebaseToken(token)
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Find user by Firebase UID
    const user = await User.findOne({ uid: decodedToken.user_id })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 })
  }
}
