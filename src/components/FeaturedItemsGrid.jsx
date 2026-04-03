import ItemCard from "./ItemCard";

export default function FeaturedItemsGrid({ items }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Featured Items</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Explore all</button>
            </div>

            {items.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <ItemCard key={item._id || item.id || item.title} item={item} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No featured items yet. Add your first listing.</p>
                </div>
            )}
        </section>
    );
}