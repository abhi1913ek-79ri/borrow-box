import crypto from "crypto";

const RAZORPAY_API_BASE_URL = "https://api.razorpay.com/v1";

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay test keys are missing from environment variables.");
  }

  return { keyId, keySecret };
}

function getRazorpayAuthHeader() {
  const { keyId, keySecret } = getRazorpayConfig();
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return `Basic ${token}`;
}

async function requestRazorpay(path, { method = "GET", body } = {}) {
  const response = await fetch(`${RAZORPAY_API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.description || data?.error?.reason || "Razorpay API request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data;
}

export function getRazorpayKeyId() {
  return getRazorpayConfig().keyId;
}

export function toRazorpayAmount(amount) {
  return Math.round(Number(amount || 0) * 100);
}

export async function createRazorpayOrder({
  amount,
  amountInPaise,
  currency = "INR",
  receipt,
  notes = {},
}) {
  const orderAmount = Number.isFinite(Number(amountInPaise))
    ? Math.round(Number(amountInPaise))
    : toRazorpayAmount(amount);

  if (orderAmount < 100) {
    throw new Error("Minimum order amount is 100 paise.");
  }

  return requestRazorpay("/orders", {
    method: "POST",
    body: {
      amount: orderAmount,
      currency,
      receipt,
      notes,
    },
  });
}

export async function fetchRazorpayOrderPayments(orderId) {
  if (!orderId) {
    return [];
  }

  const encodedOrderId = encodeURIComponent(orderId);
  const paymentCollection = await requestRazorpay(`/orders/${encodedOrderId}/payments`);
  return Array.isArray(paymentCollection?.items) ? paymentCollection.items : [];
}

export async function captureRazorpayPayment({ paymentId, amount, currency = "INR" }) {
  if (!paymentId || !amount) {
    throw new Error("Payment capture details are missing.");
  }

  const encodedPaymentId = encodeURIComponent(paymentId);

  return requestRazorpay(`/payments/${encodedPaymentId}/capture`, {
    method: "POST",
    body: {
      amount,
      currency,
    },
  });
}

export function verifyRazorpayPaymentSignature({ orderId, paymentId, signature }) {
  const { keySecret } = getRazorpayConfig();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const receivedSignature = String(signature || "");

  if (receivedSignature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature));
}
