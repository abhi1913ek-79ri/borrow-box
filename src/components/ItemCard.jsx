import Link from "next/link";
import Button from "./Button";

export default function ItemCard({ item }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="relative h-44 bg-linear-to-br from-blue-600 via-blue-500 to-sky-400">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-2 py-1 text-xs font-semibold text-gray-800">
                    {item.category}
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.location}</p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        ${item.price}
                        <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
                    </p>
                    <Link href={`/items/${item.id}`}>
                        <Button className="px-3 py-2 text-xs">Book Now</Button>
                    </Link>
                </div>
            </div>
        </article>
    );
}
