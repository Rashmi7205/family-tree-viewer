import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import FamilyTree from "@/models/FamilyTree";
import Member from "@/models/Member";
import Relationship from "@/models/Relationship";
import { logAudit } from "@/lib/audit";
import {
  getTokenFromRequest,
  verifyFirebaseToken,
} from "../../../../../../lib/auth/verify-token";
import User from "../../../../../../models/User";

const updateMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
  bio: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const data = updateMemberSchema.parse(body);

    // Verify user owns the family tree
    const tree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Verify member belongs to this family tree
    const existingMember = await Member.findOne({
      _id: params.memberId,
      familyTreeId: params.id,
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Member not found in this family tree" },
        { status: 404 }
      );
    }

    const memberData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
    };

    const updatedMember = await Member.findByIdAndUpdate(
      params.memberId,
      memberData,
      { new: true }
    );

    await logAudit(user.id, "MEMBER_UPDATED", "MEMBER", params.memberId);

    return NextResponse.json({
      ...updatedMember.toObject(),
      id: updatedMember._id.toString(),
    });
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    // Verify user owns the family tree
    const tree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Verify member belongs to this family tree
    const member = await Member.findOne({
      _id: params.memberId,
      familyTreeId: params.id,
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in this family tree" },
        { status: 404 }
      );
    }

    // Delete all relationships involving this member
    await Relationship.deleteMany({
      $or: [{ member1Id: params.memberId }, { member2Id: params.memberId }],
      familyTreeId: params.id,
    });

    // Delete the member
    await Member.findByIdAndDelete(params.memberId);

    await logAudit(user.id, "MEMBER_DELETED", "MEMBER", params.memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
