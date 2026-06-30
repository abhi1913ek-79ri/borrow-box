"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/services/notificationService";
import OwnerBookingActions, {
  canManageBooking,
  mergeOwnerBookingUpdate,
  OWNER_BOOKING_STATUS_UPDATED,
} from "@/components/OwnerBookingActions";

function formatNotificationTime(createdAt) {
  if (!createdAt) {
    return "Just now";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Dates unavailable";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates unavailable";
  }

  return `${start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function NotificationBell() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id || "";
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getNotifications();

        if (!isMounted) {
          return;
        }

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(fetchError.message || "Failed to load notifications");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !isOpen) {
      return;
    }

    let isMounted = true;

    const refreshNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getNotifications();

        if (!isMounted) {
          return;
        }

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(fetchError.message || "Failed to load notifications");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    refreshNotifications();

    return () => {
      isMounted = false;
    };
  }, [isOpen, status]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleOwnerBookingStatusUpdate = (event) => {
      const updatedBooking = event.detail?.booking;

      if (!updatedBooking) {
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) => {
          if (!currentNotification.booking) {
            return currentNotification;
          }

          return {
            ...currentNotification,
            booking: mergeOwnerBookingUpdate(currentNotification.booking, updatedBooking),
          };
        }),
      );
    };

    window.addEventListener(OWNER_BOOKING_STATUS_UPDATED, handleOwnerBookingStatusUpdate);

    return () => {
      window.removeEventListener(OWNER_BOOKING_STATUS_UPDATED, handleOwnerBookingStatusUpdate);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (notification.isRead) {
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((currentNotification) =>
        currentNotification.id === notification.id
          ? { ...currentNotification, isRead: true }
          : currentNotification,
      ),
    );
    setUnreadCount((currentCount) => Math.max(0, currentCount - 1));

    try {
      await markNotificationAsRead(notification.id);
    } catch (markError) {
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? { ...currentNotification, isRead: false }
            : currentNotification,
        ),
      );
      setUnreadCount((currentCount) => currentCount + 1);
      setError(markError.message || "Failed to update notification");
    }
  };

  const handleBookingActionLoadingChange = (notificationId, action) => {
    setActionLoadingKey(action ? `${notificationId}:${action}` : "");
  };

  const handleBookingActionComplete = (notification, updatedBooking) => {
    setError("");
    setNotifications((currentNotifications) =>
      currentNotifications.map((currentNotification) => {
        if (!currentNotification.booking) {
          return currentNotification;
        }

        const updatedBookingId = updatedBooking?._id || updatedBooking?.id;
        const notificationBookingId = currentNotification.booking.id || currentNotification.booking._id;
        const isSameBooking = String(updatedBookingId || "") === String(notificationBookingId || "");
        const isClickedNotification = currentNotification.id === notification.id;

        if (!isSameBooking && !isClickedNotification) {
          return currentNotification;
        }

      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? {
              ...currentNotification,
              isRead: true,
              actionTaken: true,
              booking: currentNotification.booking
                ? { ...currentNotification.booking, status: updatedStatus }
                : currentNotification.booking,
            }
            : currentNotification,
        ),
      );

    if (!notification.isRead) {
      setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
    }
  };

  const handleBookingActionError = (actionError) => {
    setError(actionError.message || "Unable to update booking");
  };

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-card text-text shadow-sm transition hover:bg-accent/10"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-bg shadow-md shadow-primary/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:absolute md:inset-auto md:right-0 md:top-[calc(100%+0.5rem)] md:bg-transparent"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex h-screen w-screen flex-col overflow-hidden rounded-none border-0 bg-card shadow-xl shadow-black/10 md:h-auto md:max-h-96 md:w-[min(92vw,24rem)] md:rounded-2xl md:border md:border-accent/20 md:shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between gap-3 border-b border-accent/10 px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">Notifications</p>
                <p className="text-xs text-text/60">Latest updates from your account</p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {unreadCount} unread
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/15 bg-bg/70 text-text/70 transition hover:bg-accent/10 hover:text-text"
                  aria-label="Close notifications"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)] md:max-h-96 md:pb-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-text/60">Loading notifications...</div>
              ) : error ? (
                <div className="px-4 py-6 text-sm text-red-500">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-text/60">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-accent/10">
                  {notifications.map((notification) => {
                    const booking = notification.booking;
                    const bookingStatus = booking?.status;
                    const canTakeBookingAction = bookingStatus === "paid" && !notification.actionTaken;
                    const isAccepting = actionLoadingKey === `${notification.id}:accept`;
                    const isRejecting = actionLoadingKey === `${notification.id}:reject`;
                    const showAcceptedBadge = ["owner_accepted", "in_transit", "delivered"].includes(bookingStatus);
                    const showRejectedBadge = bookingStatus === "owner_rejected";

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            handleNotificationClick(notification);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`block w-full px-4 py-3 text-left transition hover:bg-accent/5 ${notification.isRead ? "bg-transparent" : "bg-primary/5"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? "bg-text/20" : "bg-primary"
                              }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-text">{notification.title}</p>
                              <span className="shrink-0 text-[11px] text-text/50">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-text/70">{notification.message}</p>

                            {booking ? (
                              <div className="mt-3 overflow-hidden rounded-xl border border-accent/15 bg-bg/70">
                                <div className="grid gap-3 p-3 sm:grid-cols-[72px_1fr]">
                                  <div className="h-20 overflow-hidden rounded-lg bg-card">
                                    {booking.itemImage ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={booking.itemImage}
                                        alt={booking.itemName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="grid h-full place-items-center text-xs font-semibold text-text/45">
                                        No image
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <p className="truncate text-sm font-semibold text-text">{booking.itemName}</p>
                                      {showAcceptedBadge ? (
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                          Delivery Process Started
                                        </span>
                                      ) : null}
                                      {showRejectedBadge ? (
                                        <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                          Rejected
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="grid gap-1 text-xs text-text/65">
                                      <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
                                      <span>{formatCurrency(booking.amount)}</span>
                                      <span>Renter: {booking.renterName}</span>
                                    </div>
                                  </div>
                                </div>

                                {canTakeBookingAction ? (
                                  <div className="grid grid-cols-2 gap-2 border-t border-accent/10 p-3">
                                    <button
                                      type="button"
                                      disabled={Boolean(actionLoadingKey)}
                                      onClick={(event) => handleBookingAction(event, notification, "accept")}
                                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isAccepting ? "Confirming..." : "✓ Confirm Booking"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={Boolean(actionLoadingKey)}
                                      onClick={(event) => handleBookingAction(event, notification, "reject")}
                                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isRejecting ? "Rejecting..." : "✕ Reject Booking"}
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
