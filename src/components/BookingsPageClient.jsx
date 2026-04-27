"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import CancelBookingConfirmModal from "@/components/CancelBookingConfirmModal";
import { cancelBooking, getMyBookings } from "@/services/bookingService";

const statusStyles = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
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

function BookingStatusBadge({ status }) {
    const className = statusStyles[status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
            {status}
        </span>
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

function BookingCard({ booking, onCancel, isCancelling = false }) {
    const canCancel = booking.bookingStatus !== "cancelled" && booking.bookingStatus !== "completed";

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
        (sum, booking) => sum + (booking.bookingStatus === "cancelled" ? 0 : Number(booking.totalPrice || 0)),
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
                                <StatCard label="Total Spendings" value={`$${totalSpendings.toLocaleString("en-IN")}`} hint="All booking payments" valueClassName="text-text" />
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
                                            isCancelling={cancellingBookingId === booking._id}
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