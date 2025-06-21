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
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

const updateMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  parents: z.array(z.string()).optional(),
  children: z.array(z.string()).optional(),
  spouseId: z.string().nullable().optional(),
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
    const gender = formData.get("gender") as string;
    const bio = formData.get("bio") as string | null;
    const profileImage = formData.get("profileImage") as File | null;
    let spouseId = formData.get("spouseId") as string | null;
    // Sanitize spouseId input
    if (spouseId === "null" || spouseId === "") {
      spouseId = null;
    }

    // Handle parents and children from FormData.
    const parents = (formData.getAll("parents") as string[]).filter(Boolean);
    const children = (formData.getAll("children") as string[]).filter(Boolean);
    // --- Relationship Validations ---

    // A member cannot be both a parent and a child of another member.
    if (parents.some((p) => children.includes(p))) {
      return NextResponse.json(
        { error: "A member cannot be both a parent and a child." },
        { status: 400 }
      );
    }
    // A member cannot be their own parent or child
    if (
      parents.includes(params.memberId) ||
      children.includes(params.memberId)
    ) {
      return NextResponse.json(
        { error: "A member cannot be their own parent or child." },
        { status: 400 }
      );
    }

    if (spouseId) {
      // A spouse cannot be a direct parent or child.
      if (parents.includes(spouseId) || children.includes(spouseId)) {
        return NextResponse.json(
          { error: "A spouse cannot be a direct parent or child." },
          { status: 400 }
        );
      }

      // A spouse cannot be a sibling (share a parent).
      const spouseMember = await Member.findById(spouseId);
      if (
        spouseMember &&
        spouseMember.parents &&
        spouseMember.parents.length > 0 &&
        parents.length > 0
      ) {
        const sharedParents = parents.filter((p) =>
          spouseMember.parents.map(String).includes(p)
        );
        if (sharedParents.length > 0) {
          return NextResponse.json(
            { error: "Cannot set a sibling as a spouse." },
            { status: 400 }
          );
        }
      }
    }

    // Validate required fields
    const data = updateMemberSchema.parse({
      firstName,
      lastName,
      gender,
      birthDate: birthDate || null,
      deathDate: deathDate || null,
      bio: bio || null,
      parents,
      children,
      spouseId,
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

    const updateData: any = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
      parents: data.parents || [],
      children: data.children || [],
      spouseId: spouseId || null,
    };

    if (profileImageUrl) {
      updateData.profileImageUrl = profileImageUrl;
    }

    // --- Bi-directional relationship updates ---
    const originalMember = await Member.findById(params.memberId).lean();
    if (!originalMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      params.memberId,
      updateData,
      { new: true }
    );

    // Handle changes in parent relationships
    const oldParents = originalMember.parents.map(String);
    const newParents = updatedMember.parents.map(String);
    const addedParents = newParents.filter((p) => !oldParents.includes(p));
    const removedParents = oldParents.filter((p) => !newParents.includes(p));

    if (addedParents.length > 0) {
      await Member.updateMany(
        { _id: { $in: addedParents } },
        { $addToSet: { children: updatedMember._id } }
      );
    }
    if (removedParents.length > 0) {
      await Member.updateMany(
        { _id: { $in: removedParents } },
        { $pull: { children: updatedMember._id } }
      );
    }

    // Handle changes in children relationships
    const oldChildren = originalMember.children.map(String);
    const newChildren = updatedMember.children.map(String);
    const addedChildren = newChildren.filter((c) => !oldChildren.includes(c));
    const removedChildren = oldChildren.filter((c) => !newChildren.includes(c));

    if (addedChildren.length > 0) {
      await Member.updateMany(
        { _id: { $in: addedChildren } },
        { $addToSet: { parents: updatedMember._id } }
      );
    }
    if (removedChildren.length > 0) {
      await Member.updateMany(
        { _id: { $in: removedChildren } },
        { $pull: { parents: updatedMember._id } }
      );
    }

    // Handle change in spouse
    const oldSpouseId = originalMember.spouseId
      ? originalMember.spouseId.toString()
      : null;
    const newSpouseId = updatedMember.spouseId
      ? updatedMember.spouseId.toString()
      : null;

    if (oldSpouseId !== newSpouseId) {
      // Clear old spouse's spouseId
      if (oldSpouseId) {
        await Member.findByIdAndUpdate(oldSpouseId, { spouseId: null });
      }
      // Set new spouse's spouseId
      if (newSpouseId) {
        await Member.findByIdAndUpdate(newSpouseId, {
          spouseId: updatedMember._id,
        });
      }
    }

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const member = await Member.findOneAndDelete({
      _id: params.memberId,
      familyTreeId: params.id,
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // --- Clean up relationships and files ---

    // 1. Remove image from server
    if (member.profileImageUrl) {
      try {
        const imagePath = join(process.cwd(), "public", member.profileImageUrl);
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch (fileError) {
        console.error("Failed to delete member image:", fileError);
        // Do not block the request if file deletion fails
      }
    }

    // 2. Clean up relationships
    const memberId = member._id.toString();
    const parentIds = member.parents.map(String);
    const childrenIds = member.children.map(String);
    const spouseId = member.spouseId ? member.spouseId.toString() : null;

    // Remove from parents' children list
    if (parentIds.length > 0) {
      await Member.updateMany(
        { _id: { $in: parentIds } },
        { $pull: { children: memberId } }
      );
    }

    // Remove from children's parents list
    if (childrenIds.length > 0) {
      await Member.updateMany(
        { _id: { $in: childrenIds } },
        { $pull: { parents: memberId } }
      );
    }

    // Unlink spouse
    if (spouseId) {
      await Member.findByIdAndUpdate(spouseId, { spouseId: null });
    }

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
