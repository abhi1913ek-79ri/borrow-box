"use client";

import Link from "next/link";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarMenu } from "./Sidebar";

export default function Navbar({ isLoggedIn = false, mobileSidebarActive = "" }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const addItemHref = isLoggedIn ? "/dashboard" : "/add-item";

    const handleSearch = (event) => {
        event.preventDefault();
        router.push(`/items?search=${encodeURIComponent(query)}`);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
            <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-600/30 group-hover:scale-105">
                        V
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Vyntra</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Share. Rent. Earn.</p>
                    </div>
                </Link>

                <form onSubmit={handleSearch} className="hidden flex-1 justify-center md:flex">
                    <div className="flex w-full max-w-xl items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search cameras, bikes, consoles..."
                            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                        />
                        <button type="submit" className="ml-2 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                            Search
                        </button>
                    </div>
                </form>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <Link href={addItemHref} className="hidden md:block">
                        <Button className="bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 px-3 shadow-md shadow-blue-600/30 hover:from-blue-500 hover:via-blue-500 hover:to-cyan-400 sm:px-4">
                            Add New Item
                        </Button>
                    </Link>
                    {isLoggedIn ? (
                        <>
                            {mobileSidebarActive ? (
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 md:hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    aria-label="Open menu"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18M3 12h18M3 18h18" />
                                    </svg>
                                </button>
                            ) : null}

                            <Link href="/profile" className={mobileSidebarActive ? "hidden md:block" : "block"}>
                                <Button variant="secondary" className="px-3 sm:px-4">
                                    Profile
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button className="px-3 sm:px-4">Login</Button>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="mx-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search items"
                        className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                    />
                    <button type="submit" className="ml-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        Go
                    </button>
                </form>

                {isLoggedIn && mobileSidebarActive && isMobileMenuOpen && (
                    <div className="mt-3">
                        <SidebarMenu
                            active={mobileSidebarActive}
                            onNavigate={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                )}
            </div>
        </header>
    );
}
