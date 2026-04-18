import { Suspense } from "react";
import CategorySection from "@/components/CategorySection";
import FeaturedItemsGrid from "@/components/FeaturedItemsGrid";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

async function FeaturedItemsSection() {
  await connectDB();

  const featuredItems = await Item.find().sort({ createdAt: -1 }).limit(6).lean();

  return <FeaturedItemsGrid items={featuredItems} />;
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
