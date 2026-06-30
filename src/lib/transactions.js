import Transaction from "@/models/Transaction";

export const TRANSACTION_TYPES = {
  RENT_EARNING: "RENT_EARNING",
  DEPOSIT_REFUND: "DEPOSIT_REFUND",
};

export async function createTransaction({ bookingId, userId, ownerId, amount, type, status = "COMPLETED", createdAt = new Date() }) {
  const normalizedAmount = Math.max(0, Number(amount || 0));

  if (!bookingId || !userId || !type || normalizedAmount <= 0) {
    return null;
  }

  return Transaction.findOneAndUpdate(
    {
      booking: bookingId,
      user: userId,
      type,
    },
    {
      $setOnInsert: {
        booking: bookingId,
        user: userId,
        owner: ownerId,
        amount: normalizedAmount,
        type,
        status,
        createdAt,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
