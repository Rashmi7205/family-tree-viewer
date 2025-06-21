import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import FamilyTree, { IFamilyTree } from "@/models/FamilyTree";
import Member, { IMember } from "@/models/Member";
import Relationship, { IRelationship } from "@/models/Relationship";
import { logAudit } from "@/lib/audit";
import {
  getTokenFromRequest,
  verifyFirebaseToken,
} from "../../../../lib/auth/verify-token";
import User from "../../../../models/User";

const updateTreeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    }).lean<IFamilyTree>();

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Get members and relationships
    const members = await Member.find({ familyTreeId: params.id }).lean<
      IMember[]
    >();
    const relationships = await Relationship.find({
      familyTreeId: params.id,
    }).lean<IRelationship[]>();

    // Populate relationship members
    const populatedRelationships = await Promise.all(
      relationships.map(async (rel) => {
        const member1 = await Member.findById(rel.member1Id).lean<IMember>();
        const member2 = await Member.findById(rel.member2Id).lean<IMember>();

        return {
          ...rel,
          id: rel._id.toString(),
          member1: member1 ? { ...member1, id: member1._id.toString() } : null,
          member2: member2 ? { ...member2, id: member2._id.toString() } : null,
        };
      })
    );

    const result = {
      ...tree,
      id: tree._id.toString(),
      members: members.map((m) => ({ ...m, id: m._id.toString() })),
      relationships: populatedRelationships,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get family tree error:", error);
    return NextResponse.json(
      { error: "Failed to fetch family tree" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json();
    const data = updateTreeSchema.parse(body);

    const tree = await FamilyTree.findOneAndUpdate(
      {
        _id: params.id,
        userId: user.id,
      },
      data,
      { new: true }
    );

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    await logAudit(user.id, "FAMILY_TREE_UPDATED", "FAMILY_TREE", params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update family tree error:", error);
    return NextResponse.json(
      { error: "Failed to update family tree" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tree = await FamilyTree.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Clean up related data
    await Member.deleteMany({ familyTreeId: params.id });
    await Relationship.deleteMany({ familyTreeId: params.id });

    await logAudit(user.id, "FAMILY_TREE_DELETED", "FAMILY_TREE", params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete family tree error:", error);
    return NextResponse.json(
      { error: "Failed to delete family tree" },
      { status: 500 }
    );
  }
}
