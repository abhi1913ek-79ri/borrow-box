"use client";

import { useEffect, useMemo, useState } from "react";
import AddItemForm from "@/components/AddItemForm";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getMyBookings, getMyItemsBookings } from "@/services/bookingService";
import { getMyItems } from "@/services/itemService";

function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString("en-IN")}`;
}

function StatCard({ label, value, hint, valueClassName = "text-text" }) {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-sm text-text/70">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <p className={`text-2xl font-semibold sm:text-3xl ${valueClassName}`}>{value}</p>
                {hint ? <span className="text-xs text-text/55">{hint}</span> : null}
            </div>
        </article>
    );
}

function LoadingStats() {
    return Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded-full bg-text/10" />
            <div className="mt-3 h-8 w-28 animate-pulse rounded-full bg-text/15" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-text/10" />
        </article>
    ));
}

export default function DashboardPageClient() {
    const [myItems, setMyItems] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [myItemsBookings, setMyItemsBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                setIsLoading(true);
                setError("");

                const [items, bookings, itemBookings] = await Promise.all([
                    getMyItems(),
                    getMyBookings(),
                    getMyItemsBookings(),
                ]);

                setMyItems(items);
                setMyBookings(bookings);
                setMyItemsBookings(itemBookings);
            } catch {
                setError("Unable to load dashboard stats right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardStats();
    }, []);

    const dashboardStats = useMemo(() => {
        const activeListings = myItems.filter((item) => item.availability?.isAvailable ?? true).length;
        const bookings = myItemsBookings.length;
        const revenue = myItemsBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
        const spendings = myBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

        return [
            { label: "Active Listings", value: activeListings},
            { label: "Bookings", value: bookings },
            { label: "Revenue", value: formatCurrency(revenue), valueClassName: "text-emerald-500 dark:text-emerald-300" },
            { label: "Spendings", value: formatCurrency(spendings) },
        ];
    }, [myBookings, myItems, myItemsBookings]);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="Home" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Home" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {isLoading ? (
                            <LoadingStats />
                        ) : error ? (
                            <article className="theme-card rounded-2xl border border-dashed border-accent/25 bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-4">
                                <h3 className="text-lg font-semibold text-text">Could not load dashboard stats</h3>
                                <p className="mt-2 text-sm text-text/70">{error}</p>
                            </article>
                        ) : (
                            dashboardStats.map((stat) => (
                                <StatCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    valueClassName={stat.valueClassName}
                                />
                            ))
                        )}
                    </section>

                    <AddItemForm />

                    <section className="theme-card rounded-2xl border border-dashed border-accent/25 bg-card p-10 text-center">
                        <h3 className="text-lg font-semibold text-text">No recent activity</h3>
                        <p className="mt-2 text-sm text-text/70">
                            Once you receive bookings, updates will show here.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}