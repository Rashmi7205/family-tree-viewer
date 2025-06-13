import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import { logAudit } from "@/lib/audit"
import { getTokenFromRequest, verifyFirebaseToken } from "../../../../../lib/auth/verify-token"
import User from "../../../../../models/User"

const createMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
  bio: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ uid: decodedToken.user_id });
    const body = await request.json()
    const data = createMemberSchema.parse(body)

    // Verify user owns the family tree
    const tree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    })

    if (!tree) {
      return NextResponse.json({ error: "Family tree not found" }, { status: 404 })
    }

    const memberData = {
      ...data,
      familyTreeId: params.id,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
    }

    const member = await Member.create(memberData)

    await logAudit(user.id, "MEMBER_CREATED", "MEMBER", member._id.toString())

    return NextResponse.json({
      ...member.toObject(),
      id: member._id.toString(),
    })
  } catch (error) {
    console.error("Create member error:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
