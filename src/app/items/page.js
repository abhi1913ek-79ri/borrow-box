import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const items = [
    { id: "cam-1", title: "Sony A7 IV Camera", location: "Kolkata", price: 82, category: "Cameras" },
    { id: "game-2", title: "PS5 Console Bundle", location: "Bangalore", price: 37, category: "Gaming" },
    { id: "audio-3", title: "Studio Mic Kit", location: "Mumbai", price: 24, category: "Audio" },
    { id: "tool-4", title: "Makita Drill Set", location: "Delhi", price: 19, category: "Tools" },
    { id: "drone-5", title: "DJI Mini Drone", location: "Pune", price: 41, category: "Drones" },
    { id: "camp-6", title: "3-Person Tent Pro", location: "Goa", price: 28, category: "Camping" },
];

export default function ItemsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[auto_1fr] lg:px-8">
                <Sidebar active="Browse Items" />

                <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Browse Items</h1>
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            324 items available
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
