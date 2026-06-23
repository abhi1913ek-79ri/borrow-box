function SkeletonLine({ className = "" }) {
    return <div className={`animate-pulse rounded-full bg-text/10 ${className}`} />;
}

function SkeletonField({ wide = false, tall = false }) {
    return (
        <div>
            <SkeletonLine className={`mb-2 h-3 ${wide ? "w-32" : "w-24"}`} />
            <div className={`animate-pulse rounded-xl border border-accent/10 bg-bg/80 ${tall ? "h-28" : "h-11"}`} />
        </div>
    );
}

function SkeletonPanel({ titleWidth = "w-36", children }) {
    return (
        <div className="space-y-4 rounded-2xl border border-accent/15 bg-bg/50 p-4">
            <SkeletonLine className={`h-3 ${titleWidth}`} />
            {children}
        </div>
    );
}

export default function AddItemSkeleton({ showShell = true }) {
    const content = (
        <section className="space-y-6" aria-label="Loading add listing page">
            <div className="theme-card rounded-3xl border border-accent/20 bg-card p-6 shadow-sm">
                <SkeletonLine className="h-3 w-28 bg-primary/15" />
                <SkeletonLine className="mt-4 h-8 w-72 max-w-full bg-text/15" />
                <SkeletonLine className="mt-3 h-4 w-full max-w-3xl" />
                <SkeletonLine className="mt-2 h-4 w-2/3 max-w-2xl" />
            </div>

            <section className="theme-card overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-xl shadow-black/10">
                <div className="border-b border-accent/15 bg-linear-to-r from-primary/10 via-card to-accent/10 px-6 py-5 sm:px-8">
                    <SkeletonLine className="h-3 w-28 bg-primary/15" />
                    <SkeletonLine className="mt-4 h-7 w-full max-w-lg bg-text/15" />
                    <SkeletonLine className="mt-3 h-4 w-full max-w-2xl" />
                    <SkeletonLine className="mt-2 h-4 w-3/4 max-w-xl" />
                </div>

                <div className="grid gap-6 px-6 py-6 sm:px-8">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <SkeletonPanel titleWidth="w-28">
                            <SkeletonField />
                            <SkeletonField wide tall />
                            <SkeletonField />
                            <SkeletonField />
                        </SkeletonPanel>

                        <SkeletonPanel titleWidth="w-36">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <SkeletonField wide />
                                <SkeletonField wide />
                                <SkeletonField wide />
                            </div>

                            <div className="rounded-xl border-2 border-dashed border-accent/25 bg-bg/60 px-4 py-8">
                                <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-primary/15" />
                                <SkeletonLine className="mx-auto mt-4 h-4 w-44" />
                                <SkeletonLine className="mx-auto mt-2 h-3 w-32" />
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-accent/15 bg-bg/60 px-3 py-2">
                                <div className="h-4 w-4 animate-pulse rounded bg-primary/20" />
                                <SkeletonLine className="h-4 w-40" />
                            </div>
                        </SkeletonPanel>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                        <SkeletonPanel titleWidth="w-24">
                            <SkeletonField wide />
                            <SkeletonField />
                            <div className="grid grid-cols-2 gap-3">
                                <SkeletonField />
                                <SkeletonField />
                            </div>
                        </SkeletonPanel>

                        <SkeletonPanel titleWidth="w-28">
                            <div className="h-72 animate-pulse rounded-xl border border-accent/15 bg-linear-to-br from-primary/10 via-bg to-accent/10" />
                            <SkeletonLine className="h-3 w-full max-w-md" />
                        </SkeletonPanel>
                    </div>

                    <div className="rounded-2xl border border-accent/20 bg-bg/70 p-4">
                        <SkeletonLine className="h-4 w-40 bg-text/15" />
                        <SkeletonLine className="mt-3 h-4 w-full max-w-sm" />
                    </div>

                    <div className="flex justify-end">
                        <div className="h-11 w-32 animate-pulse rounded-2xl bg-primary/20" />
                    </div>
                </div>
            </section>
        </section>
    );

    if (!showShell) {
        return content;
    }

    return (
        <div className="min-h-screen bg-bg text-text">
            <div className="border-b border-accent/10 bg-card/90">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/20" />
                    <SkeletonLine className="h-5 w-24 bg-text/15" />
                    <div className="ml-auto hidden h-10 w-full max-w-xl animate-pulse rounded-2xl bg-bg/80 md:block" />
                    <div className="ml-auto flex gap-2 md:ml-0">
                        <div className="h-10 w-10 animate-pulse rounded-2xl bg-bg/80" />
                        <div className="h-10 w-10 animate-pulse rounded-2xl bg-bg/80" />
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {content}
            </main>
        </div>
    );
}
