import mongoose from "mongoose";
import Deposit from "@/models/Deposit";

/**
 * Create a LOCKED deposit record when a renter pays for a booking.
 * Uses upsert so it is safe to call multiple times for the same booking.
 */
export async function createLockedDeposit({ bookingId, renterId, ownerId, amount }) {
  const normalizedAmount = Math.max(0, Number(amount || 0));

  if (!bookingId || !renterId || !ownerId || normalizedAmount <= 0) {
    return null;
  }

  return Deposit.findOneAndUpdate(
    { booking: bookingId },
    {
      $setOnInsert: {
        booking: bookingId,
        renter: renterId,
        owner: ownerId,
        amount: normalizedAmount,
        depositStatus: "LOCKED",
        lockedAt: new Date(),
        releasedAt: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

/**
 * Transition a deposit from LOCKED → RELEASED when the rental completes.
 */
export async function releaseDeposit(bookingId) {
  if (!bookingId) {
    return null;
  }

  return Deposit.findOneAndUpdate(
    { booking: bookingId, depositStatus: "LOCKED" },
    {
      $set: {
        depositStatus: "RELEASED",
        releasedAt: new Date(),
      },
    },
    { new: true },
  );
}

/**
 * Aggregate LOCKED and RELEASED deposit totals for a given renter.
 * Returns { lockedTotal, releasedTotal }.
 */
export async function getDepositSummaryForUser(userId) {
  if (!userId) {
    return { lockedTotal: 0, releasedTotal: 0 };
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));

  const [lockedResult, releasedResult] = await Promise.all([
    Deposit.aggregate([
      { $match: { renter: userObjectId, depositStatus: "LOCKED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Deposit.aggregate([
      { $match: { renter: userObjectId, depositStatus: "RELEASED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    lockedTotal: Number(lockedResult[0]?.total || 0),
    releasedTotal: Number(releasedResult[0]?.total || 0),
  };
}
