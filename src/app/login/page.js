<<<<<<< Updated upstream
=======
"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import GoogleAuthModal from "@/components/GoogleAuthModal";

export default function LoginPage() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <section className="theme-card w-full max-w-2xl overflow-hidden rounded-[2rem] border border-accent/20 bg-card shadow-xl shadow-black/10">
                    <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                            <div className="relative">
                                <p className="inline-flex rounded-full border border-accent/20 bg-bg/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-text/70">
                                    Secure access
                                </p>
                                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                                    One click, one Google account.
                                </h1>
                                <p className="mt-4 max-w-md text-sm leading-6 text-text/70 sm:text-base">
                                    Sign in to manage listings, bookings, and your profile without creating another password.
                                </p>
                            </div>

                            <div className="relative mt-10 grid gap-3 text-sm text-text/70 sm:grid-cols-2">
                                <div className="rounded-2xl border border-accent/15 bg-bg/60 p-4">
                                    Fast sign in
                                </div>
                                <div className="rounded-2xl border border-accent/15 bg-bg/60 p-4">
                                    Theme-aware dialog
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center border-t border-accent/15 p-8 sm:p-10 lg:border-l lg:border-t-0">
                            <div className="rounded-[1.75rem] border border-accent/20 bg-bg/70 p-6 text-center">
                                <p className="text-sm font-medium text-text/70">Google sign-in is the only available option.</p>
                                <Button className="mt-5 w-full" onClick={() => setIsLoginModalOpen(true)}>
                                    Open sign in popup
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <GoogleAuthModal
                open={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                callbackUrl="/"
            />
        </div>
    );
}
>>>>>>> Stashed changes
