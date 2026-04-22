import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

function normalizeBookingId(id) {
  return typeof id === "string" ? id.trim() : "";
}

async function findBookingByIdOrKey(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const bookingByObjectId = await Booking.findById(id);

    if (bookingByObjectId) {
      return bookingByObjectId;
    }
  }

  return Booking.findOne({ _id: id });
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = normalizeBookingId(resolvedParams?.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    await connectDB();

    const booking = await findBookingByIdOrKey(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (String(booking.renter) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the renter can cancel this booking" },
        { status: 403 }
      );
    }

    if (booking.bookingStatus === "completed") {
      return NextResponse.json(
        { error: "Completed bookings cannot be cancelled" },
        { status: 409 }
      );
    }

    const item = booking.item ? await Item.findById(booking.item) : null;

    await Booking.findByIdAndUpdate(booking._id, {
      $set: {
        bookingStatus: "cancelled",
        updatedAt: new Date(),
      },
    });

    if (item) {
      await Item.findByIdAndUpdate(item._id, {
        $set: {
          "availability.isAvailable": true,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
