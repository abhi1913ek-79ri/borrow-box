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
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-accent shadow-lg">
                            <div className="grid min-h-80 gap-4 p-5 text-bg sm:min-h-104 sm:p-6">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-bg/85">
                                    <span className="rounded-full bg-bg/15 px-3 py-1">{item.category}</span>
                                    <span className="rounded-full bg-bg/15 px-3 py-1">{item.itemType}</span>
                                    <span className={`rounded-full px-3 py-1 ${item.availability.isAvailable ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
                                        {item.availability.isAvailable ? "Available" : "Not Available"}
                                    </span>
                                </div>

                                <div className="mt-auto max-w-2xl space-y-3">
                                    <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">{item.title}</h1>
                                    <p className="text-sm text-bg/85 sm:text-base">{item.description}</p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Deposit Amount</p>
                                        <p className="text-lg font-semibold">${item.depositAmount}</p>
                                    </div>
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Price / Day</p>
                                        <p className="text-lg font-semibold">${item.pricePerDay}</p>
                                    </div>
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Price / Hour</p>
                                        <p className="text-lg font-semibold">${item.pricePerHour}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {thumbs.map((thumb) => (
                                <button
                                    key={thumb}
                                    className="grid h-20 place-items-center rounded-xl border border-accent/20 bg-card text-sm font-semibold text-text/70 hover:border-primary/35"
                                >
                                    {thumb}
                                </button>
                            ))}
                        </div>

                        <div className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-semibold text-text">{item.title}</h1>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.availability.isAvailable
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                            }`}>
                                            {item.availability.isAvailable ? "Available" : "Not Available"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text/70">
                                        {item.location.address}, {item.location.city}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-wide text-primary">Deposit</p>
                                    <p className="text-2xl font-semibold text-text">${item.depositAmount}</p>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-text/75">{item.description}</p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Item Type</p>
                                    <p className="mt-1 font-semibold text-text">{item.itemType}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Category</p>
                                    <p className="mt-1 font-semibold text-text">{item.category}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Price / Day</p>
                                    <p className="mt-1 font-semibold text-text">${item.pricePerDay}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Price / Hour</p>
                                    <p className="mt-1 font-semibold text-text">${item.pricePerHour}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Rating</p>
                                    <p className="mt-1 font-semibold text-text">{item.rating} / 5</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Reviews</p>
                                    <p className="mt-1 font-semibold text-text">{item.totalReviews}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Owner</p>
                                    <p className="mt-1 font-semibold text-text">{item.owner}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Coordinates</p>
                                    <p className="mt-1 font-semibold text-text">
                                        {item.location.coordinates.lat}, {item.location.coordinates.lng}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 rounded-2xl border border-accent/20 bg-bg/80 p-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">Location Address</p>
                                    <p className="mt-1 font-semibold text-text">{item.location.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">City</p>
                                    <p className="mt-1 font-semibold text-text">{item.location.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">Owner / Listing</p>
                                    <p className="mt-1 font-semibold text-text">{item.owner}</p>
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
