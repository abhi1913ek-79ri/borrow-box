import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const orderId = cleanString(body?.razorpay_order_id || body?.order_id);
    const paymentId = cleanString(body?.razorpay_payment_id || body?.payment_id);
    const signature = cleanString(body?.razorpay_signature);

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Payment verification details are missing" },
        { status: 400 }
      );
    }

    const isVerified = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isVerified) {
      return NextResponse.json({ error: "Payment signature mismatch" }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to verify payment" },
      { status: 500 }
    );
  }
}
