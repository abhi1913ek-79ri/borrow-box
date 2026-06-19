"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import { getWallet } from "@/services/walletService";

const summaryCards = [
    {
        key: "availableBalance",
        label: "Available Balance",
        description: "Amount available for withdrawal",
        icon: "wallet",
        valueClassName: "text-emerald-600 dark:text-emerald-300",
    },
    {
        key: "pendingBalance",
        label: "Pending Earnings",
        description: "Earnings from active rentals awaiting return confirmation",
        icon: "clock",
        valueClassName: "text-amber-600 dark:text-amber-300",
    },
    {
        key: "totalEarned",
        label: "Total Earned",
        description: "Lifetime earnings from completed bookings",
        icon: "trending",
        valueClassName: "text-primary",
    },
];

const transactionLabels = {
    RENT_EARNING: "Rent earning",
    DEPOSIT_REFUND: "Deposit refund",
};

const statusStyles = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    failed: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatCurrency(value) {
    return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
    if (!value) {
        return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatBookingId(value) {
    if (!value) {
        return "Unavailable";
    }

    return `#${String(value).slice(-8).toUpperCase()}`;
}

function normalizeStatus(status) {
    return String(status || "completed").toLowerCase();
}

function labelStatus(status) {
    const normalized = normalizeStatus(status);

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function WalletIcon({ type }) {
    const iconClass = "h-5 w-5";

    if (type === "clock") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
            </svg>
        );
    }

    if (type === "trending") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 17l5.5-5.5 4 4L20 9" />
                <path d="M15 9h5v5" />
            </svg>
        );
    }

    if (type === "empty") {
        return (
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3.5" y="6" width="17" height="12" rx="3" />
                <path d="M16 10.5h2.5v3H16a1.5 1.5 0 0 1 0-3Z" />
                <path d="M6.5 6V4.8c0-1 .9-1.7 1.8-1.4l7.4 2.6" />
            </svg>
        );
    }

    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="6" width="17" height="12" rx="3" />
            <path d="M16 10.5h2.5v3H16a1.5 1.5 0 0 1 0-3Z" />
            <path d="M6.5 6V4.8c0-1 .9-1.7 1.8-1.4l7.4 2.6" />
        </svg>
    );
}

