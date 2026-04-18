import Link from "next/link";
import Button from "./Button";

export default function ItemCard({ item }) {
    const itemId = item._id ? String(item._id) : item.id;
    const pricePerDay = item.pricePerDay ?? item.price ?? 0;
    const pricePerHour = item.pricePerHour ?? Math.max(1, Math.round(pricePerDay / 4));
    const depositAmount = item.depositAmount ?? 500;
    const itemType = item.itemType ?? "rental";
    const category = item.category ?? "general";
    const isAvailable = item.availability?.isAvailable ?? true;
    const rating = item.rating ?? 4.8;
    const totalReviews = item.totalReviews ?? 0;
    const locationLabel = item.location?.city
        ? `${item.location.address || ""}${item.location.address ? ", " : ""}${item.location.city}`
        : item.location || "Location not specified";
    const imageUrl = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";

    return (
        <article className="theme-card group overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-md shadow-black/5 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-44 overflow-hidden bg-linear-to-br from-primary via-primary/85 to-accent/85">
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-xl bg-bg/90 px-2 py-1 text-xs font-semibold text-text">
                        {category}
                    </span>
                    <span
                        className={`rounded-xl px-2 py-1 text-xs font-semibold ${isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                            }`}
                    >
                        {isAvailable ? "Available" : "Booked"}
                    </span>
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-bg/90 px-2 py-1 text-xs font-semibold text-text">
                    {itemType}
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-text">{item.title}</h3>
                    <p className="mt-1 text-sm text-text/70">{locationLabel}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-text/70">
                    <div className="rounded-xl bg-bg/70 px-3 py-2">
                        <span className="block text-text/55">Per day</span>
                        <span className="font-semibold text-text">${pricePerDay}</span>
                    </div>
                    <div className="rounded-xl bg-bg/70 px-3 py-2">
                        <span className="block text-text/55">Per hour</span>
                        <span className="font-semibold text-text">${pricePerHour}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-text/70">
                    <div className="rounded-xl bg-bg/70 px-3 py-2">
                        <span className="block text-text/55">Deposit</span>
                        <span className="font-semibold text-text">${depositAmount}</span>
                    </div>
                    <div className="rounded-xl bg-bg/70 px-3 py-2">
                        <span className="block text-text/55">Rating</span>
                        <span className="font-semibold text-text">{rating} ({totalReviews})</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-text">
                        ${pricePerDay}
                        <span className="ml-1 text-sm font-normal text-text/70">/day</span>
                    </p>
                    <Link href={`/items/${itemId}`}>
                        <Button className="px-3 py-2 text-xs cursor-pointer">Book Now</Button>
                    </Link>
                </div>
            </div>
        </article>
    );
}
