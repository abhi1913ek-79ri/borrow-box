import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getDepositSummaryForUser } from "@/lib/deposits";
import Wallet from "@/models/Wallet";
import "@/models/Deposit";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const [wallet, depositSummary] = await Promise.all([
            Wallet.findOne({ owner: session.user.id }).lean(),
            getDepositSummaryForUser(session.user.id),
        ]);

        return NextResponse.json(
            {
                success: true,
                wallet: {
                    availableBalance: Number(wallet?.availableBalance || 0),
                    pendingBalance: Number(wallet?.pendingBalance || 0),
                    totalEarned: Number(wallet?.totalEarned || 0),
                    lockedDeposits: depositSummary.lockedTotal,
                    releasedDeposits: depositSummary.releasedTotal,
                },
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
