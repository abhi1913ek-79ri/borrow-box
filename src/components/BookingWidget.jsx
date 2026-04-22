"use client";

import { useMemo, useState } from "react";
import Button from "./Button";
import { createBooking } from "@/services/bookingService";

function toIsoDate(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function getInclusiveDayCount(startDate, endDate) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const startUtc = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const endUtc = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
    return Math.floor((endUtc - startUtc) / oneDayMs) + 1;
}

export default function BookingWidget({
    itemId,
    dailyPrice = 64,
    depositAmount = 500,
    isAlreadyBooked = false,
}) {
    const today = useMemo(() => new Date(), []);
    const defaultStartDate = toIsoDate(today);
    const defaultEndDate = toIsoDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");

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
    const isBookingDisabled = isSubmitting || isAlreadyBooked;

    const handleConfirmBooking = async () => {
        if (isAlreadyBooked) {
            setStatusType("error");
            setStatusMessage("You have already booked this item.");
            return;
        }

        if (!itemId) {
            setStatusType("error");
            setStatusMessage("Unable to book this item right now.");
            return;
        }

        if (!startDate || !endDate || dayCount <= 0) {
            setStatusType("error");
            setStatusMessage("Please choose a valid booking date range.");
            return;
        }

        try {
            setIsSubmitting(true);
            setStatusMessage("");
            await createBooking({ itemId, startDate, endDate });
            setStatusType("success");
            setStatusMessage("Booking confirmed successfully.");
        } catch (error) {
            setStatusType("error");
            setStatusMessage(error.message || "Unable to confirm booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <aside className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-xl font-semibold text-text">
                ${dailyPrice}
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
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">bookingStatus: confirmed</div>
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">paymentStatus: pending</div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-accent/25 p-2 text-xs text-text/70">
                paymentId: razorpay_id_optional
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-text/70">
                    <span>
                        ${dailyPrice} x {dayCount || 0} days
                    </span>
                    <span>${totalPrice || 0}</span>
                </div>
                <div className="flex items-center justify-between text-text/70">
                    <span>Deposit Amount</span>
                    <span>${depositAmount}</span>
                </div>
                <div className="h-px bg-accent/20" />
                <div className="flex items-center justify-between font-semibold text-text">
                    <span>Payable Now</span>
                    <span>${payableNow || 0}</span>
                </div>
            </div>

            <Button
                className="mt-5 w-full cursor-pointer"
                onClick={handleConfirmBooking}
                disabled={isBookingDisabled}
            >
                {isAlreadyBooked ? "Booked" : isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>

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