import { Suspense } from "react";
import CategorySection from "@/components/CategorySection";
import FeaturedItemsGrid from "@/components/FeaturedItemsGrid";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Booking from "@/models/Booking";
import Item from "@/models/Item";

async function FeaturedItemsSection() {
  await connectDB();

  const session = await getServerSession(authOptions);
  const [featuredItems, bookedItems] = await Promise.all([
    Item.find().sort({ createdAt: -1 }).limit(6).lean(),
    session?.user?.id
      ? Booking.find({
          renter: session.user.id,
          bookingStatus: { $in: ["pending", "confirmed", "completed"] },
        })
          .select("item")
          .lean()
      : Promise.resolve([]),
  ]);

  const bookedItemIds = bookedItems.map((booking) => String(booking.item)).filter(Boolean);

  return <FeaturedItemsGrid items={featuredItems} bookedItemIds={bookedItemIds} currentUserId={session?.user?.id || ""} />;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection />
        <CategorySection />

        <Suspense
          fallback={
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text">Featured Items</h2>
                <p className="text-sm text-text/70">Loading listings</p>
              </div>
              <Loader count={6} />
            </section>
          }
        >
          <FeaturedItemsSection />
        </Suspense>
      </main>
    </div>
  );
}
