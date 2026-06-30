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