function SummaryCard({ card, value }) {
    return (
        <article className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-text/70">{card.label}</p>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-text/60">{card.description}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
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

function StatusBadge({ status }) {
    const normalized = normalizeStatus(status);
    const className = statusStyles[normalized] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
            {labelStatus(status)}
        </span>
    );
}

function TransactionCard({ transaction }) {
    return (
        <article className="rounded-2xl border border-accent/20 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-text">{transaction.itemName || transaction.itemTitle || "Booking"}</p>
                    <p className="mt-1 text-xs text-text/60">{formatDate(transaction.createdAt)}</p>
                </div>
                <StatusBadge status={transaction.status} />
            </div>

            <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-text/60">Booking ID</span>
                    <span className="font-medium text-text">{formatBookingId(transaction.bookingId || transaction.booking)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-text/60">Transaction Type</span>
                    <span className="font-medium text-text">{transactionLabels[transaction.type] || transaction.type}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-text/60">Amount</span>
                    <span className="font-semibold text-text">{formatCurrency(transaction.amount)}</span>
                </div>
            </div>
        </article>
    );
}

function TransactionSkeletonList() {
    return (
        <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-accent/20 bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="h-4 w-36 rounded-full bg-text/10" />
                            <div className="h-3 w-24 rounded-full bg-text/10" />
                        </div>
                        <div className="h-6 w-20 rounded-full bg-text/10" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="h-12 rounded-2xl bg-bg/80" />
                        <div className="h-12 rounded-2xl bg-bg/80" />
                        <div className="h-12 rounded-2xl bg-bg/80" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <section className="rounded-2xl border border-dashed border-accent/25 bg-card p-10 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <WalletIcon type="empty" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text">No wallet activity yet.</h3>
            <p className="mt-2 text-sm text-text/70">Your earnings from completed rentals will appear here.</p>
        </section>
    );
}

export default function WalletPageClient() {
    const [wallet, setWallet] = useState({
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadWallet = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getWallet();
                setWallet(data.wallet);
                setTransactions(data.transactions);
            } catch (walletError) {
                setError(walletError.message || "Unable to load wallet right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadWallet();
    }, []);

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((left, right) => {
            const leftTime = new Date(left.createdAt || 0).getTime();
            const rightTime = new Date(right.createdAt || 0).getTime();

            return rightTime - leftTime;
        });
    }, [transactions]);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="Wallet" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Wallet" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 lg:grid-cols-3">
                        {isLoading ? (
                            <>
                                <SummaryCardSkeleton />
                                <SummaryCardSkeleton />
                                <SummaryCardSkeleton />
                            </>
                        ) : (
                            summaryCards.map((card) => (
                                <SummaryCard key={card.key} card={card} value={wallet[card.key]} />
                            ))
                        )}
                    </section>

                    <section className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Withdraw</p>
                                <h2 className="mt-2 text-2xl font-semibold text-text">Move earnings to your bank</h2>
                                <p className="mt-2 text-sm text-text/70">
                                    Payouts will be transferred to your linked bank account.
                                </p>
                            </div>
                            <Button
                                type="button"
                                disabled={isLoading || Number(wallet.availableBalance || 0) === 0}
                                className="w-full sm:w-auto"
                            >
                                Withdraw Funds
                            </Button>
                        </div>
                    </section>

                    <section className="theme-card overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm">
                        <div className="border-b border-accent/20 bg-linear-to-br from-primary/10 via-card to-accent/10 p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Wallet</p>
                            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                                <h1 className="text-3xl font-semibold text-text sm:text-4xl">Transaction history</h1>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    {sortedTransactions.length} records
                                </span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-text/70">
                                Track rental earnings, deposit refunds, payout readiness, and transaction status.
                            </p>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            {isLoading ? (
                                <>
                                    <Loader count={3} />
                                    <TransactionSkeletonList />
                                </>
                            ) : error ? (
                                <section className="rounded-2xl border border-dashed border-red-300 bg-card p-10 text-center">
                                    <h3 className="text-lg font-semibold text-red-600">Could not load wallet</h3>
                                    <p className="mt-2 text-sm text-text/70">{error}</p>
                                    <Button className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </section>
                            ) : sortedTransactions.length ? (
                                <>
                                    <div className="hidden overflow-hidden rounded-2xl border border-accent/15 md:block">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[760px] text-left text-sm">
                                                <thead className="bg-bg/80 text-xs uppercase tracking-wide text-text/60">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold">Date</th>
                                                        <th className="px-4 py-3 font-semibold">Item Name</th>
                                                        <th className="px-4 py-3 font-semibold">Booking ID</th>
                                                        <th className="px-4 py-3 font-semibold">Transaction Type</th>
                                                        <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                                        <th className="px-4 py-3 font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-accent/10 bg-card">
                                                    {sortedTransactions.map((transaction) => (
                                                        <tr key={transaction.id}>
                                                            <td className="px-4 py-3 text-text/70">{formatDate(transaction.createdAt)}</td>
                                                            <td className="px-4 py-3 font-medium text-text">{transaction.itemName || transaction.itemTitle || "Booking"}</td>
                                                            <td className="px-4 py-3 text-text/70">{formatBookingId(transaction.bookingId || transaction.booking)}</td>
                                                            <td className="px-4 py-3 text-text/70">
                                                                {transactionLabels[transaction.type] || transaction.type}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-text">
                                                                {formatCurrency(transaction.amount)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <StatusBadge status={transaction.status} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:hidden">
                                        {sortedTransactions.map((transaction) => (
                                            <TransactionCard key={transaction.id} transaction={transaction} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
