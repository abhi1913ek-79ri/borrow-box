import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

const ACTIVE_BOOKING_STATUSES = ["paid", "owner_accepted", "in_transit", "delivered", "return_initiated"];

export default async function ItemDetailPage({ params }) {
    await connectDB();

    const session = await getServerSession(authOptions);

    const { id } = await params;
    const item = await Item.findById(id).populate("owner", "name").lean();

    if (!item) {
        notFound();
    }

    const currentBooking = session?.user?.id
        ? await Booking.findOne({
            item: item._id,
            renter: session.user.id,
            bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
        }).lean()
        : null;

    const isOwnedByCurrentUser = session?.user?.id ? String(item.owner) === String(session.user.id) : false;
    const canBook = !isOwnedByCurrentUser && (item.availability?.isAvailable !== false || Boolean(currentBooking));

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
                        {/* ------------ */}
                        <div className="relative overflow-hidden rounded-3xl shadow-xl">
                            {/* Background Image */}
                            {heroImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={heroImage}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover brightness-[0.9]"
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

                            {/* Content */}
                            <div className="relative flex min-h-[450px] flex-col justify-between p-6 text-white sm:min-h-[500px] sm:p-8">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-3">
                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                        {item.category}
                                    </span>

                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                        {item.itemType}
                                    </span>

                                    <span
                                        className={`rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md ${item.availability?.isAvailable
                                                ? "border border-emerald-300/30 bg-emerald-500/20 text-emerald-100"
                                                : "border border-red-300/30 bg-red-500/20 text-red-100"
                                            }`}
                                    >
                                        ●{" "}
                                        {item.availability?.isAvailable
                                            ? "Available"
                                            : "Not Available"}
                                    </span>
                                </div>

                                {/* Main Content */}
                                <div className="max-w-xl space-y-4">
                                    <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
                                        {item.title}
                                    </h1>

                                    <p className="text-base text-white/85 sm:text-lg">
                                        {item.description}
                                    </p>

                                    {/* Main Price */}
                                    <div className="flex items-end gap-3 pt-2">
                                        <span className="text-5xl font-bold">
                                            ₹{item.pricePerDay || 0}
                                        </span>

                                        <span className="pb-2 text-xl text-white/80">
                                            per day
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Cards */}
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl">
                                        <p className="text-xs uppercase tracking-wider text-white/70">
                                            Deposit
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            ₹{item.depositAmount || 0}
                                        </p>
                                    </div>

                                    {item.pricePerHour > 0 && (
                                        <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl">
                                            <p className="text-xs uppercase tracking-wider text-white/70">
                                                Price / Hour
                                            </p>

                                            <p className="mt-1 text-2xl font-bold">
                                                ₹{item.pricePerHour}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ------------------------------------------ */}
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
                                    <p className="text-2xl font-semibold text-text">Rs. {item.depositAmount || 0}</p>
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
                                    <p className="mt-1 font-semibold text-text">Rs. {item.pricePerDay || 0}</p>
                                </div>
                                <div className="rounded-xl bg-bg/80 p-3">
                                    <p className="text-xs uppercase tracking-wide text-text/70">Price / Hour</p>
                                    <p className="mt-1 font-semibold text-text">Rs. {item.pricePerHour || 0}</p>
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
                            currentBooking={
                                currentBooking
                                    ? {
                                        _id: String(currentBooking._id),
                                        bookingStatus: currentBooking.bookingStatus,
                                        paymentStatus: currentBooking.paymentStatus,
                                        startDate:
                                            currentBooking.startDate?.toISOString?.() ?? null,
                                        endDate:
                                            currentBooking.endDate?.toISOString?.() ?? null,
                                    }
                                    : null
                            }
                            isItemOutOfStock={!canBook && !currentBooking}
                            isOwnedByCurrentUser={isOwnedByCurrentUser}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
