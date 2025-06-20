import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FamilyTree from "@/models/FamilyTree";
import Member from "@/models/Member";
import Relationship from "@/models/Relationship";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const tree = await FamilyTree.findOne({
      _id: params.id,
      isPublic: true,
    }).lean();

    if (!tree) {
      return NextResponse.json(
        { error: "Family tree not found or not public" },
        { status: 404 }
      );
    }

    // Get members and relationships
    const members = await Member.find({ familyTreeId: params.id }).lean();
    const relationships = await Relationship.find({
      familyTreeId: params.id,
    }).lean();

    // Populate relationship members
    const populatedRelationships = await Promise.all(
      relationships.map(async (rel) => {
        const member1 = await Member.findById(rel.member1Id).lean();
        const member2 = await Member.findById(rel.member2Id).lean();

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
    console.error("Get public family tree error:", error);
    return NextResponse.json(
      { error: "Failed to fetch family tree" },
      { status: 500 }
    );
  }
}
