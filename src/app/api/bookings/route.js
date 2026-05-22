import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Bookings must be confirmed through the payment flow.",
    },
    { status: 400 }
  );
}
