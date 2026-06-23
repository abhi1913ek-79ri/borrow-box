"use client";

import Button from "@/components/Button";
import { performOwnerBookingAction } from "@/services/bookingService";

export const OWNER_BOOKING_STATUS_UPDATED = "vyntra:owner-booking-status-updated";

const actionGroupsByStatus = {
  paid: [
    {
      key: "accept",
      label: "Accept Booking",
      loadingLabel: "Accepting...",
      className: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60",
    },
    {
      key: "reject",
      label: "Reject Booking",
      loadingLabel: "Rejecting...",
      className: "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60",
    },
  ],
  owner_accepted: [
    {
      key: "dispatch",
      label: "Start Delivery",
      loadingLabel: "Starting...",
      className: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60",
    },
  ],
  return_initiated: [
    {
      key: "confirmReturn",
      label: "Item Received",
      loadingLabel: "Confirming...",
      className: "bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60",
    },
  ],
};

export function getOwnerBookingStatus(booking) {
  return booking?.bookingStatus || booking?.status || "";
}

export function hasOwnerBookingActions(booking) {
  return Boolean(actionGroupsByStatus[getOwnerBookingStatus(booking)]?.length);
}

export function mergeOwnerBookingUpdate(booking, updatedBooking) {
  if (!booking || !updatedBooking) {
    return booking;
  }

  const updatedId = updatedBooking._id || updatedBooking.id;
  const bookingId = booking._id || booking.id;

  if (String(updatedId || "") !== String(bookingId || "")) {
    return booking;
  }

  return {
    ...booking,
    ...updatedBooking,
    status: updatedBooking.bookingStatus || updatedBooking.status || booking.status,
    bookingStatus: updatedBooking.bookingStatus || updatedBooking.status || booking.bookingStatus,
  };
}

/**
 * Returns true only when userId is the item owner of the given booking.
 * Use this as the single source-of-truth permission check before rendering
 * owner-only action buttons.
 *
 * booking.ownerId is set by the notifications API; booking.owner is the raw
 * Mongoose field on my-items-bookings. Both are checked for compatibility.
 */
export function canManageBooking(userId, booking) {
  if (!userId || !booking) {
    return false;
  }

  const bookingOwnerId = booking.ownerId || booking.owner;

  if (!bookingOwnerId) {
    return false;
  }

  return String(userId) === String(bookingOwnerId);
}

export function publishOwnerBookingStatusUpdate(updatedBooking) {
  if (typeof window === "undefined" || !updatedBooking) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(OWNER_BOOKING_STATUS_UPDATED, {
      detail: { booking: updatedBooking },
    }),
  );
}

export default function OwnerBookingActions({
  booking,
  disabled = false,
  loadingAction = "",
  size = "md",
  onLoadingActionChange,
  onActionComplete,
  onActionError,
}) {
  const bookingId = booking?._id || booking?.id;
  const status = getOwnerBookingStatus(booking);
  const actions = actionGroupsByStatus[status] || [];

  if (!bookingId || actions.length === 0) {
    return null;
  }

  const containerClassName = actions.length > 1
    ? "grid grid-cols-2 gap-2"
    : "flex justify-end";
  const buttonClassName = size === "sm"
    ? "px-3 py-2 text-xs"
    : "";

  const handleAction = async (event, action) => {
    event?.stopPropagation();

    try {
      onLoadingActionChange?.(action.key);
      const updatedBooking = await performOwnerBookingAction(bookingId, action.key);
      const normalizedBooking = mergeOwnerBookingUpdate(booking, updatedBooking) || updatedBooking;

      publishOwnerBookingStatusUpdate(normalizedBooking);
      onActionComplete?.(normalizedBooking, action.key);
    } catch (error) {
      onActionError?.(error, action.key);
    } finally {
      onLoadingActionChange?.("");
    }
  };

  return (
    <div className={containerClassName}>
      {actions.map((action) => (
        <Button
          key={action.key}
          type="button"
          variant="ghost"
          disabled={disabled || Boolean(loadingAction)}
          onClick={(event) => handleAction(event, action)}
          className={`${action.className} ${buttonClassName}`.trim()}
        >
          {loadingAction === action.key ? action.loadingLabel : action.label}
        </Button>
      ))}
    </div>
  );
}
