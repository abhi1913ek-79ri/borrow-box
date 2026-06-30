import Booking from "@/models/Booking";
import Item from "@/models/Item";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { creditPendingRentForBooking } from "@/lib/wallets";
import { createLockedDeposit } from "@/lib/deposits";
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

function getOwnerDashboardUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    || "https://vyntra.app";

  return `${baseUrl.replace(/\/$/, "")}/my-items`;
}

async function sendOwnerBookingEmail({ ownerId, booking, itemTitle }) {
  const bookingId = booking?._id ? String(booking._id) : "";

  if (!ownerId) {
    console.warn("Owner booking email skipped: missing owner id.", {
      bookingId,
    });
    return;
  }

  console.info("Preparing owner booking email.", {
    bookingId,
    ownerId: String(ownerId),
    itemTitle,
    hasSmtpUser: Boolean(process.env.SMTP_USER),
    hasEmailFrom: Boolean(process.env.EMAIL_FROM),
  });

  const [owner, renter] = await Promise.all([
    User.findById(ownerId).select("name email").lean(),
    User.findById(booking.renter).select("name email").lean(),
  ]);

  if (!owner?.email) {
    console.warn("Owner booking email skipped: owner email missing.", {
      bookingId,
      ownerId: String(ownerId),
      ownerFound: Boolean(owner),
      ownerEmail: owner?.email || "",
    });
    return;
  }

  console.info("Owner booking email recipient resolved.", {
    bookingId,
    ownerId: String(ownerId),
    ownerEmail: owner.email,
  });

  const startDate = formatBookingDate(booking.startDate);
  const endDate = formatBookingDate(booking.endDate);
  const bookingDates = startDate && endDate ? `${startDate} to ${endDate}` : "the selected dates";
  const renterName = renter?.name || "A renter";
  const amount = Number(booking.amountPayable || booking.totalPrice || 0);
  const amountLabel = amount > 0 ? `Rs. ${amount.toLocaleString("en-IN")}` : "the booking amount";
  const itemName = String(itemTitle || "your item").replace(/\s+/g, " ").trim();
  const ownerDashboardUrl = getOwnerDashboardUrl();
  const ownerNameHtml = escapeHtml(owner.name || "there");
  const renterNameHtml = escapeHtml(renterName);
  const itemTitleHtml = escapeHtml(itemName);
  const bookingDatesHtml = escapeHtml(bookingDates);
  const amountLabelHtml = escapeHtml(amountLabel);
  const ownerDashboardUrlHtml = escapeHtml(ownerDashboardUrl);

  const result = await sendEmail({
    to: owner.email,
    subject: `🎉 New Booking Request - ${itemName}`,
    text: [
      `Hi ${owner.name || "there"},`,
      "",
      `${renterName} has successfully booked ${itemName} for ${bookingDates}.`,
      "",
      `Item: ${itemName}`,
      `Renter: ${renterName}`,
      `Dates: ${bookingDates}`,
      `Amount paid: ${amountLabel}.`,
      "",
      `View booking: ${ownerDashboardUrl}`,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:0;background-color:#f4f8fc;font-family:Arial,Helvetica,sans-serif;color:#182235;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background-color:#f4f8fc;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;border-collapse:collapse;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f2;">
                <tr>
                  <td style="padding:28px 30px;background-color:#1d4ed8;color:#ffffff;">
                    <div style="font-size:24px;line-height:30px;font-weight:800;letter-spacing:0;">Vyntra</div>
                    <div style="margin-top:8px;font-size:14px;line-height:20px;color:#bfdbfe;">New booking request received</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    <h1 style="margin:0;color:#182235;font-size:26px;line-height:34px;font-weight:800;letter-spacing:0;">${renterNameHtml} wants to book your item</h1>
                    <p style="margin:14px 0 0;color:#4b5563;font-size:15px;line-height:24px;">Hi ${ownerNameHtml}, a paid booking request is ready for your review. Accept or reject it from your owner dashboard.</p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:24px;border:1px solid #e2e8f2;border-radius:14px;overflow:hidden;">
                      <tr>
                        <td style="padding:16px 18px;background-color:#f8fafc;color:#6b7280;font-size:13px;line-height:18px;font-weight:700;text-transform:uppercase;">Item</td>
                        <td align="right" style="padding:16px 18px;background-color:#f8fafc;color:#182235;font-size:15px;line-height:22px;font-weight:700;">${itemTitleHtml}</td>
                      </tr>
                      <tr>
                        <td style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#6b7280;font-size:13px;line-height:18px;font-weight:700;text-transform:uppercase;">Renter</td>
                        <td align="right" style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#182235;font-size:15px;line-height:22px;font-weight:700;">${renterNameHtml}</td>
                      </tr>
                      <tr>
                        <td style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#6b7280;font-size:13px;line-height:18px;font-weight:700;text-transform:uppercase;">Dates</td>
                        <td align="right" style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#182235;font-size:15px;line-height:22px;font-weight:700;">${bookingDatesHtml}</td>
                      </tr>
                      <tr>
                        <td style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#6b7280;font-size:13px;line-height:18px;font-weight:700;text-transform:uppercase;">Amount</td>
                        <td align="right" style="padding:16px 18px;border-top:1px solid #e2e8f2;color:#182235;font-size:15px;line-height:22px;font-weight:700;">${amountLabelHtml}</td>
                      </tr>
                    </table>

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${ownerDashboardUrlHtml}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:12px;padding:15px 26px;font-size:15px;line-height:20px;font-weight:800;">View Booking</a>
                    </div>

                    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:21px;text-align:center;">You can manage this request from your Vyntra listed items dashboard.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });

  console.info("Owner booking email result.", {
    bookingId,
    ownerId: String(ownerId),
    ownerEmail: owner.email,
    sent: Boolean(result?.ok),
    skipped: Boolean(result?.skipped),
    reason: result?.reason || "",
    response: result,
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
    && ["paid", "owner_accepted", "in_transit", "delivered", "return_initiated", "confirmed", "completed"].includes(booking.bookingStatus)
  ) {
    return { ok: true, booking };
  }

  const paymentId = razorpayPaymentId || booking.razorpayPaymentId || booking.paymentId;
  const item = await Item.findById(booking.item).select("title owner").lean();
  const ownerId = item?.owner || booking.owner;
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

  if (!confirmedBooking) {
    return { ok: false, status: 500, error: "Unable to confirm booking" };
  }

  await creditPendingRentForBooking(confirmedBooking);

  await createLockedDeposit({
    bookingId: confirmedBooking._id,
    renterId: confirmedBooking.renter,
    ownerId,
    amount: confirmedBooking.depositAmount,
  });

  try {
    console.info("Triggering owner booking email after booking payment confirmation.", {
      bookingId: confirmedBooking?._id ? String(confirmedBooking._id) : "",
      ownerId: ownerId ? String(ownerId) : "",
      itemId: booking.item ? String(booking.item) : "",
      bookingStatus: confirmedBooking?.bookingStatus,
      paymentStatus: confirmedBooking?.paymentStatus,
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasEmailFrom: Boolean(process.env.EMAIL_FROM),
    });

    await sendOwnerBookingEmail({
      ownerId,
      booking: confirmedBooking,
      itemTitle,
    });
  } catch (error) {
    console.error("Send booking owner email error:", {
      bookingId: confirmedBooking?._id ? String(confirmedBooking._id) : "",
      ownerId: ownerId ? String(ownerId) : "",
      message: error?.message || String(error),
      stack: error?.stack || "",
    });
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
