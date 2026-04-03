import CategorySection from "@/components/CategorySection";
import FeaturedItemsGrid from "@/components/FeaturedItemsGrid";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";

const featuredItems = [
  { id: "cam-1", title: "Sony A7 IV Camera", location: "Kolkata", price: 82, category: "Cameras" },
  { id: "game-2", title: "PS5 Console Bundle", location: "Bangalore", price: 37, category: "Gaming" },
  { id: "audio-3", title: "Studio Mic Kit", location: "Mumbai", price: 24, category: "Audio" },
  { id: "tool-4", title: "Makita Drill Set", location: "Delhi", price: 19, category: "Tools" },
  { id: "drone-5", title: "DJI Mini Drone", location: "Pune", price: 41, category: "Drones" },
  { id: "camp-6", title: "3-Person Tent Pro", location: "Goa", price: 28, category: "Camping" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection />
        <CategorySection />
        <FeaturedItemsGrid items={featuredItems} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Loading State</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Skeleton UI preview</p>
          </div>
          <Loader count={3} />
        </section>
      </main>
    </div>
  );
}
