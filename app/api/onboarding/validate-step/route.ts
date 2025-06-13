import { NextResponse } from "next/server";

import {
  verifyFirebaseToken,
  getTokenFromRequest,
} from "@/lib/auth/verify-token";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { step } = await request.json();

    if (!["phone", "profile", "address"].includes(step)) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Get user data
    const user = await User.findOne({ uid: decodedToken.user_id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isValid = false;
    let missingFields: string[] = [];

    switch (step) {
      case "phone":
        isValid = !!user.phoneNumber;
        if (!isValid) missingFields.push("phoneNumber");
        break;

      case "profile":
        const requiredProfileFields = [
          { field: user.profile?.title, name: "title" },
          { field: user.profile?.fullName, name: "fullName" },
          { field: user.profile?.gender, name: "gender" },
          { field: user.profile?.dateOfBirth, name: "dateOfBirth" },
          { field: user.profile?.bloodGroup, name: "bloodGroup" },
          { field: user.profile?.education, name: "education" },
          { field: user.profile?.occupation, name: "occupation" },
          { field: user.profile?.maritalStatus, name: "maritalStatus" },
        ];

        missingFields = requiredProfileFields
          .filter(({ field }) => !field)
          .map(({ name }) => name);

        isValid = missingFields.length === 0;
        break;

      case "address":
        isValid = !!user.address?.city;
        if (!isValid) missingFields.push("address.city");
        break;
    }

    return NextResponse.json(
      {
        isValid,
        missingFields,
        canProceed: isValid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate step error:", error);
    return NextResponse.json(
      { error: "Failed to validate step" },
      { status: 500 }
    );
  }
}
