"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import CancelBookingConfirmModal from "@/components/CancelBookingConfirmModal";
import { cancelBooking, confirmBookingDelivery, getMyBookings, startBookingReturn } from "@/services/bookingService";

const statusStyles = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    paid: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    owner_accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    in_transit: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    return_initiated: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    owner_rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        return "Dates unavailable";
    }

    const start = new Date(startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return `${start} - ${end}`;
}

function formatCreatedDate(value) {
    if (!value) {
        return "Recently";
    }

    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function BookingStatusBadge({ status }) {
    const className = statusStyles[status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    const label = String(status || "pending").replaceAll("_", " ");

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
            {label}
        </span>
    );
}

const deliverySteps = [
    { key: "paid", label: "Payment Complete" },
    { key: "owner_accepted", label: "Owner Approved" },
    { key: "in_transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
];

const deliveryStepOrder = {
    paid: 0,
    owner_accepted: 1,
    in_transit: 2,
    delivered: 3,
    return_initiated: 3,
    completed: 3,
};

function DeliveryTimeline({ status }) {
    const activeIndex = deliveryStepOrder[status] ?? -1;
    const isRejected = status === "owner_rejected";
    const isCancelled = status === "cancelled";

    return (
        <div className="rounded-2xl border border-accent/15 bg-bg/70 p-4">
            <div className="grid gap-3 sm:grid-cols-4">
                {deliverySteps.map((step, index) => {
                    const isComplete = activeIndex >= index;
                    const isCurrent = activeIndex === index;

                    return (
                        <div key={step.key} className="relative flex items-center gap-3 sm:block">
                            <div
                                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                                    isComplete
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-accent/25 bg-card text-text/45"
                                }`}
                            >
                                {index + 1}
                            </div>
                            <div className="min-w-0 sm:mt-2">
                                <p className={`text-sm font-semibold ${isComplete ? "text-text" : "text-text/45"}`}>
                                    {step.label}
                                </p>
                                {isCurrent ? <p className="text-xs text-text/60">Current step</p> : null}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isRejected || isCancelled ? (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                    {isRejected ? "This booking was rejected by the owner." : "This booking was cancelled."}
                </p>
            ) : null}
        </div>
    );
}

function StatCard({ label, value, hint, valueClassName = "text-text" }) {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-text/70">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <p className={`text-3xl font-semibold ${valueClassName}`}>{value}</p>
                {hint ? <span className="text-xs text-text/55">{hint}</span> : null}
            </div>
        </article>
    );
}

function StatCardSkeleton() {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded-full bg-text/10" />
            <div className="mt-3 flex items-end justify-between gap-3">
                <div className="h-8 w-24 animate-pulse rounded-full bg-text/15" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-text/10" />
            </div>
        </article>
    );
}

function DeliveryConfirmationCard({
    booking,
    onConfirmDelivery,
    onRequestReturn,
    isConfirming = false,
    isRequestingReturn = false,
}) {
    if (booking.bookingStatus === "in_transit") {
        return (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Delivery confirmation</p>
                        <p className="mt-1 text-sm text-indigo-800/75 dark:text-indigo-200/75">
                            Confirm once you have received the item from the owner.
                        </p>
                    </div>
                    <Button
                        type="button"
                        disabled={isConfirming}
                        onClick={() => onConfirmDelivery?.(booking)}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {isConfirming ? "Confirming..." : "Item Received"}
                    </Button>
                </div>
            </div>
        );
    }

    if (booking.bookingStatus === "delivered") {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-emerald-800 dark:text-emerald-200">
                        <p className="font-semibold">Item received{booking.deliveredAt ? ` on ${formatDateTime(booking.deliveredAt)}` : ""}.</p>
                        <p className="mt-1 text-emerald-800/75 dark:text-emerald-200/75">Notify the owner when you start returning the item.</p>
                    </div>
                    <Button
                        type="button"
                        disabled={isRequestingReturn}
                        onClick={() => onRequestReturn?.(booking)}
                        className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
                    >
                        {isRequestingReturn ? "Starting..." : "Item Return"}
                    </Button>
                </div>
            </div>
        );
    }

    if (booking.bookingStatus === "return_initiated") {
        return (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
                Return started{booking.returnRequestedAt ? ` on ${formatDateTime(booking.returnRequestedAt)}` : ""}. Waiting for owner to confirm the item was received.
            </div>
        );
    }

    return null;
}

function BookingCard({
    booking,
    onCancel,
    onConfirmDelivery,
    onRequestReturn,
    isCancelling = false,
    isConfirmingDelivery = false,
    isRequestingReturn = false,
}) {
    const canCancel = !["cancelled", "completed", "in_transit", "delivered", "return_initiated"].includes(booking.bookingStatus);

    return (
        <article className="overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr] sm:p-5">
                <div className="relative h-36 overflow-hidden rounded-2xl bg-bg/80 sm:h-full">
                    {booking.itemImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={booking.itemImage} alt={booking.itemTitle} className="h-full w-full object-cover" />
                    ) : (
                        <div className="grid h-full place-items-center bg-linear-to-br from-primary/10 via-card to-accent/10 text-sm font-semibold text-text/50">
                            No image
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your booking</p>
                            <h3 className="mt-1 text-xl font-semibold text-text">{booking.itemTitle}</h3>
                            <p className="mt-1 text-sm text-text/70">Booked on {formatCreatedDate(booking.createdAt)}</p>
                        </div>
                        <BookingStatusBadge status={booking.bookingStatus} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Booking dates</p>
                            <p className="mt-1 text-sm font-medium text-text">{formatDateRange(booking.startDate, booking.endDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Price</p>
                                <p className="mt-1 text-sm font-medium text-text">${booking.totalPrice}</p>
                        </div>
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Owner</p>
                            <p className="mt-1 text-sm font-medium text-text">{booking.ownerName}</p>
                        </div>
                    </div>

                    <DeliveryTimeline status={booking.bookingStatus} />

                    <DeliveryConfirmationCard
                        booking={booking}
                        onConfirmDelivery={onConfirmDelivery}
                        onRequestReturn={onRequestReturn}
                        isConfirming={isConfirmingDelivery}
                        isRequestingReturn={isRequestingReturn}
                    />

                    {canCancel ? (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isCancelling}
                                onClick={() => onCancel?.(booking)}
                                className="border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                            >
                                {isCancelling ? "Cancelling..." : "Cancel booking"}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-accent/20 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                        <div className="h-36 rounded-2xl bg-bg/80" />
                        <div className="space-y-3">
                            <div className="h-4 w-24 rounded-full bg-bg/80" />
                            <div className="h-6 w-2/3 rounded-full bg-bg/80" />
                            <div className="h-4 w-1/2 rounded-full bg-bg/80" />
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="h-16 rounded-2xl bg-bg/80" />
                                <div className="h-16 rounded-2xl bg-bg/80" />
                                <div className="h-16 rounded-2xl bg-bg/80" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <section className="rounded-2xl border border-dashed border-accent/25 bg-card p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <p className="mt-2 text-sm text-text/70">{description}</p>
        </section>
    );
}

export default function BookingsPageClient() {
    const [myBookings, setMyBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [bookingPendingCancellation, setBookingPendingCancellation] = useState(null);
    const [cancellingBookingId, setCancellingBookingId] = useState("");
    const [confirmingDeliveryBookingId, setConfirmingDeliveryBookingId] = useState("");
    const [requestingReturnBookingId, setRequestingReturnBookingId] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setIsLoading(true);
                setError("");
                setActionError("");

                const renterBookings = await getMyBookings();

                setMyBookings(renterBookings);
            } catch {
                setError("Unable to load bookings right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadBookings();
    }, []);

    const totalBookings = myBookings.length;
    const totalSpendings = myBookings.reduce(
        (sum, booking) => sum + (booking.paymentStatus === "completed" ? Number(booking.amountPayable || booking.totalPrice || 0) : 0),
        0
    );

    const sortedBookings = useMemo(() => {
        return [...myBookings].sort((left, right) => {
            const leftTime = new Date(left.createdAt || left.startDate || 0).getTime();
            const rightTime = new Date(right.createdAt || right.startDate || 0).getTime();

            return rightTime - leftTime;
        });
    }, [myBookings]);

    const handleCancelBooking = (booking) => {
        if (!booking?._id) {
            return;
        }

        setBookingPendingCancellation(booking);
    };

    const confirmCancelBooking = async () => {
        if (!bookingPendingCancellation?._id) {
            return;
        }

        try {
            setCancellingBookingId(bookingPendingCancellation._id);
            setActionError("");

            await cancelBooking(bookingPendingCancellation._id);

            setMyBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    String(booking._id) === String(bookingPendingCancellation._id)
                        ? { ...booking, bookingStatus: "cancelled" }
                        : booking
                )
            );
            setBookingPendingCancellation(null);
        } catch (cancelError) {
            setActionError(cancelError.message || "Unable to cancel booking right now.");
        } finally {
            setCancellingBookingId("");
        }
    };

    const handleConfirmDelivery = async (booking) => {
        if (!booking?._id) {
            return;
        }

        try {
            setConfirmingDeliveryBookingId(booking._id);
            setActionError("");

            const updatedBooking = await confirmBookingDelivery(booking._id);
            setMyBookings((currentBookings) =>
                currentBookings.map((currentBooking) =>
                    String(currentBooking._id) === String(booking._id)
                        ? {
                            ...currentBooking,
                            bookingStatus: updatedBooking?.bookingStatus || "delivered",
                            deliveredAt: updatedBooking?.deliveredAt || new Date().toISOString(),
                        }
                        : currentBooking
                )
            );
        } catch (confirmError) {
            setActionError(confirmError.message || "Unable to confirm delivery right now.");
        } finally {
            setConfirmingDeliveryBookingId("");
        }
    };

    const handleRequestReturn = async (booking) => {
        if (!booking?._id) {
            return;
        }

        try {
            setRequestingReturnBookingId(booking._id);
            setActionError("");

            const updatedBooking = await startBookingReturn(booking._id);
            setMyBookings((currentBookings) =>
                currentBookings.map((currentBooking) =>
                    String(currentBooking._id) === String(booking._id)
                        ? {
                            ...currentBooking,
                            bookingStatus: updatedBooking?.bookingStatus || "return_initiated",
                            returnRequestedAt: updatedBooking?.returnRequestedAt || new Date().toISOString(),
                        }
                        : currentBooking
                )
            );
        } catch (returnError) {
            setActionError(returnError.message || "Unable to start return right now.");
        } finally {
            setRequestingReturnBookingId("");
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="Bookings" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Bookings" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 sm:grid-cols-2">
                        {isLoading ? (
                            <>
                                <StatCardSkeleton />
                                <StatCardSkeleton />
                            </>
                        ) : (
                            <>
                                <StatCard label="Total Bookings" value={totalBookings} hint="All your reservations" />
                                <StatCard label="Total Spendings" value={`Rs. ${totalSpendings.toLocaleString("en-IN")}`} hint="All booking payments" valueClassName="text-text" />
                            </>
                        )}
                    </section>

                    <section className="theme-card overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm">
                        <div className="border-b border-accent/20 bg-linear-to-br from-primary/10 via-card to-accent/10 p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Bookings Dashboard</p>
                            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                                <h1 className="text-3xl font-semibold text-text sm:text-4xl">My Bookings</h1>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-text/70">
                                A clean list of every booking you have made, with item details, dates, price, and status.
                            </p>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            {actionError ? (
                                <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                                    {actionError}
                                </section>
                            ) : null}

                            {isLoading ? (
                                <LoadingState />
                            ) : error ? (
                                <section className="rounded-2xl border border-dashed border-red-300 bg-card p-10 text-center">
                                    <h3 className="text-lg font-semibold text-red-600">Could not load bookings</h3>
                                    <p className="mt-2 text-sm text-text/70">{error}</p>
                                    <Button className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </section>
                            ) : sortedBookings.length ? (
                                <div className="grid gap-4">
                                    {sortedBookings.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            onCancel={handleCancelBooking}
                                            onConfirmDelivery={handleConfirmDelivery}
                                            onRequestReturn={handleRequestReturn}
                                            isCancelling={cancellingBookingId === booking._id}
                                            isConfirmingDelivery={confirmingDeliveryBookingId === booking._id}
                                            isRequestingReturn={requestingReturnBookingId === booking._id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No bookings found"
                                    description="You have not made any bookings yet. Your future reservations will appear here."
                                />
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <CancelBookingConfirmModal
                open={Boolean(bookingPendingCancellation)}
                bookingTitle={bookingPendingCancellation?.itemTitle || ""}
                isCancelling={Boolean(bookingPendingCancellation && cancellingBookingId === bookingPendingCancellation._id)}
                onClose={() => {
                    if (!cancellingBookingId) {
                        setBookingPendingCancellation(null);
                    }
                }}
                onConfirm={confirmCancelBooking}
            />
        </div>
    );
}
