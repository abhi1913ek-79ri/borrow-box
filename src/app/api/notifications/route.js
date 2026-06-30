import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { serializeNotifications } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ user: session.user.id })
      .populate({
        path: "booking",
        select: "item owner renter startDate endDate totalPrice amountPayable bookingStatus",
        populate: [
          { path: "item", select: "title images owner" },
          { path: "renter", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      notifications: serializeNotifications(notifications),
      unreadCount: notifications.filter((notification) => !notification.isRead).length,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
