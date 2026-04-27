import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

function toIsoDate(value) {
    return value ? new Date(value).toISOString() : null;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const items = await Item.find({ owner: session.user.id }).sort({ createdAt: -1 }).lean();

        const normalizedItems = items.map((item) => ({
            _id: String(item._id),
            title: item.title || "Untitled item",
            description: item.description || "",
            itemType: item.itemType || "",
            category: item.category || "",
            pricePerDay: Number(item.pricePerDay || 0),
            pricePerHour: Number(item.pricePerHour || 0),
            depositAmount: Number(item.depositAmount || 0),
            images: Array.isArray(item.images) ? item.images : [],
            availability: item.availability || { isAvailable: true },
            location: item.location || {},
            rating: Number(item.rating || 0),
            totalReviews: Number(item.totalReviews || 0),
            createdAt: toIsoDate(item.createdAt),
            updatedAt: toIsoDate(item.updatedAt),
        }));

        return NextResponse.json({ success: true, items: normalizedItems }, { status: 200 });
    } catch (error) {
        console.error("Fetch my items error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}