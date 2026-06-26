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
  const bookingId = booking?._id ? String(booking._id) : "";

  if (!ownerId || rentAmount <= 0) {
    console.warn("Wallet settlement skipped: missing owner or rent amount.", {
      bookingId,
      ownerId: ownerId ? String(ownerId) : "",
      totalRent: rentAmount,
    });
    return null;
  }

  const beforeWallet = await Wallet.findOne({ owner: ownerId }).lean();

  console.info("Wallet settlement starting.", {
    bookingId,
    ownerId: String(ownerId),
    totalRent: rentAmount,
    before: {
      availableBalance: Number(beforeWallet?.availableBalance || 0),
      pendingBalance: Number(beforeWallet?.pendingBalance || 0),
      totalEarned: Number(beforeWallet?.totalEarned || 0),
    },
  });

  const wallet = await Wallet.findOneAndUpdate(
    { owner: ownerId },
    {
      $inc: {
        pendingBalance: -rentAmount,
        availableBalance: rentAmount,
        totalEarned: rentAmount,
      },
      $setOnInsert: {
        owner: ownerId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.info("Wallet settlement completed.", {
    bookingId,
    ownerId: String(ownerId),
    totalRent: rentAmount,
    after: {
      availableBalance: Number(wallet?.availableBalance || 0),
      pendingBalance: Number(wallet?.pendingBalance || 0),
      totalEarned: Number(wallet?.totalEarned || 0),
    },
  });

  return wallet;
}
