import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FamilyTree from "@/models/FamilyTree";
import Relationship from "@/models/Relationship";
import Member from "@/models/Member";
import { logAudit } from "@/lib/audit";
import { getTokenFromRequest, verifyFirebaseToken } from "../../../../../../lib/auth/verify-token";
import User from "../../../../../../models/User";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; relationshipId: string } }
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

    // Check if the family tree exists and belongs to the user
    const familyTree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    });

    if (!familyTree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Find the relationship
    const relationship = await Relationship.findOne({
      _id: params.relationshipId,
      familyTreeId: params.id,
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Get member names for audit log
    const member1 = await Member.findOne({ _id: relationship.member1Id });
    const member2 = await Member.findOne({ _id: relationship.member2Id });

    // Delete the relationship
    await Relationship.deleteOne({ _id: params.relationshipId });

    // Log the audit event
    await logAudit(
      user.id,
      "RELATIONSHIP_DELETED",
      "RELATIONSHIP",
      params.relationshipId,
      `Deleted ${relationship.relationshipType} relationship between ${
        member1 ? `${member1.firstName} ${member1.lastName}` : "unknown member"
      } and ${
        member2 ? `${member2.firstName} ${member2.lastName}` : "unknown member"
      }`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relationship:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; relationshipId: string } }
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

    // Check if the family tree exists and belongs to the user
    const familyTree = await FamilyTree.findOne({
      _id: params.id,
      userId: user.id,
    });

    if (!familyTree) {
      return NextResponse.json(
        { error: "Family tree not found" },
        { status: 404 }
      );
    }

    // Find the relationship
    const relationship = await Relationship.findOne({
      _id: params.relationshipId,
      familyTreeId: params.id,
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    const { relationshipType } = await request.json();

    // Validate relationship type
    if (!["parent", "child", "spouse", "sibling"].includes(relationshipType)) {
      return NextResponse.json(
        { error: "Invalid relationship type" },
        { status: 400 }
      );
    }

    // Update the relationship
    relationship.relationshipType = relationshipType;
    await relationship.save();

    // Get member names for audit log
    const member1 = await Member.findOne({ _id: relationship.member1Id });
    const member2 = await Member.findOne({ _id: relationship.member2Id });

    // Log the audit event
    await logAudit(
      user.id,
      "RELATIONSHIP_UPDATED",
      "RELATIONSHIP",
      params.relationshipId,
      `Updated relationship between ${
        member1 ? `${member1.firstName} ${member1.lastName}` : "unknown member"
      } and ${
        member2 ? `${member2.firstName} ${member2.lastName}` : "unknown member"
      } to ${relationshipType}`
    );

    // Return the updated relationship
    return NextResponse.json({
      id: relationship._id.toString(),
      member1Id: relationship.member1Id,
      member2Id: relationship.member2Id,
      relationshipType: relationship.relationshipType,
    });
  } catch (error) {
    console.error("Error updating relationship:", error);
    return NextResponse.json(
      { error: "Failed to update relationship" },
      { status: 500 }
    );
  }
}
