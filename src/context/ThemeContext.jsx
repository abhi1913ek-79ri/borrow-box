"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEMES = ["light", "dark", "glass", "sunset", "aurora", "neon"];

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => { },
    themes: THEMES,
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === "undefined") {
            return "light";
        }

        const storedTheme = window.localStorage.getItem("theme");
        return storedTheme && THEMES.includes(storedTheme) ? storedTheme : "light";
    });

    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        html.classList.toggle("dark", theme === "dark");
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const setTheme = (nextTheme) => {
        if (!THEMES.includes(nextTheme)) {
            return;
        }

        setThemeState(nextTheme);
    };

    const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
