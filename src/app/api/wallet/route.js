import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import "@/models/Booking";
import "@/models/Item";

function serializeTransaction(transaction) {
    const booking = transaction.booking && typeof transaction.booking === "object"
        ? transaction.booking
        : null;
    const item = booking?.item && typeof booking.item === "object" ? booking.item : null;
    const bookingId = booking?._id ? String(booking._id) : String(transaction.booking || "");

    return {
        id: String(transaction._id),
        bookingId,
        itemName: item?.title || "Booking",
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

        const [wallet, transactions] = await Promise.all([
            Wallet.findOne({ owner: session.user.id }).lean(),
            Transaction.find({ user: session.user.id })
                .populate({
                    path: "booking",
                    select: "item",
                    populate: { path: "item", select: "title" },
                })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean(),
        ]);

        return NextResponse.json(
            {
                success: true,
                wallet: {
                    availableBalance: Number(wallet?.availableBalance || 0),
                    pendingBalance: Number(wallet?.pendingBalance || 0),
                    totalEarned: Number(wallet?.totalEarned || 0),
                },
                transactions: transactions.map(serializeTransaction),
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Fetch wallet error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
