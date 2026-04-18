import { notFound } from "next/navigation";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export default async function ItemDetailPage({ params }) {
    await connectDB();

    const { id } = await params;
    const item = await Item.findById(id).populate("owner", "name").lean();

    if (!item) {
        notFound();
    }

    const ownerName = typeof item.owner === "object" && item.owner?.name
        ? item.owner.name
        : String(item.owner || "-");

    const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    const heroImage = images[0] || "";
    const galleryImages = images.slice(1, 5);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-accent shadow-lg">
                            <div className="relative grid min-h-80 gap-4 p-5 text-bg sm:min-h-104 sm:p-6">
                                {heroImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={heroImage}
                                        alt={item.title}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : null}
                                <div className="absolute inset-0 " />

                                <div className="relative flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-bg/85">
                                    <span className="rounded-full bg-bg/15 px-3 py-1">{item.category}</span>
                                    <span className="rounded-full bg-bg/15 px-3 py-1">{item.itemType}</span>
                                    <span className={`rounded-full px-3 py-1 ${item.availability?.isAvailable ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
                                        {item.availability?.isAvailable ? "Available" : "Not Available"}
                                    </span>
                                </div>

                                <div className="relative mt-auto max-w-2xl space-y-3">
                                    <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">{item.title}</h1>
                                    <p className="text-sm text-bg/85 sm:text-base">{item.description}</p>
                                </div>

                                <div className="relative grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Deposit Amount</p>
                                        <p className="text-lg font-semibold">${item.depositAmount || 0}</p>
                                    </div>
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Price / Day</p>
                                        <p className="text-lg font-semibold">${item.pricePerDay || 0}</p>
                                    </div>
                                    <div className="rounded-2xl bg-bg/15 p-3 backdrop-blur">
                                        <p className="text-xs text-bg/85">Price / Hour</p>
                                        <p className="text-lg font-semibold">${item.pricePerHour || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {(galleryImages.length ? galleryImages : images.length ? [heroImage] : ["", "", "", ""]).map((thumb, index) => (
                                <div
                                    key={`${thumb || "thumb"}-${index}`}
                                    className="grid h-20 place-items-center overflow-hidden rounded-xl border border-accent/20 bg-card text-sm font-semibold text-text/70 hover:border-primary/35"
                                >
                                    {thumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumb} alt={`${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{String.fromCharCode(65 + index)}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-semibold text-text">{item.title}</h1>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.availability?.isAvailable
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                            }`}>
                                            {item.availability?.isAvailable ? "Available" : "Not Available"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text/70">
                                        {item.location?.address}, {item.location?.city}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-wide text-primary">Deposit</p>
                                    <p className="text-2xl font-semibold text-text">${item.depositAmount || 0}</p>
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
                                    <p className="mt-1 font-semibold text-text">${item.pricePerDay || 0}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Price / Hour</p>
                                    <p className="mt-1 font-semibold text-text">${item.pricePerHour || 0}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Rating</p>
                                    <p className="mt-1 font-semibold text-text">{item.rating || 0} / 5</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Reviews</p>
                                    <p className="mt-1 font-semibold text-text">{item.totalReviews || 0}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Owner</p>
                                    <p className="mt-1 font-semibold text-text">{ownerName}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Coordinates</p>
                                    <p className="mt-1 font-semibold text-text">
                                        {item.location?.coordinates?.lat}, {item.location?.coordinates?.lng}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 rounded-2xl border border-accent/20 bg-bg/80 p-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">Location Address</p>
                                    <p className="mt-1 font-semibold text-text">{item.location?.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">City</p>
                                    <p className="mt-1 font-semibold text-text">{item.location?.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-text/70">Owner / Listing</p>
                                    <p className="mt-1 font-semibold text-text">{ownerName}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="lg:pt-2">
                        <BookingWidget
                            itemId={String(item._id)}
                            dailyPrice={item.pricePerDay || 0}
                            depositAmount={item.depositAmount || 0}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
