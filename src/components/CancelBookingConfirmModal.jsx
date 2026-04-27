"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export default function CancelBookingConfirmModal({ open, bookingTitle, onClose, onConfirm, isCancelling = false }) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open || typeof window === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="relative w-full max-w-md overflow-hidden rounded-4xl border border-accent/20 bg-card text-text shadow-2xl shadow-black/30">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-rose-500/20 via-card to-amber-400/10" />

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full border border-accent/20 bg-bg/70 p-2 text-text/70 hover:bg-accent/10 hover:text-text"
                    aria-label="Close booking cancellation confirmation"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative flex flex-col items-center px-6 pb-7 pt-14 text-center sm:px-8">
                    <div className="mb-5 grid h-20 w-20 place-items-center rounded-[1.6rem] border border-rose-200/70 bg-rose-50 shadow-lg shadow-rose-500/10 dark:border-rose-900/40 dark:bg-rose-950/40">
                        <svg className="h-9 w-9 text-rose-600 dark:text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 16l-4-4m0 0 4-4m-4 4h11" />
                            <path d="M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                        </svg>
                    </div>

                    <p className="mb-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                        Confirm cancellation
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                        Cancel this booking?
                    </h2>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-text/70 sm:text-base">
                        {bookingTitle ? (
                            <>
                                <span className="font-semibold text-text">{bookingTitle}</span> will be cancelled and the item will
                                become available again.
                            </>
                        ) : (
                            "This booking will be cancelled and the item will become available again."
                        )}
                    </p>

                    <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
                        <Button type="button" variant="secondary" className="w-full" onClick={onClose} disabled={isCancelling}>
                            Keep booking
                        </Button>
                        <Button type="button" className="w-full bg-rose-600 text-white hover:bg-rose-700" onClick={onConfirm} disabled={isCancelling}>
                            {isCancelling ? "Cancelling..." : "Cancel booking"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}