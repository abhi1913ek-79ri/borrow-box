import Notification from "@/models/Notification";

export function serializeNotification(notification) {
  if (!notification) {
    return null;
  }

  const booking = notification.booking && typeof notification.booking === "object"
    ? notification.booking
    : null;
  const item = booking?.item && typeof booking.item === "object" ? booking.item : null;
  const renter = booking?.renter && typeof booking.renter === "object" ? booking.renter : null;

  return {
    id: notification._id ? notification._id.toString() : notification.id,
    user: notification.user ? notification.user.toString?.() || String(notification.user) : null,
    booking: booking
      ? {
          id: booking._id ? booking._id.toString() : booking.id,
          itemName: item?.title || "Untitled item",
          itemImage: Array.isArray(item?.images) ? item.images[0] || "" : "",
          startDate: booking.startDate || null,
          endDate: booking.endDate || null,
          amount: Number(booking.amountPayable || booking.totalPrice || 0),
          renterName: renter?.name || "Unknown renter",
          status: booking.bookingStatus || "pending",
        }
      : null,
    title: notification.title || "",
    message: notification.message || "",
    type: notification.type || "info",
    isRead: Boolean(notification.isRead),
    actionTaken: Boolean(notification.actionTaken),
    createdAt: notification.createdAt || null,
  };
}

export function serializeNotifications(notifications = []) {
  return notifications.map(serializeNotification).filter(Boolean);
}

export async function createNotification({ userId, title, message, type = "info", bookingId = null }) {
  if (!userId || !title || !message) {
    return null;
  }

  if (bookingId) {
    return Notification.findOneAndUpdate(
      { user: userId, booking: bookingId, type },
      {
        $setOnInsert: {
          user: userId,
          booking: bookingId,
          title,
          message,
          type,
          isRead: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  return Notification.create({
    user: userId,
    title,
    message,
    type,
    isRead: false,
  });
}
