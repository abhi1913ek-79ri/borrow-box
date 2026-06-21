import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { refundRazorpayPayment } from "@/lib/payments/razorpay";
import { createTransaction, TRANSACTION_TYPES } from "@/lib/transactions";
import { releasePendingRentForBooking } from "@/lib/wallets";
import { sendEmail } from "@/lib/email";
import Booking from "@/models/Booking";
import Item from "@/models/Item";
import User from "@/models/User";

function normalizeBookingId(id) {
  return typeof id === "string" ? id.trim() : "";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendOwnerCompletionEmail({ ownerId, booking, itemTitle }) {
  if (!ownerId) {
    console.warn("Owner completion email skipped: missing owner id.", {
      bookingId: booking?._id ? String(booking._id) : "",
    });
    return;
  }

  const owner = await User.findById(ownerId).select("name email").lean();

  if (!owner?.email) {
    console.warn("Owner completion email skipped: owner email missing.", {
      bookingId: booking?._id ? String(booking._id) : "",
      ownerId: String(ownerId),
      ownerFound: Boolean(owner),
    });
    return;
  }

  const amount = Number(booking.totalPrice || 0);
  const amountLabel = amount > 0 ? `Rs. ${amount.toLocaleString("en-IN")}` : "the rent amount";
  const ownerNameHtml = escapeHtml(owner.name || "there");
  const itemTitleHtml = escapeHtml(itemTitle);
  const amountLabelHtml = escapeHtml(amountLabel);

  console.info("Triggering owner completion email.", {
    bookingId: booking?._id ? String(booking._id) : "",
    ownerId: String(ownerId),
    itemTitle,
    hasOwnerEmail: Boolean(owner.email),
  });

  const result = await sendEmail({
    to: owner.email,
    subject: `Booking completed for ${itemTitle}`,
    text: [
      `Hi ${owner.name || "there"},`,
      "",
      `The booking for ${itemTitle} has been completed.`,
      `Rent earning released to your wallet: ${amountLabel}.`,
      "",
      "Bank transfers are not available yet, but your available wallet balance has been updated.",
    ].join("\n"),
    html: `
      <p>Hi ${ownerNameHtml},</p>
      <p>The booking for <strong>${itemTitleHtml}</strong> has been completed.</p>
      <p>Rent earning released to your wallet: <strong>${amountLabelHtml}</strong>.</p>
      <p>Bank transfers are not available yet, but your available wallet balance has been updated.</p>
    `,
  });

  console.info("Owner completion email result.", {
    bookingId: booking?._id ? String(booking._id) : "",
    ownerId: String(ownerId),
    sent: Boolean(result?.ok),
    skipped: Boolean(result?.skipped),
    reason: result?.reason || "",
  });
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
      .select("item owner renter bookingStatus totalPrice totalRent depositAmount paymentId razorpayPaymentId depositRefunded refundId ownerPaid");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.item || String(booking.item.owner) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the item owner can confirm return" },
        { status: 403 },
      );
    }

    if (booking.bookingStatus !== "return_initiated") {
      return NextResponse.json(
        { error: "Only return-initiated bookings can be completed" },
        { status: 409 },
      );
    }

    const returnedAt = new Date();
    const refundAmount = Math.max(0, Number(booking.depositAmount || 0));
    const paymentId = String(booking.razorpayPaymentId || booking.paymentId || "").trim();
    let razorpayRefund = null;

    if (refundAmount > 0) {
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

    const completedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: "return_initiated",
        depositRefunded: { $ne: true },
      },
      {
        $set: {
          bookingStatus: "completed",
          returnedAt,
          depositRefunded: true,
          refundId: razorpayRefund?.id || "",
          refundAmount,
          refundDate: returnedAt,
          updatedAt: returnedAt,
        },
      },
      { new: true },
    );

    if (!completedBooking) {
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

    await Promise.all([
      createTransaction({
        bookingId: booking._id,
        userId: booking.owner || booking.item.owner,
        amount: completedBooking.totalRent ?? completedBooking.totalPrice,
        type: TRANSACTION_TYPES.RENT_EARNING,
        status: "COMPLETED",
        createdAt: returnedAt,
      }),
      createTransaction({
        bookingId: booking._id,
        userId: booking.renter,
        amount: refundAmount,
        type: TRANSACTION_TYPES.DEPOSIT_REFUND,
        status: "COMPLETED",
        createdAt: returnedAt,
      }),
    ]);

    const ownerPaidBooking = await Booking.findByIdAndUpdate(
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

    await createNotification({
      userId: booking.renter,
      title: "Deposit Refunded",
      message: "Your security deposit has been refunded.",
      type: "deposit_refund",
      bookingId: booking._id,
    });

    try {
      await sendOwnerCompletionEmail({
        ownerId: booking.owner || booking.item.owner,
        booking: completedBooking,
        itemTitle: booking.item?.title || "your item",
      });
    } catch (emailError) {
      console.error("Send owner completion email error:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: String(completedBooking._id),
          bookingStatus: completedBooking.bookingStatus,
          returnedAt: completedBooking.returnedAt,
          depositRefunded: completedBooking.depositRefunded,
          refundId: completedBooking.refundId,
          refundAmount: completedBooking.refundAmount,
          refundDate: completedBooking.refundDate,
          ownerPaid: ownerPaidBooking?.ownerPaid || false,
          ownerPaidAt: ownerPaidBooking?.ownerPaidAt || null,
        },
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
