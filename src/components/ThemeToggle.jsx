"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/20 bg-card text-lg text-text shadow-sm hover:-translate-y-0.5 hover:bg-accent/10"
        >
            {isDark ? "☀" : "☾"}
        </button>
    );
}