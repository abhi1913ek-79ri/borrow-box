"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function HeroSection() {
    const [search, setSearch] = useState("");
    const router = useRouter();

    const handleSearch = (event) => {
        event.preventDefault();
        const query = search.trim();
        router.push(query ? `/items?search=${encodeURIComponent(query)}` : "/items");
    };

    return (
        <section className="theme-surface relative overflow-hidden rounded-3xl border border-accent/20 bg-linear-to-br from-primary/95 via-primary/85 to-accent/80 p-6 text-bg shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-bg/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium tracking-[0.24em] text-bg/85">VYNTRA MARKETPLACE</p>
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
                    Share what you own. Rent what you need. Earn while you sleep.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-bg/85 sm:text-base">
                    A premium peer-to-peer rental platform for gadgets, gear, and lifestyle essentials with frictionless bookings.
                </p>

                <form
                    onSubmit={handleSearch}
                    className="theme-card mx-auto mt-7 flex max-w-2xl flex-col items-stretch gap-3 rounded-2xl border border-accent/25 bg-card/90 p-3 shadow-xl backdrop-blur sm:flex-row"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by item, category, or location"
                        className="h-12 flex-1 rounded-xl border border-accent/25 bg-bg/80 px-4 text-sm text-text placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button type="submit" className="h-12 px-6">Search Rentals</Button>
                    <Button type="button" variant="secondary" className="h-12 px-6" onClick={() => router.push("/items")}>Browse Items</Button>
                </form>
            </div>
        </section>
    );
}