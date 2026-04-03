import Link from "next/link";

const categories = [
    { label: "Cameras", value: "cameras" },
    { label: "Audio", value: "audio" },
    { label: "Gaming", value: "gaming" },
    { label: "Drones", value: "drones" },
    { label: "Camping", value: "camping" },
    { label: "Tools", value: "power-tools" },
    { label: "Sports", value: "sports" },
    { label: "Electronics", value: "electronics" },
];

export default function CategorySection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Browse Categories</h2>
                <Link href="/items" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <Link
                        key={category.value}
                        href={`/items?category=${encodeURIComponent(category.value)}`}
                        className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50"
                    >
                        <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300">
                            ■
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.label}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Find top listings</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}