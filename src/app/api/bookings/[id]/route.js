import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (String(booking.renter) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the renter can remove this booking" },
        { status: 403 }
      );
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Booking removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
