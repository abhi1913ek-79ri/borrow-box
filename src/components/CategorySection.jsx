const categories = [
    "Cameras",
    "Audio",
    "Gaming",
    "Drones",
    "Camping",
    "Tools",
    "Sports",
    "Fashion",
];

export default function CategorySection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Browse Categories</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50"
                    >
                        <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300">
                            ■
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Find top listings</p>
                    </button>
                ))}
            </div>
        </section>
    );
}