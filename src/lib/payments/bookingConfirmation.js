import Booking from "@/models/Booking";
import Item from "@/models/Item";
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

  if (booking.paymentStatus === "completed" && booking.bookingStatus === "confirmed") {
    return { ok: true, booking };
  }

  const paymentId = razorpayPaymentId || booking.razorpayPaymentId || booking.paymentId;
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
          bookingStatus: "pending",
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
        bookingStatus: "confirmed",
        paymentId,
        razorpayPaymentId: paymentId,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

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
