"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ProfileSkeleton() {
    const { theme } = useTheme();

    const themeAccent = {
        light: "from-primary/20 via-card to-accent/20",
        dark: "from-primary/30 via-card to-accent/20",
        glass: "from-primary/25 via-card to-accent/25",
        sunset: "from-primary/20 via-card to-accent/25",
        aurora: "from-primary/25 via-card to-accent/20",
        neon: "from-primary/30 via-card to-accent/30",
    };

    const isGlassTheme = theme === "glass";

    return (
        <div className="vyntra-scroll min-w-0 max-w-full space-y-6 md:h-full md:overflow-y-auto md:pr-2">
            <section className={`theme-card max-w-full overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm ${isGlassTheme ? "backdrop-blur-xl" : ""}`}>
                <div className={`pointer-events-none h-28 bg-linear-to-r ${themeAccent[theme] || themeAccent.light}`} />

                <div className="px-4 pb-6 sm:px-6">
                    <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
                            <div className={`h-24 w-24 shrink-0 animate-pulse rounded-full border-4 border-bg bg-linear-to-br ${themeAccent[theme] || themeAccent.light} shadow-md shadow-primary/20 sm:h-28 sm:w-28`} />

                            <div className="w-full min-w-0 flex-1 pb-0 space-y-3 sm:pb-2">
                                <div className="h-7 w-full max-w-52 animate-pulse rounded-full bg-primary/15 dark:bg-primary/20" />
                                <div className="h-4 w-full max-w-44 animate-pulse rounded-full bg-accent/15 dark:bg-accent/20" />
                            </div>
                        </div>

                        <div className="h-8 w-28 animate-pulse rounded-full bg-amber-100/80 dark:bg-amber-900/40" />
                    </div>
                </div>
            </section>

            <section className="grid min-w-0 gap-4 sm:grid-cols-2">
                <article className="theme-card min-w-0 max-w-full rounded-2xl border border-accent/20 bg-card p-4 shadow-sm sm:p-5">
                    <div className="h-6 w-40 animate-pulse rounded-full bg-primary/15" />
                    <div className="mt-4 space-y-3">
                        <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                            <div className="h-3 w-20 animate-pulse rounded-full bg-text/10" />
                            <div className="mt-3 h-4 w-full max-w-32 animate-pulse rounded-full bg-text/15" />
                        </div>
                        <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                            <div className="h-3 w-16 animate-pulse rounded-full bg-text/10" />
                            <div className="mt-3 h-4 w-full max-w-40 animate-pulse rounded-full bg-text/15" />
                        </div>
                    </div>
                </article>

                <article className="theme-card min-w-0 max-w-full rounded-2xl border border-accent/20 bg-card p-4 shadow-sm sm:p-5">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-primary/15" />
                    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">
                        <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                            <div className="h-3 w-10 animate-pulse rounded-full bg-text/10" />
                            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-text/15" />
                        </div>
                        <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                            <div className="h-3 w-12 animate-pulse rounded-full bg-text/10" />
                            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-text/15" />
                        </div>
                        <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                            <div className="h-3 w-16 animate-pulse rounded-full bg-text/10" />
                            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-text/15" />
                        </div>
                    </div>
                </article>
            </section>

            <section className="theme-card min-w-0 max-w-full rounded-2xl border border-accent/20 bg-card p-4 shadow-sm sm:p-5">
                <div className="h-6 w-28 animate-pulse rounded-full bg-primary/15" />
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                        <div className="h-3 w-20 animate-pulse rounded-full bg-text/10" />
                        <div className="mt-3 h-4 w-full max-w-36 animate-pulse rounded-full bg-text/15" />
                    </div>
                    <div className="min-w-0 rounded-xl bg-bg/80 p-3">
                        <div className="h-3 w-20 animate-pulse rounded-full bg-text/10" />
                        <div className="mt-3 h-4 w-full max-w-36 animate-pulse rounded-full bg-text/15" />
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-text/10 sm:w-24" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-primary/20 sm:w-32" />
                </div>
            </section>
        </div>
    );
}
