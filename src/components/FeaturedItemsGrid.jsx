import ItemCard from "./ItemCard";

export default function FeaturedItemsGrid({ items, bookedItemIds = [], currentUserId = "" }) {
    const bookedItemIdSet = new Set(bookedItemIds.map((id) => String(id)));
    const normalizedCurrentUserId = String(currentUserId || "");

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text">Featured Items</h2>
                <button className="text-sm font-medium text-primary hover:text-accent">Explore all</button>
            </div>

            {items.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <ItemCard
                            key={item._id || item.id || item.title}
                            item={item}
                            isBookedByCurrentUser={bookedItemIdSet.has(String(item._id || item.id || ""))}
                            isOwnedByCurrentUser={normalizedCurrentUserId && String(item.owner || "") === normalizedCurrentUserId}
                        />
                    ))}
                </div>
            ) : (
                <div className="theme-card rounded-2xl border border-dashed border-accent/25 bg-card/90 p-10 text-center text-text">
                    <p className="text-sm text-text/70">No featured items yet. Add your first listing.</p>
                </div>
            )}
        </section>
    );
}