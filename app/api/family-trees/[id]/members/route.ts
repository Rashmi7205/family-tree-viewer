import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import FamilyTree from "@/models/FamilyTree";
import Member from "@/models/Member";
import { logAudit } from "@/lib/audit";
import {
  getTokenFromRequest,
  verifyFirebaseToken,
} from "../../../../../lib/auth/verify-token";
import User from "../../../../../models/User";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

const createMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

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
    const data = createMemberSchema.parse({
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
      familyTreeId: params.id,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
      profileImageUrl,
    };

    const member = await Member.create(memberData);

    await logAudit(user.id, "MEMBER_CREATED", "MEMBER", member._id.toString());

    return NextResponse.json({
      ...member.toObject(),
      id: member._id.toString(),
    });
  } catch (error) {
    console.error("Create member error:", error);
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
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
