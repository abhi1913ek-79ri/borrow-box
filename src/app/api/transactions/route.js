import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import "@/models/Booking";
import "@/models/Item";

function serializeTransaction(transaction) {
  const booking = transaction.booking && typeof transaction.booking === "object"
    ? transaction.booking
    : null;
  const item = booking?.item && typeof booking.item === "object" ? booking.item : null;

  return {
    id: String(transaction._id),
    booking: booking?._id ? String(booking._id) : String(transaction.booking || ""),
    itemTitle: item?.title || "Booking",
    amount: Number(transaction.amount || 0),
    type: transaction.type,
    status: transaction.status || "COMPLETED",
    createdAt: transaction.createdAt || null,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ user: session.user.id })
      .populate({
        path: "booking",
        select: "item",
        populate: { path: "item", select: "title" },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(
      {
        success: true,
        transactions: transactions.map(serializeTransaction),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
