import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import Relationship from "@/models/Relationship"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const createTreeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = await requireAuth(request)

    const trees = await FamilyTree.find({ userId: user.id }).sort({ updatedAt: -1 }).lean()

    // Get counts for each tree
    const treesWithCounts = await Promise.all(
      trees.map(async (tree) => {
        const memberCount = await Member.countDocuments({ familyTreeId: tree._id.toString() })
        const relationshipCount = await Relationship.countDocuments({ familyTreeId: tree._id.toString() })

        return {
          ...tree,
          id: tree._id.toString(),
          _count: {
            members: memberCount,
            relationships: relationshipCount,
          },
        }
      }),
    )

    return NextResponse.json(treesWithCounts)
  } catch (error) {
    console.error("Get family trees error:", error)
    return NextResponse.json({ error: "Failed to fetch family trees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await requireAuth(request)
    const body = await request.json()
    const data = createTreeSchema.parse(body)

    const tree = await FamilyTree.create({
      ...data,
      userId: user.id,
    })

    await logAudit(user.id, "FAMILY_TREE_CREATED", "FAMILY_TREE", tree._id.toString())

    return NextResponse.json({
      ...tree.toObject(),
      id: tree._id.toString(),
    })
  } catch (error) {
    console.error("Create family tree error:", error)
    return NextResponse.json({ error: "Failed to create family tree" }, { status: 500 })
  }
}
