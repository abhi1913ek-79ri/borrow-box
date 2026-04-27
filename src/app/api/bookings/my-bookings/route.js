import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

function toIsoDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const bookings = await Booking.find({ renter: session.user.id })
      .populate({ path: "item", select: "title images owner" })
      .populate({ path: "owner", select: "name" })
      .sort({ createdAt: -1 });

    const normalizedBookings = bookings.map((booking) => ({
      _id: String(booking._id),
      itemId: String(booking.item?._id || booking.item || ""),
      itemTitle: booking.item?.title || "Untitled item",
      itemImage: Array.isArray(booking.item?.images) ? booking.item.images[0] || "" : "",
      ownerName: booking.owner?.name || "Unknown owner",
      startDate: toIsoDate(booking.startDate),
      endDate: toIsoDate(booking.endDate),
      totalPrice: Number(booking.totalPrice || 0),
      bookingStatus: booking.bookingStatus || "pending",
      createdAt: booking.createdAt || booking.updatedAt || null,
    }));

    return NextResponse.json({ success: true, bookings: normalizedBookings }, { status: 200 });
  } catch (error) {
    console.error("Fetch my bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
