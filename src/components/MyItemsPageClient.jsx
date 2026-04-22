"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { deleteItemListing, getMyItems } from "@/services/itemService";
import { getMyItemsBookings } from "@/services/bookingService";
import RemoveItemConfirmModal from "@/components/RemoveItemConfirmModal";

const statusStyles = {
    available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    booked: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString("en-IN")}`;
}

function StatCard({ label, value, hint, valueClassName = "text-text" }) {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-text/70">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <p className={`text-3xl font-semibold ${valueClassName}`}>{value}</p>
                {hint ? <span className="text-xs text-text/55">{hint}</span> : null}
            </div>
        </article>
    );
}

function StatCardSkeleton() {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded-full bg-text/10" />
            <div className="mt-3 flex items-end justify-between gap-3">
                <div className="h-8 w-24 animate-pulse rounded-full bg-text/15" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-text/10" />
            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-accent/20 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                        <div className="h-36 rounded-2xl bg-bg/80" />
                        <div className="space-y-3">
                            <div className="h-4 w-24 rounded-full bg-bg/80" />
                            <div className="h-6 w-2/3 rounded-full bg-bg/80" />
                            <div className="h-4 w-1/2 rounded-full bg-bg/80" />
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="h-16 rounded-2xl bg-bg/80" />
                                <div className="h-16 rounded-2xl bg-bg/80" />
                                <div className="h-16 rounded-2xl bg-bg/80" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <section className="rounded-2xl border border-dashed border-accent/25 bg-card p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <p className="mt-2 text-sm text-text/70">{description}</p>
        </section>
    );
}

function ItemCard({ item, itemRevenue, onDelete, isDeleting = false }) {
    const imageUrl = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";
    const isAvailable = item.availability?.isAvailable ?? true;

    return (
        <article className="overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr] sm:p-5">
                <div className="relative h-40 overflow-hidden rounded-2xl bg-bg/80 sm:h-full">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="grid h-full place-items-center bg-linear-to-br from-primary/10 via-card to-accent/10 text-sm font-semibold text-text/50">
                            No image
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Listed item</p>
                            <h3 className="mt-1 text-xl font-semibold text-text">{item.title}</h3>
                            <p className="mt-1 text-sm text-text/70">
                                {item.location?.address ? `${item.location.address}, ` : ""}{item.location?.city || "Location not specified"}
                            </p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isAvailable ? statusStyles.available : statusStyles.booked}`}>
                            {isAvailable ? "Available" : "Booked"}
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Per day</p>
                            <p className="mt-1 text-sm font-medium text-text">{formatCurrency(item.pricePerDay)}</p>
                        </div>
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Deposit</p>
                            <p className="mt-1 text-sm font-medium text-text">{formatCurrency(item.depositAmount)}</p>
                        </div>
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Bookings</p>
                            <p className="mt-1 text-sm font-medium text-text">{item.bookingsCount || 0}</p>
                        </div>
                        <div className="rounded-2xl bg-bg/80 p-3">
                            <p className="text-xs uppercase tracking-wide text-text/60">Revenue</p>
                            <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                                {formatCurrency(itemRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isDeleting}
                            onClick={() => onDelete?.(item)}
                            className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        >
                            {isDeleting ? "Removing..." : "Remove item"}
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function MyItemsPageClient() {
    const [myItems, setMyItems] = useState([]);
    const [myItemsBookings, setMyItemsBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [deletingItemId, setDeletingItemId] = useState("");
    const [itemPendingRemoval, setItemPendingRemoval] = useState(null);

    useEffect(() => {
        const loadItems = async () => {
            try {
                setIsLoading(true);
                setError("");
                setActionError("");

                const [items, bookings] = await Promise.all([
                    getMyItems(),
                    getMyItemsBookings(),
                ]);

                setMyItems(items);
                setMyItemsBookings(bookings);
            } catch {
                setError("Unable to load your items right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadItems();
    }, []);

    const itemsWithRevenue = useMemo(() => {
        const revenueByItem = myItemsBookings.reduce((accumulator, booking) => {
            const key = booking.itemId || booking.item?._id || booking.item;
            if (!key) {
                return accumulator;
            }

            accumulator[key] = (accumulator[key] || 0) + Number(booking.totalPrice || 0);
            return accumulator;
        }, {});

        return myItems.map((item) => ({
            ...item,
            bookingsCount: myItemsBookings.filter((booking) => String(booking.itemId || booking.item?._id || booking.item) === String(item._id)).length,
            itemRevenue: revenueByItem[item._id] || 0,
        }));
    }, [myItems, myItemsBookings]);

    const totalListedItems = myItems.length;
    const totalRevenue = itemsWithRevenue.reduce((sum, item) => sum + Number(item.itemRevenue || 0), 0);

    const handleDeleteItem = async (item) => {
        if (!item?._id) {
            return;
        }

        setItemPendingRemoval(item);
    };

    const confirmDeleteItem = async () => {
        if (!itemPendingRemoval?._id) {
            return;
        }

        try {
            setDeletingItemId(itemPendingRemoval._id);
            setActionError("");
            await deleteItemListing(itemPendingRemoval._id);

            setMyItems((currentItems) => currentItems.filter((currentItem) => String(currentItem._id) !== String(itemPendingRemoval._id)));
            setMyItemsBookings((currentBookings) => currentBookings.filter((booking) => String(booking.itemId || booking.item?._id || booking.item) !== String(itemPendingRemoval._id)));
            setItemPendingRemoval(null);
        } catch (deleteError) {
            setActionError(deleteError.message || "Unable to remove this item right now.");
        } finally {
            setDeletingItemId("");
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="My Items" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="My Items" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 sm:grid-cols-2">
                        {isLoading ? (
                            <>
                                <StatCardSkeleton />
                                <StatCardSkeleton />
                            </>
                        ) : (
                            <>
                                <StatCard label="Total Listed Items" value={totalListedItems} hint="All items you added" />
                                <StatCard
                                    label="Revenue From Items"
                                    value={formatCurrency(totalRevenue)}
                                    hint="From item bookings"
                                    valueClassName="text-emerald-600 dark:text-emerald-300"
                                />
                            </>
                        )}
                    </section>

                    <section className="theme-card overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm">
                        <div className="border-b border-accent/20 bg-linear-to-br from-primary/10 via-card to-accent/10 p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">My Items</p>
                            <h1 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">Listed items dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-text/70">
                                View every item you published, track how many bookings each one has, and monitor the revenue generated from them.
                            </p>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            {isLoading ? (
                                <LoadingState />
                            ) : error ? (
                                <section className="rounded-2xl border border-dashed border-red-300 bg-card p-10 text-center">
                                    <h3 className="text-lg font-semibold text-red-600">Could not load items</h3>
                                    <p className="mt-2 text-sm text-text/70">{error}</p>
                                    <Button className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </section>
                            ) : itemsWithRevenue.length ? (
                                <>
                                    {actionError ? (
                                        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                                            {actionError}
                                        </section>
                                    ) : null}

                                <div className="grid gap-4">
                                    {itemsWithRevenue.map((item) => (
                                        <ItemCard
                                            key={item._id}
                                            item={item}
                                            itemRevenue={item.itemRevenue}
                                            onDelete={handleDeleteItem}
                                            isDeleting={deletingItemId === item._id}
                                        />
                                    ))}
                                </div>
                                </>
                            ) : (
                                <EmptyState
                                    title="No listed items yet"
                                    description="Once you add items from the Add Listing page, they will appear here with revenue and booking counts."
                                />
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <RemoveItemConfirmModal
                open={Boolean(itemPendingRemoval)}
                itemTitle={itemPendingRemoval?.title || ""}
                isDeleting={Boolean(itemPendingRemoval && deletingItemId === itemPendingRemoval._id)}
                onClose={() => {
                    if (!deletingItemId) {
                        setItemPendingRemoval(null);
                    }
                }}
                onConfirm={confirmDeleteItem}
            />
        </div>
    );
}