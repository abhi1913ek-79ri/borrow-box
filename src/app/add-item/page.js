"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import GoogleAuthModal from "@/components/GoogleAuthModal";
import Loader from "@/components/Loader";
import AddItemForm from "@/components/AddItemForm";

export default function AddItemAccessPage() {
    const { status } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);


    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {status === "loading" ? (
                    <section className="space-y-4">
                        <div className="theme-card rounded-3xl border border-accent/20 bg-card p-6 shadow-sm">
                            <h1 className="text-2xl font-semibold text-text">Loading your workspace</h1>
                            <p className="mt-2 text-sm text-text/70">Checking your session before opening the listing form.</p>
                        </div>
                        <Loader count={2} />
                    </section>
                ) : status === "authenticated" ? (
                    <section className="space-y-6">
                        <div className="theme-card rounded-3xl border border-accent/20 bg-card p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Add Listing</p>
                            <h1 className="mt-2 text-3xl font-semibold text-text">Publish a new item</h1>
                            <p className="mt-2 max-w-3xl text-sm text-text/70">
                                Fill in the complete listing details below. This form collects the required payload for the current marketplace flow.
                            </p>
                        </div>

                        <AddItemForm />

                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-accent/20 bg-card p-5 shadow-sm">
                            <div>
                                <p className="text-sm font-semibold text-text">Need a quick reset?</p>
                                <p className="text-sm text-text/70">You can sign out and switch accounts from the profile menu.</p>
                            </div>

                            <Link href="/profile">
                                <Button variant="secondary">Go to Profile</Button>
                            </Link>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto grid max-w-3xl gap-6 rounded-3xl border border-accent/20 bg-card p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Add Listing</p>
                            <h1 className="mt-2 text-3xl font-semibold text-text">Login to create a listing</h1>
                            <p className="mt-3 text-sm leading-6 text-text/70">
                                Adding a new item is available only after sign in. Once you continue with Google, you can open this page again and submit the full listing form.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Button onClick={() => setIsLoginModalOpen(true)}>Continue with Google</Button>
                                <Link href="/login">
                                    <Button variant="secondary">Open Login Page</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-accent/15 bg-bg/60 p-5">
                            <h2 className="text-lg font-semibold text-text">Required fields</h2>
                            <ul className="mt-3 space-y-2 text-sm text-text/70">
                                <li>Title and description</li>
                                <li>Item type and category</li>
                                <li>Price per day, price per hour, and deposit</li>
                                <li>Image URLs and availability</li>
                                <li>Address, city, latitude, and longitude</li>
                            </ul>
                        </div>
                    </section>
                )}
            </main>

            <GoogleAuthModal
                open={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                callbackUrl="/add-item"
            />
        </div>
    );
}
