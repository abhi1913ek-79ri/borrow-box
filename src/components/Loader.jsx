export default function Loader({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="h-44 animate-pulse bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
            ))}
        </div>
    );
}
