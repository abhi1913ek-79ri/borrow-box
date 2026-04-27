import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

function normalizeItemId(id) {
  return typeof id === "string" ? id.trim() : "";
}

async function findItemByIdOrKey(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const itemByObjectId = await Item.findById(id);

    if (itemByObjectId) {
      return itemByObjectId;
    }
  }

  return Item.findOne({ _id: id });
}

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = normalizeItemId(resolvedParams?.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    await connectDB();

    const item = await findItemByIdOrKey(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error) {
    console.error("Fetch single item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = normalizeItemId(resolvedParams?.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    await connectDB();

    const item = await findItemByIdOrKey(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (String(item.owner) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the owner can delete this item" },
        { status: 403 }
      );
    }

    await Item.deleteOne({ _id: item._id });

    return NextResponse.json(
      { success: true, message: "Item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
