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

    const { address } = await request.json();

    // Validate required address fields
    if (!address || !address.city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    // Validate coordinates if provided
    if (address.coordinates) {
      if (
        typeof address.coordinates.lat !== "number" ||
        typeof address.coordinates.lng !== "number"
      ) {
        // If coordinates are invalid, remove them to avoid database errors
        delete address.coordinates;
      }
    }

    // Create a clean address object with only the fields we want to store
    const cleanAddress = {
      street: address.street || "",
      city: address.city,
      state: address.state || "",
      country: address.country || "",
      postalCode: address.postalCode || "",
      coordinates: address.coordinates || null,
      formatted:
        address.formatted ||
        `${address.city}${address.state ? `, ${address.state}` : ""}${
          address.country ? `, ${address.country}` : ""
        }`,
    };

    // Connect to database
    await connectDB();

    // Update user with address
    const user = await User.findOneAndUpdate(
      { uid: decodedToken.user_id },
      { $set: { address: cleanAddress } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Address saved successfully",
        address: user.address,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save address error:", error);
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}
