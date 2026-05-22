export function parseBookingDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getInclusiveDayCount(startDate, endDate) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const endUtc = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  return Math.floor((endUtc - startUtc) / oneDayMs) + 1;
}

export function calculateBookingPricing({ item, startDate, endDate }) {
  const totalDays = getInclusiveDayCount(startDate, endDate);
  const totalPrice = Number(item.pricePerDay || 0) * totalDays;
  const depositAmount = Number(item.depositAmount || 0);
  const amountPayable = totalPrice + depositAmount;

  return {
    totalDays,
    totalPrice,
    depositAmount,
    amountPayable,
  };
}
