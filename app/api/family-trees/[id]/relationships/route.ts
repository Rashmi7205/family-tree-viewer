import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FamilyTree from "@/models/FamilyTree";
import Relationship from "@/models/Relationship";
import Member from "@/models/Member";
import { logAudit } from "@/lib/audit";
import User from "../../../../../models/User";
import { getTokenFromRequest, verifyFirebaseToken } from "../../../../../lib/auth/verify-token";

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

    // Get all relationships for this family tree
    const relationships = await Relationship.find({ familyTreeId: params.id });

    // Get all members for this family tree
    const members = await Member.find({ familyTreeId: params.id });
    const membersMap = new Map(
      members.map((member) => [member._id.toString(), member])
    );

    // Enrich relationships with member data
    const enrichedRelationships = relationships.map((rel) => {
      const member1 = membersMap.get(rel.member1Id);
      const member2 = membersMap.get(rel.member2Id);

      return {
        id: rel._id.toString(),
        member1Id: rel.member1Id,
        member2Id: rel.member2Id,
        relationshipType: rel.relationshipType,
        member1: member1
          ? {
              id: member1._id.toString(),
              firstName: member1.firstName,
              lastName: member1.lastName,
            }
          : undefined,
        member2: member2
          ? {
              id: member2._id.toString(),
              firstName: member2.firstName,
              lastName: member2.lastName,
            }
          : undefined,
      };
    });

    return NextResponse.json(enrichedRelationships);
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { member1Id, member2Id, relationshipType } = await request.json();

    // Validate relationship type
    if (!["parent", "child", "spouse", "sibling"].includes(relationshipType)) {
      return NextResponse.json(
        { error: "Invalid relationship type" },
        { status: 400 }
      );
    }

    // Check if both members exist and belong to this family tree
    const member1 = await Member.findOne({
      _id: member1Id,
      familyTreeId: params.id,
    });
    const member2 = await Member.findOne({
      _id: member2Id,
      familyTreeId: params.id,
    });

    if (!member1 || !member2) {
      return NextResponse.json(
        { error: "One or both members not found" },
        { status: 404 }
      );
    }

    // Check for existing relationship
    const existingRelationship = await Relationship.findOne({
      familyTreeId: params.id,
      $or: [
        { member1Id, member2Id, relationshipType },
        { member1Id: member2Id, member2Id: member1Id, relationshipType },
      ],
    });

    if (existingRelationship) {
      return NextResponse.json(
        { error: "This relationship already exists" },
        { status: 400 }
      );
    }

    // Validate relationship logic
    if (relationshipType === "spouse") {
      // Check if either member already has a spouse
      const member1Spouses = await Relationship.find({
        familyTreeId: params.id,
        relationshipType: "spouse",
        $or: [{ member1Id }, { member2Id: member1Id }],
      });

      const member2Spouses = await Relationship.find({
        familyTreeId: params.id,
        relationshipType: "spouse",
        $or: [{ member1Id: member2Id }, { member2Id: member2Id }],
      });

      if (member1Spouses.length > 0) {
        return NextResponse.json(
          {
            error: `${member1.firstName} ${member1.lastName} already has a spouse relationship`,
          },
          { status: 400 }
        );
      }

      if (member2Spouses.length > 0) {
        return NextResponse.json(
          {
            error: `${member2.firstName} ${member2.lastName} already has a spouse relationship`,
          },
          { status: 400 }
        );
      }
    }

    // Create the new relationship
    const newRelationship = new Relationship({
      familyTreeId: params.id,
      member1Id,
      member2Id,
      relationshipType,
    });

    await newRelationship.save();

    // Log the audit event
    await logAudit(
      user.id,
      "RELATIONSHIP_CREATED",
      "RELATIONSHIP",
      newRelationship._id.toString()
    );

    // Return the new relationship with member data
    return NextResponse.json({
      id: newRelationship._id.toString(),
      member1Id,
      member2Id,
      relationshipType,
      member1: {
        id: member1._id.toString(),
        firstName: member1.firstName,
        lastName: member1.lastName,
      },
      member2: {
        id: member2._id.toString(),
        firstName: member2.firstName,
        lastName: member2.lastName,
      },
    });
  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    );
  }
}
