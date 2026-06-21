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
      .select("item renter bookingStatus");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.item || String(booking.item.owner) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the item owner can dispatch this booking" },
        { status: 403 },
      );
    }

    if (booking.bookingStatus !== "owner_accepted") {
      return NextResponse.json(
        { error: "Only owner-approved bookings can be dispatched" },
        { status: 409 },
      );
    }

    const dispatchedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: "owner_accepted",
      },
      {
        $set: {
          bookingStatus: "in_transit",
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!dispatchedBooking) {
      return NextResponse.json(
        { error: "This booking has already moved forward" },
        { status: 409 },
      );
    }

    await createNotification({
      userId: booking.renter,
      title: "Delivery Started",
      message: `Your booking for ${booking.item.title || "your item"} is now in transit.`,
      type: "booking_dispatch",
      bookingId: booking._id,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(dispatchedBooking._id),
          bookingStatus: dispatchedBooking.bookingStatus,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dispatch booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
