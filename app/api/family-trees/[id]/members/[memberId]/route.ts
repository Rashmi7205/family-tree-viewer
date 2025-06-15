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
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

const updateMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
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

    // Handle multipart form data
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const birthDate = formData.get("birthDate") as string | null;
    const deathDate = formData.get("deathDate") as string | null;
    const gender = formData.get("gender") as string | null;
    const bio = formData.get("bio") as string | null;
    const profileImage = formData.get("profileImage") as File | null;

    // Validate required fields
    const data = updateMemberSchema.parse({
      firstName,
      lastName,
      birthDate: birthDate || null,
      deathDate: deathDate || null,
      gender: gender || null,
      bio: bio || null,
    });

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

    let profileImageUrl: string | undefined;

    // Handle image upload if present
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const uniqueId = uuidv4();
      const fileExtension = profileImage.name.split(".").pop();
      const fileName = `${uniqueId}.${fileExtension}`;

      // Define upload path
      const uploadDir = join(process.cwd(), "public", "uploads");

      // Create uploads directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filePath = join(uploadDir, fileName);

      // Save the file
      await writeFile(filePath, buffer);

      // Set the URL for the image
      profileImageUrl = `/uploads/${fileName}`;
    }

    const memberData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
      ...(profileImageUrl && { profileImageUrl }), // Only include if new image was uploaded
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }
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
