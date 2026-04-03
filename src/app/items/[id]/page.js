import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";

const thumbs = ["A", "B", "C", "D"];

const item = {
    _id: "itemId",
    title: "Bosch Drill Machine",
    description: "Heavy duty drill machine for home use",
    itemType: "tool",
    category: "power-tools",
    pricePerDay: 100,
    pricePerHour: 20,
    depositAmount: 500,
    location: {
        address: "Karawal Nagar",
        city: "Delhi",
        coordinates: {
            lat: 28.7041,
            lng: 77.1025,
        },
    },
    availability: {
        isAvailable: true,
    },
    owner: "userId",
    rating: 4.5,
    totalReviews: 10,
};

export default function ItemDetailPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500 shadow-lg">
                            <div className="grid min-h-80 gap-4 p-5 text-white sm:min-h-104 sm:p-6">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                                    <span className="rounded-full bg-white/15 px-3 py-1">{item.category}</span>
                                    <span className="rounded-full bg-white/15 px-3 py-1">{item.itemType}</span>
                                    <span className={`rounded-full px-3 py-1 ${item.availability.isAvailable ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
                                        {item.availability.isAvailable ? "Available" : "Not Available"}
                                    </span>
                                </div>

                                <div className="mt-auto max-w-2xl space-y-3">
                                    <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">{item.title}</h1>
                                    <p className="text-sm text-blue-100 sm:text-base">{item.description}</p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                                        <p className="text-xs text-blue-100">Deposit Amount</p>
                                        <p className="text-lg font-semibold">${item.depositAmount}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                                        <p className="text-xs text-blue-100">Price / Day</p>
                                        <p className="text-lg font-semibold">${item.pricePerDay}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                                        <p className="text-xs text-blue-100">Price / Hour</p>
                                        <p className="text-lg font-semibold">${item.pricePerHour}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {thumbs.map((thumb) => (
                                <button
                                    key={thumb}
                                    className="grid h-20 place-items-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                    {thumb}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{item.title}</h1>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.availability.isAvailable
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                            }`}>
                                            {item.availability.isAvailable ? "Available" : "Not Available"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.location.address}, {item.location.city}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right dark:bg-blue-900/20">
                                    <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">Deposit</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${item.depositAmount}</p>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.description}</p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Item Type</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.itemType}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.category}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Price / Day</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">${item.pricePerDay}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Price / Hour</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">${item.pricePerHour}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Rating</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.rating} / 5</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Reviews</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.totalReviews}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Owner</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.owner}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Coordinates</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                        {item.location.coordinates.lat}, {item.location.coordinates.lng}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Location Address</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.location.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">City</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.location.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Owner / Listing</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{item.owner}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="lg:pt-2">
                        <BookingWidget dailyPrice={item.pricePerDay} depositAmount={item.depositAmount} />
                    </div>
                </div>
            </main>
        </div>
    );
}
