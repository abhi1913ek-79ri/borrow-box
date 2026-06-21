import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { serializeNotification } from "@/lib/notifications";

function normalizeNotificationId(id) {
  return typeof id === "string" ? id.trim() : "";
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = normalizeNotificationId(resolvedParams?.id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
    }

    await connectDB();

    const notification = await Notification.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();

    return NextResponse.json({
      success: true,
      notification: serializeNotification(notification.toObject()),
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}