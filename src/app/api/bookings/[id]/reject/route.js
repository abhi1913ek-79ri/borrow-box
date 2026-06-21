import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import Booking from "@/models/Booking";
import "@/models/Item";
import Notification from "@/models/Notification";

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
        { error: "Only the item owner can reject this booking" },
        { status: 403 },
      );
    }

    if (booking.bookingStatus !== "paid") {
      return NextResponse.json(
        { error: "This booking has already been actioned" },
        { status: 409 },
      );
    }

    const rejectedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: "paid",
      },
      {
        $set: {
          bookingStatus: "owner_rejected",
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!rejectedBooking) {
      return NextResponse.json(
        { error: "This booking has already been actioned" },
        { status: 409 },
      );
    }

    await Notification.updateMany(
      {
        user: session.user.id,
        booking: booking._id,
        type: "booking",
      },
      {
        $set: {
          actionTaken: true,
          isRead: true,
        },
      },
    );

    await createNotification({
      userId: booking.renter,
      title: "Booking Rejected",
      message: "Your booking request was rejected by the owner.",
      type: "booking_owner_rejected",
      bookingId: booking._id,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(rejectedBooking._id),
          bookingStatus: rejectedBooking.bookingStatus,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reject booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
