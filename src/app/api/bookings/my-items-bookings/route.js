import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const bookings = await Booking.find({ owner: session.user.id })
      .populate("item")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (error) {
    console.error("Fetch my items bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
