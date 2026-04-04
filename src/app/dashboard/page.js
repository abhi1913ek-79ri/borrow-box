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
        <div className="min-h-screen bg-bg text-text">
            <Navbar isLoggedIn mobileSidebarActive="Home" />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[auto_1fr] md:overflow-hidden lg:px-8">
                <Sidebar active="Home" />

                <div className="vyntra-scroll min-h-0 space-y-6 md:h-full md:overflow-y-auto md:pr-2">
                    <section className="grid gap-4 sm:grid-cols-3">
                        {stats.map((stat) => (
                            <article
                                key={stat.label}
                                className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm"
                            >
                                <p className="text-sm text-text/70">{stat.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-text">{stat.value}</p>
                            </article>
                        ))}
                    </section>

                    <AddItemForm />

                    <section className="theme-card rounded-2xl border border-dashed border-accent/25 bg-card p-10 text-center">
                        <h3 className="text-lg font-semibold text-text">No recent activity</h3>
                        <p className="mt-2 text-sm text-text/70">
                            Once you receive bookings, updates will show here.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
