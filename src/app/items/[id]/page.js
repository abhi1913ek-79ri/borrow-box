import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";

const thumbs = ["A", "B", "C", "D"];

export default function ItemDetailPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="space-y-4">
                        <div className="relative h-80 overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500 shadow-lg sm:h-105" />

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
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Sony A7 IV Camera Kit</h1>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    4.9 rating
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Park Street, Kolkata</p>
                            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                Premium mirrorless setup for creators and professionals. Includes 24-70 lens, tripod, and 2 batteries. Perfect for travel shoots, vlogging, and client work.
                            </p>
                        </div>
                    </section>

                    <div className="lg:pt-2">
                        <BookingWidget dailyPrice={82} />
                    </div>
                </div>
            </main>
        </div>
    );
}
