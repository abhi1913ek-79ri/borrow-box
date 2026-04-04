export default function Loader({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="theme-card overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm"
                >
                    <div className="h-44 animate-pulse bg-linear-to-br from-primary/25 via-accent/20 to-primary/10" />
                    <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-primary/20" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-accent/20" />
                        <div className="h-9 w-full animate-pulse rounded-xl bg-primary/15" />
                    </div>
                </div>
            ))}
        </div>
    );
}
