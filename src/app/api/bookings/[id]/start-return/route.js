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
        { error: "Only the renter can start return" },
        { status: 403 },
      );
    }

    if (booking.bookingStatus !== "delivered") {
      return NextResponse.json(
        { error: "Only delivered bookings can start return" },
        { status: 409 },
      );
    }

    const returnRequestedAt = new Date();
    const returnBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        renter: session.user.id,
        bookingStatus: "delivered",
      },
      {
        $set: {
          bookingStatus: "return_initiated",
          returnRequestedAt,
          updatedAt: returnRequestedAt,
        },
      },
      { new: true },
    );

    if (!returnBooking) {
      return NextResponse.json(
        { error: "This booking has already moved forward" },
        { status: 409 },
      );
    }

    await createNotification({
      userId: booking.owner || booking.item?.owner,
      title: "Item Return Started",
      message: "Renter has started item return process.",
      type: "booking_return_initiated",
      bookingId: booking._id,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(returnBooking._id),
          bookingStatus: returnBooking.bookingStatus,
          returnRequestedAt: returnBooking.returnRequestedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Start return error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
