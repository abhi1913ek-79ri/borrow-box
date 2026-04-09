"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const labels = {
    light: "Light",
    dark: "Dark",
    glass: "Glass",
    sunset: "Sunset",
    aurora: "Aurora",
    neon: "Neon",
};

export default function ThemeSwitcher({
    className = "",
    buttonClassName = "",
    menuClassName = "",
    itemClassName = "",
}) {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const activeLabel = labels[theme] || theme;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-2xl border border-accent/25 bg-card/85 px-3 py-2 text-xs font-semibold text-text shadow-sm hover:-translate-y-0.5 hover:bg-accent/10 ${buttonClassName}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Open theme menu"
            >
                <span>{activeLabel}</span>
                <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div className={`absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-40 rounded-2xl border border-accent/25 bg-card p-1.5 shadow-lg shadow-black/10 ${menuClassName}`} role="menu" aria-label="Theme options">
                    {themes.map((themeName) => {
                        const isActive = theme === themeName;

                        return (
                            <button
                                key={themeName}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isActive}
                                onClick={() => {
                                    setTheme(themeName);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center justify-start gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-all ${isActive
                                    ? "bg-primary text-bg"
                                    : "text-text/85 hover:bg-accent/10"
                                    } ${itemClassName}`}
                            >
                                <span>{labels[themeName] || themeName}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
