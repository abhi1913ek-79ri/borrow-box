const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

async function parseJsonResponse(response, fallbackMessage) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function createRazorpayBookingOrder({ itemId, startDate, endDate }) {
  const response = await fetch("/api/payments/razorpay/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemId, startDate, endDate }),
  });

  const data = await parseJsonResponse(response, "Unable to start payment.");
  return data.payment;
}

export async function createStandardRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
}) {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, receipt }),
  });

  const data = await parseJsonResponse(response, "Unable to create payment order.");
  return data;
}

export async function verifyStandardRazorpayPayment(paymentResult) {
  const response = await fetch("/api/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentResult),
  });

  return parseJsonResponse(response, "Unable to verify payment.");
}

export async function verifyRazorpayBookingPayment(paymentResult) {
  const response = await fetch("/api/payments/razorpay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentResult),
  });

  const data = await parseJsonResponse(response, "Unable to verify payment.");
  return data.booking;
}

export async function syncRazorpayBookingPayment({ bookingId }) {
  const response = await fetch("/api/payments/razorpay/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookingId }),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.success) {
    return null;
  }

  return data.booking;
}

export function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Payment checkout can only open in the browser."));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    razorpay.on("payment.failed", (response) => {
      reject(new Error(response?.error?.description || "Payment failed."));
    });

    razorpay.open();
  });
}
