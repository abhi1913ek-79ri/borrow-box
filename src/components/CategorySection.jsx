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
                <h2 className="text-2xl font-semibold text-text">Browse Categories</h2>
                <Link href="/items" className="text-sm font-medium text-primary hover:text-accent">View all</Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <Link
                        key={category.value}
                        href={`/items?category=${encodeURIComponent(category.value)}`}
                        className="theme-card group rounded-2xl border border-accent/20 bg-card/90 p-4 text-left text-text shadow-sm hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg"
                    >
                        <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary group-hover:text-bg">
                            ■
                        </div>
                        <p className="text-sm font-semibold text-text">{category.label}</p>
                        <p className="mt-1 text-xs text-text/70">Find top listings</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}