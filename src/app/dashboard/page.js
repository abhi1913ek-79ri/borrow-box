import AddItemForm from "@/components/AddItemForm";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const stats = [
    { label: "Active Listings", value: "14" },
    { label: "Pending Bookings", value: "06" },
    { label: "This Month Earned", value: "$1,240" },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn mobileSidebarActive="Home" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Home" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 sm:grid-cols-3">
                        {stats.map((stat) => (
                            <article
                                key={stat.label}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                            </article>
                        ))}
                    </section>

                    <AddItemForm />

                    <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No recent activity</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Once you receive bookings, updates will show here.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
