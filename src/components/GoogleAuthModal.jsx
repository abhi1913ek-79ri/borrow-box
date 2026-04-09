"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import Button from "./Button";
import { useTheme } from "@/context/ThemeContext";

function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.35 11.1H12.2v2.98h5.24c-.23 1.42-1.02 2.63-2.19 3.44v2.86h3.55c2.07-1.91 3.27-4.72 3.27-8.04 0-.74-.07-1.46-.22-2.24Z" />
            <path fill="#34A853" d="M12.2 22c2.96 0 5.44-.98 7.26-2.66l-3.55-2.86c-.98.66-2.24 1.05-3.71 1.05-2.84 0-5.25-1.92-6.11-4.52H2.37v2.92A10 10 0 0 0 12.2 22Z" />
            <path fill="#FBBC05" d="M6.09 12.99a6.02 6.02 0 0 1 0-3.98V6.09H2.37a10 10 0 0 0 0 8.8l3.72-1.9Z" />
            <path fill="#EA4335" d="M12.2 5.02c1.6 0 3.04.55 4.17 1.63l3.13-3.13A10 10 0 0 0 12.2 2C8.55 2 5.38 4.09 3.5 6.09l2.59 2.92c.86-2.6 3.27-3.99 6.11-3.99Z" />
        </svg>
    );
}

export default function GoogleAuthModal({ open, onClose, callbackUrl = "/" }) {
    const { theme } = useTheme();
    const handleClose = () => onClose();


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

    if (!open) {
        return null;
    }

    if (typeof window === "undefined") {
        return null;
    }

    const themeAccent = {
        light: "from-primary/20 via-card to-accent/20",
        dark: "from-primary/30 via-card to-accent/20",
        glass: "from-primary/25 via-card to-accent/25",
        sunset: "from-primary/20 via-card to-accent/25",
        aurora: "from-primary/25 via-card to-accent/20",
        neon: "from-primary/30 via-card to-accent/30",
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className={`relative w-full max-w-md overflow-hidden rounded-4xl border border-accent/20 bg-card text-text shadow-2xl shadow-black/30 ${theme === "glass" ? "backdrop-blur-xl" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="google-auth-title"
            >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${themeAccent[theme] || themeAccent.light}`} />

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        handleClose();
                    }}
                    className="absolute right-4 top-4 z-10 rounded-full border border-accent/20 bg-bg/70 p-2 text-text/70 hover:bg-accent/10 hover:text-text"
                    aria-label="Close sign in dialog"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative flex flex-col items-center px-6 pb-7 pt-14 text-center sm:px-8">
                    <div className="mb-5 grid h-20 w-20 place-items-center rounded-[1.6rem] border border-accent/20 bg-bg/70 shadow-lg shadow-primary/20">
                        <span className="text-3xl font-black tracking-tight text-text">V</span>
                    </div>

                    <h2 id="google-auth-title" className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                        Sign in to Vyntra
                    </h2>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-text/70 sm:text-base">
                        Use your Google account to access bookings, listings, and your profile in one step.
                    </p>

                    <div className="mt-7 w-full">
                        <Button
                            type="button"
                            className="w-full gap-3 rounded-2xl py-3.5 text-sm shadow-md shadow-primary/20 cursor-pointer"
                            onClick={() => signIn("google", { callbackUrl })}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </Button>
                    </div>

                    <p className="mt-4 max-w-xs text-xs leading-5 text-text/55">
                        By continuing, you will be redirected to Google for authentication and returned to Vyntra after sign in.
                    </p>
                </div>
            </div>
        </div>
        ,
        document.body,
    );
}