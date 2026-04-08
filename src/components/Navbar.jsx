"use client";

import Link from "next/link";
import Button from "./Button";
import ThemeSwitcher from "./ThemeSwitcher";
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
        <header className="theme-surface sticky top-0 z-40 border-b border-accent/20 bg-card/80 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-base font-bold text-bg shadow-md shadow-primary/40 group-hover:-translate-y-0.5">
                        V
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-text">Vyntra</p>
                        <p className="text-xs text-text/70">Share. Rent. Earn.</p>
                    </div>
                </Link>

                <form onSubmit={handleSearch} className="hidden flex-1 justify-center md:flex">
                    <div className="theme-card flex w-full max-w-xl items-center rounded-2xl border border-accent/20 bg-card px-3 py-2 shadow-sm">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search cameras, bikes, consoles..."
                            className="w-full bg-transparent text-sm text-text placeholder:text-text/60 focus:outline-none"
                        />
                        <Button type="submit" className="ml-2 rounded-xl px-3 py-1.5 text-sm">
                            Search
                        </Button>
                    </div>
                </form>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <ThemeSwitcher className="hidden md:flex" />
                    <Link href={addItemHref} className="hidden md:block">
                        <Button className="px-3 sm:px-4">
                            Add New Item
                        </Button>
                    </Link>
                    {isLoggedIn ? (
                        <>
                            <Link href="/profile" className="hidden md:block">
                                <Button variant="secondary" className="px-3 sm:px-4">
                                    Profile
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login" className="hidden md:block">
                            <Button className="px-3 sm:px-4">Login</Button>
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-card text-text md:hidden"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-nav-panel"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="mx-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="theme-card flex items-center rounded-2xl border border-accent/20 bg-card px-3 py-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search items"
                        className="w-full bg-transparent text-sm text-text placeholder:text-text/60 focus:outline-none"
                    />
                    <Button type="submit" className="ml-2 rounded-xl px-3 py-1.5 text-xs">
                        Go
                    </Button>
                </form>

                {isMobileMenuOpen && (
                    <div id="mobile-nav-panel" className="mt-3 flex min-h-[calc(100dvh-10.5rem)] flex-col gap-3 overflow-y-auto border border-accent/20 bg-card p-3">
                        <Link href={addItemHref} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-start">Add New Item</Button>
                        </Link>

                        {isLoggedIn ? (
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="secondary" className="w-full justify-start">
                                    Profile
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full justify-start">Login</Button>
                            </Link>
                        )}

                        <ThemeSwitcher
                            className="w-full"
                            buttonClassName="w-full justify-between text-left"
                            menuClassName="left-0 right-0"
                            itemClassName="text-left"
                        />

                        {isLoggedIn && mobileSidebarActive && (
                            <SidebarMenu
                                active={mobileSidebarActive}
                                onNavigate={() => setIsMobileMenuOpen(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
