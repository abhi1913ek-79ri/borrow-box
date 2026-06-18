import Booking from "@/models/Booking";
import Item from "@/models/Item";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { captureRazorpayPayment, fetchRazorpayOrderPayments } from "@/lib/payments/razorpay";

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getSuccessfulPayment(payments) {
  return payments.find((payment) => payment?.status === "captured" || payment?.captured === true)
    || payments.find((payment) => payment?.status === "authorized");
}

async function normalizeSuccessfulPayment(payment) {
  if (!payment || payment.status !== "authorized") {
    return payment;
  }

  return captureRazorpayPayment({
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency || "INR",
  });
}

function formatBookingDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendOwnerBookingEmail({ ownerId, booking, itemTitle }) {
  if (!ownerId) {
    return;
  }

  const [owner, renter] = await Promise.all([
    User.findById(ownerId).select("name email").lean(),
    User.findById(booking.renter).select("name email").lean(),
  ]);

  if (!owner?.email) {
    return;
  }

  const startDate = formatBookingDate(booking.startDate);
  const endDate = formatBookingDate(booking.endDate);
  const bookingDates = startDate && endDate ? `${startDate} to ${endDate}` : "the selected dates";
  const renterName = renter?.name || "A renter";
  const amount = Number(booking.amountPayable || booking.totalPrice || 0);
  const amountLabel = amount > 0 ? `Rs. ${amount.toLocaleString("en-IN")}` : "the booking amount";
  const ownerNameHtml = escapeHtml(owner.name || "there");
  const renterNameHtml = escapeHtml(renterName);
  const itemTitleHtml = escapeHtml(itemTitle);
  const bookingDatesHtml = escapeHtml(bookingDates);
  const amountLabelHtml = escapeHtml(amountLabel);

  await sendEmail({
    to: owner.email,
    subject: `New booking for ${itemTitle}`,
    text: [
      `Hi ${owner.name || "there"},`,
      "",
      `${renterName} has successfully booked ${itemTitle} for ${bookingDates}.`,
      `Amount paid: ${amountLabel}.`,
      "",
      "Please open Vyntra to accept or reject the booking request.",
    ].join("\n"),
    html: `
      <p>Hi ${ownerNameHtml},</p>
      <p><strong>${renterNameHtml}</strong> has successfully booked <strong>${itemTitleHtml}</strong> for ${bookingDatesHtml}.</p>
      <p>Amount paid: <strong>${amountLabelHtml}</strong>.</p>
      <p>Please open Vyntra to accept or reject the booking request.</p>
    `,
  });
}

export async function confirmRazorpayBookingPayment({
  bookingId,
  renterId,
  razorpayOrderId,
  razorpayPaymentId,
}) {
  const query = { _id: bookingId };

  if (hasValue(renterId)) {
    query.renter = renterId;
  }

  if (hasValue(razorpayOrderId)) {
    query.razorpayOrderId = razorpayOrderId;
  }

  const booking = await Booking.findOne(query);

  if (!booking) {
    return { ok: false, status: 404, error: "Booking not found" };
  }

  if (
    booking.paymentStatus === "completed"
    && ["paid", "owner_accepted", "in_transit", "delivered", "confirmed", "completed"].includes(booking.bookingStatus)
  ) {
    return { ok: true, booking };
  }

  const paymentId = razorpayPaymentId || booking.razorpayPaymentId || booking.paymentId;
  const item = await Item.findById(booking.item).select("title owner").lean();
  const ownerId = booking.owner || item?.owner;
  const itemTitle = item?.title || "your item";

  if (ownerId) {
    await createNotification({
      userId: ownerId,
      title: "New Booking Request",
      message: `Your item ${itemTitle} has been booked, Start Your Delivery Process.`,
      type: "booking",
      bookingId: booking._id,
    });
  }

  const inventoryUpdate = await Item.findOneAndUpdate(
    {
      _id: booking.item,
      "availability.isAvailable": { $ne: false },
    },
    {
      $set: {
        "availability.isAvailable": false,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!inventoryUpdate) {
    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      {
        $set: {
          paymentStatus: "completed",
          bookingStatus: "paid",
          paymentId,
          razorpayPaymentId: paymentId,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      ok: false,
      status: 409,
      error: "Payment verified, but this item is no longer available. Please contact support.",
      booking: updatedBooking,
    };
  }

  const confirmedBooking = await Booking.findByIdAndUpdate(
    booking._id,
    {
      $set: {
        paymentStatus: "completed",
        bookingStatus: "paid",
        paymentId,
        razorpayPaymentId: paymentId,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  try {
    await sendOwnerBookingEmail({
      ownerId,
      booking: confirmedBooking,
      itemTitle,
    });
  } catch (error) {
    console.error("Send booking owner email error:", error);
  }

  return { ok: true, booking: confirmedBooking };
}

export async function reconcileRazorpayBookingPayment({ booking, renterId }) {
  if (!booking?.razorpayOrderId || booking.paymentStatus === "completed") {
    return { ok: false, booking };
  }

  if (hasValue(renterId) && String(booking.renter) !== String(renterId)) {
    return { ok: false, status: 403, error: "Unauthorized" };
  }

  const payments = await fetchRazorpayOrderPayments(booking.razorpayOrderId);
  const successfulPayment = await normalizeSuccessfulPayment(getSuccessfulPayment(payments));

  if (!successfulPayment?.id) {
    return { ok: false, booking };
  }

  return confirmRazorpayBookingPayment({
    bookingId: booking._id,
    renterId,
    razorpayOrderId: booking.razorpayOrderId,
    razorpayPaymentId: successfulPayment.id,
  });
}

export async function reconcilePendingRazorpayBookings(bookings, renterId) {
  const reconciledBookings = [];

  for (const booking of bookings) {
    if (booking.paymentStatus === "pending" && booking.razorpayOrderId) {
      try {
        const result = await reconcileRazorpayBookingPayment({ booking, renterId });
        reconciledBookings.push(result.booking || booking);
      } catch (error) {
        console.error("Reconcile Razorpay booking error:", error);
        reconciledBookings.push(booking);
      }
    } else {
      reconciledBookings.push(booking);
    }
  }

  return reconciledBookings;
}
