import Wallet from "@/models/Wallet";

function getRentAmount(booking) {
  return Math.max(0, Number(booking?.totalRent ?? booking?.totalPrice ?? 0));
}

export async function creditPendingRentForBooking(booking) {
  const ownerId = booking?.owner;
  const rentAmount = getRentAmount(booking);

  if (!ownerId || rentAmount <= 0) {
    return null;
  }

  return Wallet.findOneAndUpdate(
    { owner: ownerId },
    {
      $inc: {
        pendingBalance: rentAmount,
      },
      $setOnInsert: {
        availableBalance: 0,
        totalEarned: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function releasePendingRentForBooking(booking) {
  const ownerId = booking?.owner;
  const rentAmount = getRentAmount(booking);

  if (!ownerId || rentAmount <= 0) {
    return null;
  }

  return Wallet.findOneAndUpdate(
    { owner: ownerId },
    [
      {
        $set: {
          owner: ownerId,
          pendingBalance: {
            $max: [
              0,
              { $subtract: [{ $ifNull: ["$pendingBalance", 0] }, rentAmount] },
            ],
          },
          availableBalance: {
            $add: [{ $ifNull: ["$availableBalance", 0] }, rentAmount],
          },
          totalEarned: {
            $add: [{ $ifNull: ["$totalEarned", 0] }, rentAmount],
          },
        },
      },
    ],
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
