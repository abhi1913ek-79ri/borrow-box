import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Math.round(Number(body?.amount || 0));
    const currency = String(body?.currency || "INR").trim().toUpperCase();
    const receipt = String(body?.receipt || `receipt_${Date.now()}`).trim();

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    const order = await createRazorpayOrder({
      amountInPaise: amount,
      currency,
      receipt,
    });

    return NextResponse.json(
      {
        success: true,
        key_id: getRazorpayKeyId(),
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to create order" },
      { status: 500 }
    );
  }
}
