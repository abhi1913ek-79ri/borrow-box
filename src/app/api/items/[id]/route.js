import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    await connectDB();

    const item = await Item.findById(id);

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

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    await connectDB();

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (String(item.owner) !== String(session.user.id)) {
      return NextResponse.json(
        { error: "Only the owner can delete this item" },
        { status: 403 }
      );
    }

    await Item.findByIdAndDelete(id);

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
