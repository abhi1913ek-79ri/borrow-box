"use client";

import { useMemo, useState } from "react";
import Button from "./Button";
import { cancelBooking, confirmBookingDelivery } from "@/services/bookingService";
import {
    createRazorpayBookingOrder,
    loadRazorpayCheckout,
    openRazorpayCheckout,
    syncRazorpayBookingPayment,
    verifyRazorpayBookingPayment,
} from "@/services/paymentService";

function toIsoDate(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function getInclusiveDayCount(startDate, endDate) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const startUtc = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const endUtc = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
    return Math.floor((endUtc - startUtc) / oneDayMs) + 1;
}

function formatCurrency(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

const ACTIVE_BOOKING_STATUSES = ["paid", "owner_accepted", "in_transit", "delivered", "return_initiated"];
const CANCELLABLE_BOOKING_STATUSES = ["paid", "owner_accepted"];

export default function BookingWidget({
    itemId,
    dailyPrice = 64,
    depositAmount = 500,
    currentBooking = null,
    isItemOutOfStock = false,
    isOwnedByCurrentUser = false,
}) {
    const today = useMemo(() => new Date(), []);
    const defaultStartDate = toIsoDate(today);
    const defaultEndDate = toIsoDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");
    const [activeBooking, setActiveBooking] = useState(currentBooking);
    const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

    const dayCount = useMemo(() => {
        const parsedStart = new Date(`${startDate}T00:00:00Z`);
        const parsedEnd = new Date(`${endDate}T00:00:00Z`);

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime()) || parsedEnd < parsedStart) {
            return 0;
        }

        return getInclusiveDayCount(parsedStart, parsedEnd);
    }, [endDate, startDate]);

    const totalPrice = dailyPrice * dayCount;
    const payableNow = totalPrice + depositAmount;
    const hasActiveBooking = Boolean(
        activeBooking && ACTIVE_BOOKING_STATUSES.includes(activeBooking.bookingStatus)
    );
    const showCancelAction = Boolean(
        activeBooking && CANCELLABLE_BOOKING_STATUSES.includes(activeBooking.bookingStatus)
    );
    const showOutOfStock = isItemOutOfStock && !hasActiveBooking && !isOwnedByCurrentUser;
    const isBookingDisabled = isSubmitting || showCancelAction || showOutOfStock;

    const handleConfirmBooking = async () => {
        if (hasActiveBooking) {
            setStatusType("error");
            setStatusMessage("You have already booked this item.");
            return;
        }

        if (isItemOutOfStock) {
            setStatusType("error");
            setStatusMessage("This item is out of stock.");
            return;
        }

        if (!itemId) {
            setStatusType("error");
            setStatusMessage("Unable to book this item right now.");
            return;
        }

        if (isOwnedByCurrentUser) {
            setStatusType("error");
            setStatusMessage("You cannot book your own item.");
            return;
        }

        if (!startDate || !endDate || dayCount <= 0) {
            setStatusType("error");
            setStatusMessage("Please choose a valid booking date range.");
            return;
        }

        let payment = null;

        try {
            setIsSubmitting(true);
            setStatusMessage("");
            payment = await createRazorpayBookingOrder({ itemId, startDate, endDate });
            await loadRazorpayCheckout();
            setStatusMessage("Opening secure payment checkout...");

            const razorpayResponse = await openRazorpayCheckout({
                key: payment.keyId,
                amount: payment.amount,
                currency: payment.currency,
                name: "Vyntra",
                description: payment.itemTitle,
                order_id: payment.razorpayOrderId,
                prefill: payment.prefill || {},
                notes: {
                    bookingId: payment.bookingId,
                    itemId,
                },
                theme: {
                    color: "#2563eb",
                },
            });

            const booking = await verifyRazorpayBookingPayment({
                bookingId: payment.bookingId,
                ...razorpayResponse,
            });

            setStatusType("success");
            setStatusMessage("Payment verified. The owner can now confirm your booking.");
            setActiveBooking({ _id: booking._id, bookingStatus: booking.bookingStatus || "paid" });
        } catch (error) {
            if (payment?.bookingId) {
                const syncedBooking = await syncRazorpayBookingPayment({ bookingId: payment.bookingId });

                if (ACTIVE_BOOKING_STATUSES.includes(syncedBooking?.bookingStatus)) {
                    setStatusType("success");
                    setStatusMessage("Payment found in Razorpay. The owner can now confirm your booking.");
                    setActiveBooking({ _id: syncedBooking._id, bookingStatus: syncedBooking.bookingStatus });
                    return;
                }
            }

            setStatusType("error");
            setStatusMessage(error.message || "Unable to complete payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!activeBooking?._id) {
            setStatusType("error");
            setStatusMessage("Unable to cancel this booking right now.");
            return;
        }

        try {
            setIsCancelling(true);
            setStatusMessage("");
            await cancelBooking(activeBooking._id);
            setStatusType("success");
            setStatusMessage("Booking cancelled successfully.");
            setActiveBooking(null);
        } catch (error) {
            setStatusType("error");
            setStatusMessage(error.message || "Unable to cancel booking.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmDelivery = async () => {
        if (!activeBooking?._id) {
            setStatusType("error");
            setStatusMessage("Unable to confirm this delivery right now.");
            return;
        }

        try {
            setIsConfirmingDelivery(true);
            setStatusMessage("");

            const deliveredBooking = await confirmBookingDelivery(activeBooking._id);
            setActiveBooking((currentBooking) => ({
                ...currentBooking,
                bookingStatus: deliveredBooking?.bookingStatus || "delivered",
                deliveredAt: deliveredBooking?.deliveredAt || new Date().toISOString(),
            }));
            setStatusType("success");
            setStatusMessage("Delivery confirmed. Thanks for confirming receipt.");
        } catch (error) {
            setStatusType("error");
            setStatusMessage(error.message || "Unable to confirm delivery.");
        } finally {
            setIsConfirmingDelivery(false);
        }
    };

    return (
        <aside className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-xl font-semibold text-text">
                {formatCurrency(dailyPrice)}
                <span className="ml-1 text-sm font-normal text-text/70">per day</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-text/70">From</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="h-10 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text"
                    />
                </label>
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-text/70">To</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="h-10 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text"
                    />
                </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">bookingStatus: after payment</div>
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">paymentStatus: verified</div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-accent/25 p-2 text-xs text-text/70">
                Razorpay test checkout
            </div>

            {activeBooking?.bookingStatus === "in_transit" ? (
                <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Delivery confirmation</p>
                    <p className="mt-1 text-sm text-indigo-800/75 dark:text-indigo-200/75">
                        Confirm once you have received this item from the owner.
                    </p>
                    <Button
                        type="button"
                        disabled={isConfirmingDelivery}
                        onClick={handleConfirmDelivery}
                        className="mt-3 w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {isConfirmingDelivery ? "Confirming..." : "Item Received"}
                    </Button>
                </div>
            ) : null}

            {activeBooking?.bookingStatus === "delivered" ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                    Item received and delivery confirmed.
                </div>
            ) : null}

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-text/70">
                    <span>
                        {formatCurrency(dailyPrice)} x {dayCount || 0} days
                    </span>
                    <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-text/70">
                    <span>Deposit Amount</span>
                    <span>{formatCurrency(depositAmount)}</span>
                </div>
                <div className="h-px bg-accent/20" />
                <div className="flex items-center justify-between font-semibold text-text">
                    <span>Payable Now</span>
                    <span>{formatCurrency(payableNow)}</span>
                </div>
            </div>

            {isOwnedByCurrentUser ? (
                <div className="mt-5 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-800 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/40 dark:text-fuchsia-200">
                    This is your item. You can view the details, but you cannot book your own listing.
                </div>
            ) : showCancelAction ? (
                <Button
                    className="mt-5 w-full bg-rose-600 text-white hover:bg-rose-700"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                </Button>
            ) : hasActiveBooking ? (
                <Button className="mt-5 w-full bg-slate-500 text-white hover:bg-slate-600" disabled>
                    {activeBooking?.bookingStatus === "in_transit"
                        ? "Delivery in progress"
                        : activeBooking?.bookingStatus === "delivered"
                            ? "Delivery confirmed"
                            : "Booking active"}
                </Button>
            ) : showOutOfStock ? (
                <Button className="mt-5 w-full bg-slate-500 text-white hover:bg-slate-600" disabled>
                    Out of stock
                </Button>
            ) : (
                <Button
                    className="mt-5 w-full cursor-pointer"
                    onClick={handleConfirmBooking}
                    disabled={isBookingDisabled}
                >
                    {isSubmitting ? "Processing..." : "Pay & Confirm Booking"}
                </Button>
            )}

            {statusMessage && (
                <div
                    className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                        statusType === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                >
                    {statusMessage}
                </div>
            )}
        </aside>
    );
}

