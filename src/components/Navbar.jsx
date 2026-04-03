"use client";

import Link from "next/link";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ isLoggedIn = false }) {
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

                <div className="hidden flex-1 justify-center md:flex">
                    <div className="flex w-full max-w-xl items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <input
                            type="text"
                            placeholder="Search cameras, bikes, consoles..."
                            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    {isLoggedIn ? (
                        <Button variant="secondary" className="px-3 sm:px-4">
                            Profile
                        </Button>
                    ) : (
                        <Link href="/login">
                            <Button className="px-3 sm:px-4">Login</Button>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="mx-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <input
                        type="text"
                        placeholder="Search items"
                        className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                    />
                </div>
            </div>
        </header>
    );
}
