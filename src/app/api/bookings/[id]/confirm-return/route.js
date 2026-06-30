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
      .populate({ path: "item", select: "owner title" })
      .select("item owner renter bookingStatus totalPrice totalRent depositAmount paymentId razorpayPaymentId depositRefunded refundId refundAmount refundDate returnedAt ownerPaid ownerPaidAt");

    if (!booking) {
      console.warn("Confirm return skipped: booking not found.", { bookingId: id });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.item || String(booking.item.owner) !== String(session.user.id)) {
      console.warn("Confirm return forbidden: user is not item owner.", {
        bookingId: String(booking._id),
        userId: String(session.user.id),
        ownerId: booking.item?.owner ? String(booking.item.owner) : "",
      });
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
      console.warn("Confirm return rejected: invalid booking status.", {
        bookingId: String(booking._id),
        bookingStatus: booking.bookingStatus,
      });
      return NextResponse.json(
        { error: "Only delivered or return-initiated bookings can be completed" },
        { status: 409 },
      );
    }

    const returnedAt = booking.returnedAt || new Date();
    const refundAmount = Math.max(0, Number(booking.depositAmount || 0));
    const paymentId = String(booking.razorpayPaymentId || booking.paymentId || "").trim();
    const ownerId = booking.owner || booking.item.owner;
    let razorpayRefund = null;

    console.info("Confirm return settlement starting.", {
      bookingId: String(booking._id),
      ownerId: String(ownerId),
      renterId: String(booking.renter),
      bookingStatus: booking.bookingStatus,
      refundAmount,
      depositRefunded: Boolean(booking.depositRefunded),
      ownerPaid: Boolean(booking.ownerPaid),
    });

    if (refundAmount > 0 && !booking.depositRefunded) {
      if (!paymentId) {
        console.error("Confirm return failed: missing payment id for deposit refund.", {
          bookingId: String(booking._id),
          refundAmount,
        });
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
      console.error("Confirm return failed: refund response did not include an id.", {
        bookingId: String(booking._id),
        refundAmount,
      });
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

    try {
      const walletBooking = completedBooking.owner
        ? completedBooking
        : { ...completedBooking.toObject(), owner: ownerId };
      const wallet = await releasePendingRentForBooking(walletBooking);

      if (!wallet && Number(completedBooking.totalRent ?? completedBooking.totalPrice ?? 0) > 0) {
        throw new Error("Wallet settlement did not return a wallet record.");
      }

      console.info("Confirm return wallet credit completed.", {
        bookingId: String(booking._id),
        ownerId: String(ownerId),
        amount: Number(completedBooking.totalRent ?? completedBooking.totalPrice ?? 0),
      });
    } catch (walletError) {
      console.error("Confirm return wallet credit failed:", {
        bookingId: String(booking._id),
        message: walletError?.message,
      });
      return NextResponse.json(
        { error: "Booking was completed, but owner wallet settlement failed. Please contact support." },
        { status: 502 },
      );
    }

    try {
      await releaseDeposit(booking._id);
      console.info("Confirm return deposit release recorded.", {
        bookingId: String(booking._id),
        refundAmount,
      });

      await createTransaction({
        bookingId: booking._id,
        userId: ownerId,
        ownerId,
        amount: completedBooking.totalRent ?? completedBooking.totalPrice,
        type: TRANSACTION_TYPES.RENT_EARNING,
        status: "COMPLETED",
        createdAt: returnedAt,
      });
    } catch (settlementError) {
      console.error("Confirm return settlement record failed:", {
        bookingId: String(booking._id),
        message: settlementError?.message,
      });
      return NextResponse.json(
        { error: "Booking was completed, but settlement records could not be created. Please contact support." },
        { status: 502 },
      );
    }

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

    await createNotification({
      userId: ownerId,
      title: "Rental Completed",
      message: `Your earnings for ${booking.item.title || "this booking"} have been credited to your wallet.`,
      type: "booking_completed",
      bookingId: booking._id,
    });

    console.info("Confirm return settlement completed.", {
      bookingId: String(booking._id),
      bookingStatus: (settledBooking || completedBooking).bookingStatus,
      ownerPaid: Boolean((settledBooking || completedBooking).ownerPaid),
      depositRefunded: Boolean((settledBooking || completedBooking).depositRefunded),
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
