import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import Booking from "@/models/Booking";
import "@/models/Item";

function normalizeBookingId(id) {
  return typeof id === "string" ? id.trim() : "";
}

export async function PATCH(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = normalizeBookingId(resolvedParams?.id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate({ path: "item", select: "title owner" })
      .select("item owner renter bookingStatus");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (String(booking.renter) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the renter can confirm delivery" },
        { status: 403 },
      );
    }

    if (booking.bookingStatus !== "in_transit") {
      return NextResponse.json(
        { error: "Only in-transit bookings can be confirmed as delivered" },
        { status: 409 },
      );
    }

    const deliveredAt = new Date();
    const deliveredBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        renter: session.user.id,
        bookingStatus: "in_transit",
      },
      {
        $set: {
          bookingStatus: "delivered",
          deliveredAt,
          updatedAt: deliveredAt,
        },
      },
      { new: true },
    );

    if (!deliveredBooking) {
      return NextResponse.json(
        { error: "This booking has already moved forward" },
        { status: 409 },
      );
    }

    const ownerId = booking.owner || booking.item?.owner;

    await createNotification({
      userId: ownerId,
      title: "Item Delivered",
      message: `The renter confirmed delivery for ${booking.item?.title || "your item"}.`,
      type: "booking_delivered",
      bookingId: booking._id,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(deliveredBooking._id),
          bookingStatus: deliveredBooking.bookingStatus,
          deliveredAt: deliveredBooking.deliveredAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Confirm delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
