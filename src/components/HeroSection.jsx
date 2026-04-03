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
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium tracking-[0.24em] text-blue-100">VYNTRA MARKETPLACE</p>
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
                    Share what you own. Rent what you need. Earn while you sleep.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-blue-100 sm:text-base">
                    A premium peer-to-peer rental platform for gadgets, gear, and lifestyle essentials with frictionless bookings.
                </p>

                <form
                    onSubmit={handleSearch}
                    className="mx-auto mt-7 flex max-w-2xl flex-col items-stretch gap-3 rounded-2xl bg-white/90 p-3 shadow-xl backdrop-blur sm:flex-row"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by item, category, or location"
                        className="h-12 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <Button type="submit" className="h-12 px-6">Search Rentals</Button>
                    <Button type="button" variant="secondary" className="h-12 px-6" onClick={() => router.push("/items")}>Browse Items</Button>
                </form>
            </div>
        </section>
    );
}