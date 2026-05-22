import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { reconcileRazorpayBookingPayment } from "@/lib/payments/bookingConfirmation";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const bookingId = cleanString(body?.bookingId);

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: bookingId,
      renter: session.user.id,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const result = await reconcileRazorpayBookingPayment({
      booking,
      renterId: session.user.id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "No completed Razorpay payment found yet." },
        { status: result.status || 202 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(result.booking._id),
          bookingStatus: result.booking.bookingStatus,
          paymentStatus: result.booking.paymentStatus,
          paymentId: result.booking.paymentId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sync Razorpay payment error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to sync payment" },
      { status: 500 }
    );
  }
}
