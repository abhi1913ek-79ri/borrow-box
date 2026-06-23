"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getWallet } from "@/services/walletService";

// ─── Card definitions ────────────────────────────────────────────────────────

const earningsCards = [
    {
        key: "availableBalance",
        label: "Available Balance",
        description: "Your current wallet balance from completed rentals",
        icon: "wallet",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
        valueClassName: "text-emerald-600 dark:text-emerald-300",
        badge: null,
    },
    {
        key: "pendingBalance",
        label: "Pending Earnings",
        description: "Earnings from active rentals awaiting return confirmation",
        icon: "clock",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
        valueClassName: "text-amber-600 dark:text-amber-300",
        badge: null,
    },
    {
        key: "totalEarned",
        label: "Total Earned",
        description: "Lifetime earnings from all completed bookings",
        icon: "trending",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        valueClassName: "text-primary",
        badge: null,
    },
];

const depositCards = [
    {
        key: "lockedDeposits",
        label: "Locked Deposits",
        description: "Security deposits held by Vyntra for your active rentals",
        icon: "lock",
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-500",
        valueClassName: "text-rose-600 dark:text-rose-400",
        badge: { label: "LOCKED", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
    },
    {
        key: "releasedDeposits",
        label: "Released Deposits",
        description: "Security deposits returned after successful rental completion",
        icon: "unlock",
        iconBg: "bg-sky-500/10",
        iconColor: "text-sky-500",
        valueClassName: "text-sky-600 dark:text-sky-300",
        badge: { label: "RELEASED", className: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value) {
    return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function WalletIcon({ type }) {
    const cls = "h-5 w-5";

    if (type === "clock") {
        return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
            </svg>
        );
    }

    if (type === "trending") {
        return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 17l5.5-5.5 4 4L20 9" />
                <path d="M15 9h5v5" />
            </svg>
        );
    }

    if (type === "lock") {
        return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    if (type === "unlock") {
        return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0" />
                <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    // default: wallet
    return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="6" width="17" height="12" rx="3" />
            <path d="M16 10.5h2.5v3H16a1.5 1.5 0 0 1 0-3Z" />
            <path d="M6.5 6V4.8c0-1 .9-1.7 1.8-1.4l7.4 2.6" />
        </svg>
    );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function SummaryCard({ card, value }) {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-text/70">{card.label}</p>
                        {card.badge ? (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${card.badge.className}`}>
                                {card.badge.label}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-text/60">{card.description}</p>
                </div>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${card.iconBg} ${card.iconColor}`}>
                    <WalletIcon type={card.icon} />
                </span>
            </div>
            <p className={`mt-4 text-3xl font-semibold ${card.valueClassName}`}>
                {formatCurrency(value)}
            </p>
        </article>
    );
}

function SummaryCardSkeleton() {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-text/10" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-text/10" />
                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-text/10" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/10" />
            </div>
            <div className="mt-5 h-8 w-36 animate-pulse rounded-full bg-text/15" />
        </article>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
            <h2 className="mt-1 text-lg font-semibold text-text">{title}</h2>
            {description ? <p className="mt-1 text-sm text-text/60">{description}</p> : null}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPageClient() {
    const [wallet, setWallet] = useState({
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        lockedDeposits: 0,
        releasedDeposits: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadWallet = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getWallet();
                setWallet(data.wallet);
            } catch (walletError) {
                setError(walletError.message || "Unable to load wallet right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadWallet();
    }, []);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="Wallet" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Wallet" />

                <div className="vyntra-scroll min-h-0 space-y-8 md:h-full md:overflow-y-auto md:pr-2">

                    {/* Error state */}
                    {error ? (
                        <section className="rounded-2xl border border-dashed border-red-300 bg-card p-10 text-center shadow-sm">
                            <h3 className="text-lg font-semibold text-red-600">Could not load wallet</h3>
                            <p className="mt-2 text-sm text-text/70">{error}</p>
                            <button
                                type="button"
                                className="mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </section>
                    ) : null}

                    {/* Earnings section (owner-side) */}
                    <section>
                        <SectionHeader
                            eyebrow="Earnings"
                            title="Your rental income"
                            description="Money earned from items you've rented out"
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {isLoading ? (
                                <>
                                    <SummaryCardSkeleton />
                                    <SummaryCardSkeleton />
                                    <SummaryCardSkeleton />
                                </>
                            ) : (
                                earningsCards.map((card) => (
                                    <SummaryCard key={card.key} card={card} value={wallet[card.key]} />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="border-t border-accent/15" />

                    {/* Deposits section (renter-side) */}
                    <section>
                        <SectionHeader
                            eyebrow="Security Deposits"
                            title="Your deposit activity"
                            description="Security deposits you've paid as a renter — held while active, released on completion"
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {isLoading ? (
                                <>
                                    <SummaryCardSkeleton />
                                    <SummaryCardSkeleton />
                                </>
                            ) : (
                                depositCards.map((card) => (
                                    <SummaryCard key={card.key} card={card} value={wallet[card.key]} />
                                ))
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
