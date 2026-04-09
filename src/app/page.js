import CategorySection from "@/components/CategorySection";
import FeaturedItemsGrid from "@/components/FeaturedItemsGrid";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";

const featuredItems = [
  { _id: "cam-1", title: "Sony A7 IV Camera", itemType: "camera", category: "cameras", pricePerDay: 82, pricePerHour: 22, depositAmount: 500, location: { address: "Park Street", city: "Kolkata" }, availability: { isAvailable: true }, rating: 4.9, totalReviews: 42 },
  { _id: "game-2", title: "PS5 Console Bundle", itemType: "gaming", category: "gaming", pricePerDay: 37, pricePerHour: 10, depositAmount: 300, location: { address: "Indiranagar", city: "Bangalore" }, availability: { isAvailable: true }, rating: 4.8, totalReviews: 31 },
  { _id: "audio-3", title: "Studio Mic Kit", itemType: "audio", category: "audio", pricePerDay: 24, pricePerHour: 7, depositAmount: 200, location: { address: "Andheri", city: "Mumbai" }, availability: { isAvailable: false }, rating: 4.7, totalReviews: 18 },
  { _id: "tool-4", title: "Makita Drill Set", itemType: "tool", category: "power-tools", pricePerDay: 19, pricePerHour: 5, depositAmount: 500, location: { address: "Karawal Nagar", city: "Delhi" }, availability: { isAvailable: true }, rating: 4.6, totalReviews: 10 },
  { _id: "drone-5", title: "DJI Mini Drone", itemType: "drone", category: "drones", pricePerDay: 41, pricePerHour: 12, depositAmount: 750, location: { address: "Baner", city: "Pune" }, availability: { isAvailable: true }, rating: 4.9, totalReviews: 22 },
  { _id: "camp-6", title: "3-Person Tent Pro", itemType: "camping", category: "camping", pricePerDay: 28, pricePerHour: 8, depositAmount: 250, location: { address: "Calangute", city: "Goa" }, availability: { isAvailable: true }, rating: 4.5, totalReviews: 14 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection />
        <CategorySection />
        <FeaturedItemsGrid items={featuredItems} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text">Loading State</h2>
            <p className="text-sm text-text/70">Skeleton UI preview</p>
          </div>
          <Loader count={3} />
        </section>
      </main>
    </div>
  );
}
