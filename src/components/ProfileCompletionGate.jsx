"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "./Button";
import { useTheme } from "@/context/ThemeContext";

const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

const emptyFormState = {
    name: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
};

export default function ProfileCompletionGate() {
    const router = useRouter();
    const { theme } = useTheme();
    const { data: session, status } = useSession();
    const dialogRef = useRef(null);
    const [formState, setFormState] = useState(emptyFormState);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

    const isProfileComplete = Boolean(session?.user?.isProfileComplete);
    const isGateOpen = status === "authenticated" && !isProfileComplete && !hasCompletedProfile;

    useEffect(() => {
        if (!isGateOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const phoneInput = dialogRef.current?.querySelector('input[name="phone"]');
        phoneInput?.focus();

        const handleKeyDown = (event) => {
            if (event.key !== "Tab") {
                return;
            }

            const focusableElements = dialogRef.current?.querySelectorAll(
                'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            if (!focusableElements || focusableElements.length === 0) {
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isGateOpen]);

    useEffect(() => {
        if (status !== "authenticated") {
            setHasCompletedProfile(false);
            setFormState(emptyFormState);
            setError("");
            return;
        }

        setHasCompletedProfile(false);
        setFormState((prev) => ({
            ...prev,
            name: session?.user?.name || "",
            phone: session?.user?.phone || "",
        }));
        setError("");
    }, [session?.user?.email, session?.user?.name, session?.user?.phone, status]);

    if (!isGateOpen || typeof window === "undefined") {
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

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setFormState((prev) => ({ ...prev, phone: digitsOnly }));
            return;
        }

        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const phone = formState.phone.trim();
        const name = formState.name.trim();
        const city = formState.city.trim();
        const state = formState.state.trim();
        const pincode = formState.pincode.trim();

        if (!name) {
            setError("Please enter your account name.");
            return;
        }

        if (!PHONE_REGEX.test(phone)) {
            setError("Please enter a valid mobile number.");
            return;
        }

        if (!city || !state) {
            setError("City and state are required.");
            return;
        }

        if (!PINCODE_REGEX.test(pincode)) {
            setError("Please enter a valid 6-digit pincode.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const response = await fetch("/api/users/complete-profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    address: {
                        city,
                        state,
                        pincode,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.error || "Unable to complete your profile right now.");
            }

            setHasCompletedProfile(true);
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to complete your profile right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/80 px-4 py-6">
            <div
                ref={dialogRef}
            className={`relative w-full max-w-xl overflow-hidden rounded-4xl border border-accent/20 bg-card text-text shadow-2xl shadow-black/30 ${theme === "glass" ? "backdrop-blur-xl" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-completion-title"
            >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${themeAccent[theme] || themeAccent.light}`} />

                <div className="relative px-6 pb-6 pt-14 sm:px-8 sm:pb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-accent/20 bg-bg/70 shadow-lg shadow-primary/20">
                        <span className="text-2xl font-black tracking-tight text-text">V</span>
                    </div>

                    <div className="mt-5 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Complete profile</p>
                        <h2 id="profile-completion-title" className="mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                            Complete your profile to continue
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-text/70 sm:text-base">
                            Add your phone number and address so you can keep using Vyntra without interruption.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Account name</span>
                            <input
                                name="name"
                                type="text"
                                value={formState.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Email</span>
                            <input
                                type="email"
                                value={session?.user?.email || "-"}
                                readOnly
                                aria-readonly="true"
                                className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text/75 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <span className="mt-1 block text-xs text-text/55">Fixed to your Google account.</span>
                        </label>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Phone number</span>
                            <input
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                value={formState.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <label className="block sm:col-span-1">
                                <span className="mb-1 block text-sm font-medium text-text">City</span>
                                <input
                                    name="city"
                                    type="text"
                                    value={formState.city}
                                    onChange={handleChange}
                                    placeholder="Delhi"
                                    className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

                            <label className="block sm:col-span-1">
                                <span className="mb-1 block text-sm font-medium text-text">State</span>
                                <input
                                    name="state"
                                    type="text"
                                    value={formState.state}
                                    onChange={handleChange}
                                    placeholder="Delhi"
                                    className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

                            <label className="block sm:col-span-1">
                                <span className="mb-1 block text-sm font-medium text-text">Pincode</span>
                                <input
                                    name="pincode"
                                    type="text"
                                    inputMode="numeric"
                                    value={formState.pincode}
                                    onChange={handleChange}
                                    placeholder="110094"
                                    className="h-11 w-full rounded-2xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                        </div>

                        {error && (
                            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                                {error}
                            </p>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="min-w-40 px-6" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Complete Profile"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body,
    );
}