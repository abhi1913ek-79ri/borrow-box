"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const THEMES = ["light", "dark", "glass", "sunset", "aurora", "neon"];

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => { },
    themes: THEMES,
});

function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState("light");
    const hasLoadedStoredTheme = useRef(false);

    useEffect(() => {
        const storedTheme = window.localStorage.getItem("theme");
        const nextTheme = storedTheme && THEMES.includes(storedTheme) ? storedTheme : "light";

        window.requestAnimationFrame(() => {
            hasLoadedStoredTheme.current = true;
            applyTheme(nextTheme);
            setThemeState(nextTheme);
        });
    }, []);

    useEffect(() => {
        if (!hasLoadedStoredTheme.current) {
            return;
        }

        applyTheme(theme);
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
