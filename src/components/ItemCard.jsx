import Link from "next/link";
import Button from "./Button";

export default function ItemCard({ item }) {
    const itemId = item._id || item.id;
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

    return (
        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="relative h-44 bg-linear-to-br from-blue-600 via-blue-500 to-sky-400">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-xl bg-white/90 px-2 py-1 text-xs font-semibold text-gray-800">
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
                <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-2 py-1 text-xs font-semibold text-gray-800">
                    {itemType}
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{locationLabel}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-gray-400">Per day</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">${pricePerDay}</span>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-gray-400">Per hour</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">${pricePerHour}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-gray-400">Deposit</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">${depositAmount}</span>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-gray-400">Rating</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{rating} ({totalReviews})</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        ${pricePerDay}
                        <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
                    </p>
                    <Link href={`/items/${itemId}`}>
                        <Button className="px-3 py-2 text-xs">Book Now</Button>
                    </Link>
                </div>
            </div>
        </article>
    );
}
