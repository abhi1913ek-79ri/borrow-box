export async function getNotifications() {
  const response = await fetch("/api/notifications", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to load notifications");
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to load notifications");
  }

  return {
    notifications: data.notifications || [],
    unreadCount: data.unreadCount || 0,
  };
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) {
    throw new Error("Invalid notification id");
  }

  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to update notification");
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to update notification");
  }

  return data.notification || null;
}

async function updateBookingApproval(bookingId, action) {
  if (!bookingId) {
    throw new Error("Invalid booking id");
  }

  const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to update booking");
  }

  if (!data.success) {
    throw new Error(data.error || "Unable to update booking");
  }

  return data.booking || null;
}

export function acceptBooking(bookingId) {
  return updateBookingApproval(bookingId, "accept");
}

export function rejectBooking(bookingId) {
  return updateBookingApproval(bookingId, "reject");
}
