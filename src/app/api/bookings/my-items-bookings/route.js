import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { reconcilePendingRazorpayBookings } from "@/lib/payments/bookingConfirmation";
import Booking from "@/models/Booking";

function toIsoDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const pendingRazorpayBookings = await Booking.find({
      owner: session.user.id,
      paymentStatus: "pending",
      razorpayOrderId: { $exists: true, $ne: "" },
    });

    await reconcilePendingRazorpayBookings(pendingRazorpayBookings);

    const bookings = await Booking.find({ owner: session.user.id })
      .populate({ path: "item", select: "title images" })
      .populate({ path: "renter", select: "name" })
      .sort({ createdAt: -1 });

    const normalizedBookings = bookings.map((booking) => ({
      _id: String(booking._id),
      itemId: String(booking.item?._id || booking.item || ""),
      itemTitle: booking.item?.title || "Untitled item",
      itemImage: Array.isArray(booking.item?.images) ? booking.item.images[0] || "" : "",
      renterName: booking.renter?.name || "Unknown renter",
      startDate: toIsoDate(booking.startDate),
      endDate: toIsoDate(booking.endDate),
      totalPrice: Number(booking.totalPrice || 0),
      depositAmount: Number(booking.depositAmount || 0),
      amountPayable: Number(booking.amountPayable || booking.totalPrice || 0),
      paymentStatus: booking.paymentStatus || "pending",
      bookingStatus: booking.bookingStatus || "pending",
      actionTaken: ["owner_accepted", "owner_rejected", "in_transit", "delivered", "return_initiated", "completed"].includes(booking.bookingStatus),
      deliveredAt: booking.deliveredAt || null,
      returnRequestedAt: booking.returnRequestedAt || null,
      returnedAt: booking.returnedAt || null,
      depositRefunded: Boolean(booking.depositRefunded),
      refundId: booking.refundId || "",
      refundAmount: Number(booking.refundAmount || 0),
      refundDate: booking.refundDate || null,
      createdAt: booking.createdAt || booking.updatedAt || null,
    }));

    return NextResponse.json({ success: true, bookings: normalizedBookings }, { status: 200 });
  } catch (error) {
    console.error("Fetch my items bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
