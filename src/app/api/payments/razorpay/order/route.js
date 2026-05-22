import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { calculateBookingPricing, parseBookingDate } from "@/lib/bookingPricing";
import { connectDB } from "@/lib/db";
import { createRazorpayOrder, getRazorpayKeyId, toRazorpayAmount } from "@/lib/payments/razorpay";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const itemId = String(body?.itemId || "").trim();
    const startDate = parseBookingDate(body?.startDate);
    const endDate = parseBookingDate(body?.endDate);

    if (!itemId || !isValidObjectId(itemId)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Item.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (String(item.owner) === String(session.user.id)) {
      return NextResponse.json(
        { error: "You cannot book your own item" },
        { status: 403 }
      );
    }

    if (item.availability?.isAvailable === false) {
      return NextResponse.json({ error: "Item is out of stock" }, { status: 409 });
    }

    const pricing = calculateBookingPricing({ item, startDate, endDate });

    if (pricing.totalDays <= 0) {
      return NextResponse.json(
        { error: "End date must be after or equal to start date" },
        { status: 400 }
      );
    }

    if (pricing.amountPayable <= 0) {
      return NextResponse.json(
        { error: "Payable amount must be greater than zero" },
        { status: 400 }
      );
    }

    await Booking.updateMany(
      {
        item: item._id,
        renter: session.user.id,
        bookingStatus: "pending",
        paymentStatus: "pending",
      },
      {
        $set: {
          bookingStatus: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    const booking = await Booking.create({
      item: item._id,
      renter: session.user.id,
      owner: item.owner,
      startDate,
      endDate,
      totalPrice: pricing.totalPrice,
      depositAmount: pricing.depositAmount,
      amountPayable: pricing.amountPayable,
      currency: "INR",
      paymentProvider: "razorpay",
      paymentStatus: "pending",
      bookingStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const razorpayOrder = await createRazorpayOrder({
        amount: pricing.amountPayable,
        currency: "INR",
        receipt: `booking_${booking._id}`,
        notes: {
          bookingId: String(booking._id),
          itemId: String(item._id),
          renterId: String(session.user.id),
        },
      });

      await Booking.findByIdAndUpdate(booking._id, {
        $set: {
          paymentOrderId: razorpayOrder.id,
          razorpayOrderId: razorpayOrder.id,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          payment: {
            keyId: getRazorpayKeyId(),
            bookingId: String(booking._id),
            razorpayOrderId: razorpayOrder.id,
            amount: toRazorpayAmount(pricing.amountPayable),
            currency: "INR",
            itemTitle: item.title || "Borrow Box booking",
            totalPrice: pricing.totalPrice,
            depositAmount: pricing.depositAmount,
            amountPayable: pricing.amountPayable,
            prefill: {
              name: session.user.name || "",
              email: session.user.email || "",
              contact: session.user.phone || "",
            },
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await Booking.findByIdAndDelete(booking._id);
      throw error;
    }
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to start payment" },
      { status: 500 }
    );
  }
}
