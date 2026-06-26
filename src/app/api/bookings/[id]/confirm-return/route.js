import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { refundRazorpayPayment } from "@/lib/payments/razorpay";
import { createTransaction, TRANSACTION_TYPES } from "@/lib/transactions";
import { releasePendingRentForBooking } from "@/lib/wallets";
import { releaseDeposit } from "@/lib/deposits";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

function serializeCompletedBooking(booking) {
  return {
    _id: String(booking._id),
    bookingStatus: booking.bookingStatus,
    returnedAt: booking.returnedAt,
    depositRefunded: booking.depositRefunded,
    refundId: booking.refundId,
    refundAmount: booking.refundAmount,
    refundDate: booking.refundDate,
    ownerPaid: booking.ownerPaid || false,
    ownerPaidAt: booking.ownerPaidAt || null,
  };
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
      .populate({ path: "item", select: "owner title" })
      .select("item owner renter bookingStatus totalPrice totalRent depositAmount paymentId razorpayPaymentId depositRefunded refundId refundAmount refundDate returnedAt ownerPaid ownerPaidAt");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.item || String(booking.item.owner) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the item owner can confirm return" },
        { status: 403 },
      );
    }

    if (booking.ownerPaid) {
      return NextResponse.json(
        {
          success: true,
          booking: serializeCompletedBooking(booking),
        },
        { status: 200 },
      );
    }

    if (!["delivered", "return_initiated", "completed"].includes(booking.bookingStatus)) {
      return NextResponse.json(
        { error: "Only delivered or return-initiated bookings can be completed" },
        { status: 409 },
      );
    }

    const returnedAt = booking.returnedAt || new Date();
    const refundAmount = Math.max(0, Number(booking.depositAmount || 0));
    const paymentId = String(booking.razorpayPaymentId || booking.paymentId || "").trim();
    let razorpayRefund = null;

    if (refundAmount > 0 && !booking.depositRefunded) {
      if (!paymentId) {
        return NextResponse.json(
          { error: "Unable to refund deposit because the original Razorpay payment id is missing." },
          { status: 409 },
        );
      }

      try {
        razorpayRefund = await refundRazorpayPayment({
          paymentId,
          amount: refundAmount,
          notes: {
            bookingId: String(booking._id),
            type: "security_deposit_refund",
          },
        });
      } catch (refundError) {
        console.error("Razorpay deposit refund error:", {
          bookingId: String(booking._id),
          paymentId,
          refundAmount,
          status: refundError?.status,
          code: refundError?.code,
          message: refundError?.message,
        });

        return NextResponse.json(
          { error: "Return could not be completed because the deposit refund failed. Please try again." },
          { status: 502 },
        );
      }
    }

    if (refundAmount > 0 && !booking.depositRefunded && !razorpayRefund?.id) {
      return NextResponse.json(
        { error: "Return could not be completed because the deposit refund was not confirmed." },
        { status: 409 },
      );
    }

    const completedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: { $in: ["delivered", "return_initiated", "completed"] },
        ownerPaid: { $ne: true },
      },
      {
        $set: {
          bookingStatus: "completed",
          returnedAt,
          depositRefunded: true,
          refundId: razorpayRefund?.id || booking.refundId || "",
          refundAmount,
          refundDate: booking.refundDate || returnedAt,
          updatedAt: returnedAt,
        },
      },
      { new: true },
    );

    if (!completedBooking) {
      const currentBooking = await Booking.findById(booking._id)
        .select("bookingStatus returnedAt depositRefunded refundId refundAmount refundDate ownerPaid ownerPaidAt")
        .lean();

      if (currentBooking?.ownerPaid) {
        return NextResponse.json(
          {
            success: true,
            booking: serializeCompletedBooking(currentBooking),
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { error: "This booking has already moved forward" },
        { status: 409 },
      );
    }

    await Item.findByIdAndUpdate(booking.item._id, {
      $set: {
        "availability.isAvailable": true,
        updatedAt: returnedAt,
      },
    });

    await releasePendingRentForBooking(completedBooking);

    await releaseDeposit(booking._id);

    await createTransaction({
      bookingId: booking._id,
      userId: booking.owner || booking.item.owner,
      ownerId: booking.owner || booking.item.owner,
      amount: completedBooking.totalRent ?? completedBooking.totalPrice,
      type: TRANSACTION_TYPES.RENT_EARNING,
      status: "completed",
      createdAt: returnedAt,
    });

    const settledBooking = await Booking.findByIdAndUpdate(
      completedBooking._id,
      {
        $set: {
          ownerPaid: true,
          ownerPaidAt: returnedAt,
          updatedAt: returnedAt,
        },
      },
      { new: true },
    );

    await createTransaction({
      bookingId: booking._id,
      userId: booking.renter,
      amount: refundAmount,
      type: TRANSACTION_TYPES.DEPOSIT_REFUND,
      status: "COMPLETED",
      createdAt: returnedAt,
    });

    await createNotification({
      userId: booking.renter,
      title: "Deposit Refunded",
      message: "Your security deposit has been refunded.",
      type: "deposit_refund",
      bookingId: booking._id,
    });


    return NextResponse.json(
      {
        success: true,
        booking: serializeCompletedBooking(settledBooking || completedBooking),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Confirm return error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
