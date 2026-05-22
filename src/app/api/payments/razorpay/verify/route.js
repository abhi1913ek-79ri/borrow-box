import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { confirmRazorpayBookingPayment } from "@/lib/payments/bookingConfirmation";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

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
    const razorpayOrderId = cleanString(body?.razorpay_order_id);
    const razorpayPaymentId = cleanString(body?.razorpay_payment_id);
    const razorpaySignature = cleanString(body?.razorpay_signature);

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification details are missing" },
        { status: 400 }
      );
    }

    const isVerified = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isVerified) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    await connectDB();

    const result = await confirmRazorpayBookingPayment({
      bookingId,
      renterId: session.user.id,
      razorpayOrderId,
      razorpayPaymentId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Unable to confirm booking" },
        { status: result.status || 500 }
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
    console.error("Verify Razorpay payment error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to verify payment" },
      { status: 500 }
    );
  }
}
