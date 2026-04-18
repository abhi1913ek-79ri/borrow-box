import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function GET() {
  try {
    await connectDB();

    const items = await Item.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Fetch items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    const { title, description, itemType, category, pricePerDay, pricePerHour, depositAmount, images, availability, location } = body;

    if (!title || !description || !itemType || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, itemType, category" },
        { status: 400 }
      );
    }

    if (pricePerDay === undefined || pricePerHour === undefined || depositAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: pricePerDay, pricePerHour, depositAmount" },
        { status: 400 }
      );
    }

    if (!location?.address || !location?.city || location?.coordinates?.lat === undefined || location?.coordinates?.lng === undefined) {
      return NextResponse.json(
        { error: "Missing required location fields: address, city, coordinates" },
        { status: 400 }
      );
    }

    // Create new item
    const newItem = new Item({
      title,
      description,
      itemType,
      category,
      pricePerDay: Number(pricePerDay),
      pricePerHour: Number(pricePerHour),
      depositAmount: Number(depositAmount),
      images: Array.isArray(images) ? images : [],
      availability: {
        isAvailable: availability?.isAvailable !== false,
      },
      location: {
        address: location.address,
        city: location.city,
        coordinates: {
          lat: Number(location.coordinates.lat),
          lng: Number(location.coordinates.lng),
        },
      },
      owner: session.user.id,
      rating: 0,
      totalReviews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedItem = await newItem.save();

    return NextResponse.json(
      {
        success: true,
        item: {
          _id: savedItem._id,
          title: savedItem.title,
          description: savedItem.description,
          itemType: savedItem.itemType,
          category: savedItem.category,
          pricePerDay: savedItem.pricePerDay,
          pricePerHour: savedItem.pricePerHour,
          depositAmount: savedItem.depositAmount,
          images: savedItem.images,
          availability: savedItem.availability,
          location: savedItem.location,
          owner: savedItem.owner,
          rating: savedItem.rating,
          totalReviews: savedItem.totalReviews,
          createdAt: savedItem.createdAt,
          updatedAt: savedItem.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
