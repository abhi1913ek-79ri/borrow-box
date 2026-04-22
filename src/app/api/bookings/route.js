import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getInclusiveDayCount(startDate, endDate) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const endUtc = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  return Math.floor((endUtc - startUtc) / oneDayMs) + 1;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const itemId = String(body?.itemId || "").trim();
    const startDate = parseDate(body?.startDate);
    const endDate = parseDate(body?.endDate);

    if (!itemId || !isValidObjectId(itemId)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const totalDays = getInclusiveDayCount(startDate, endDate);

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: "End date must be after or equal to start date" },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Item.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.availability?.isAvailable === false) {
      return NextResponse.json({ error: "Item is out of stock" }, { status: 409 });
    }

    const totalPrice = Number(item.pricePerDay || 0) * totalDays;

    const booking = await Booking.create({
      item: item._id,
      renter: session.user.id,
      owner: item.owner,
      startDate,
      endDate,
      totalPrice,
      depositAmount: Number(item.depositAmount || 0),
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const inventoryUpdate = await Item.findByIdAndUpdate(
      item._id,
      {
        $set: {
          "availability.isAvailable": false,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!inventoryUpdate) {
      await Booking.findByIdAndDelete(booking._id);

      return NextResponse.json(
        { error: "Unable to update item availability" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: booking._id,
          renter: booking.renter,
          owner: booking.owner,
          totalPrice: booking.totalPrice,
          bookingStatus: booking.bookingStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
