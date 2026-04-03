"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            return true;
        }

        if (storedTheme === "light") {
            return false;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle("dark", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-gray-200 bg-white text-lg text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
            {isDark ? "☀" : "☾"}
        </button>
    );
}