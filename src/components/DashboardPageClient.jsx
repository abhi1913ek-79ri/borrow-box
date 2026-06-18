"use client";

import { useEffect, useMemo, useState } from "react";
import AddItemForm from "@/components/AddItemForm";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getMyBookings, getMyItemsBookings } from "@/services/bookingService";
import { getNotifications } from "@/services/notificationService";
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

function formatNotificationTime(createdAt) {
    if (!createdAt) {
        return "Just now";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Just now";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function DashboardPageClient() {
    const [myItems, setMyItems] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [myItemsBookings, setMyItemsBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [notificationsError, setNotificationsError] = useState("");

    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                setIsLoading(true);
                setError("");
                setNotificationsError("");

                const [items, bookings, itemBookings, notificationData] = await Promise.all([
                    getMyItems(),
                    getMyBookings(),
                    getMyItemsBookings(),
                    getNotifications().catch((notificationError) => ({
                        notifications: [],
                        error: notificationError.message || "Unable to load notifications right now.",
                    })),
                ]);

                setMyItems(items);
                setMyBookings(bookings);
                setMyItemsBookings(itemBookings);
                setNotifications(notificationData.notifications || []);

                if (notificationData.error) {
                    setNotificationsError(notificationData.error);
                }
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

                    <section className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-text">Booking notifications</h3>
                                <p className="mt-1 text-sm text-text/70">
                                    Latest booking updates for your items.
                                </p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {notifications.filter((notification) => !notification.isRead).length} unread
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {notificationsError ? (
                                <div className="rounded-xl border border-dashed border-accent/25 bg-bg/70 px-4 py-4 text-sm text-text/70">
                                    {notificationsError}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-accent/25 bg-bg/70 px-4 py-4 text-sm text-text/70">
                                    No booking notifications yet.
                                </div>
                            ) : (
                                notifications.slice(0, 5).map((notification) => (
                                    <article
                                        key={notification.id}
                                        className={`rounded-xl border px-4 py-3 ${notification.isRead ? "border-accent/15 bg-bg/70" : "border-primary/20 bg-primary/5"}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-text">{notification.title}</p>
                                                <p className="mt-1 text-sm text-text/70">{notification.message}</p>
                                            </div>
                                            <span className="shrink-0 text-[11px] text-text/50">
                                                {formatNotificationTime(notification.createdAt)}
                                            </span>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}