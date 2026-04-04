import Link from "next/link";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <section className="theme-card w-full max-w-md rounded-2xl border border-accent/20 bg-card p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-text">Welcome back</h1>
                    <p className="mt-1 text-sm text-text/70">Log in to manage listings and bookings.</p>

                    <form className="mt-6 space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Email</span>
                            <input
                                type="email"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="you@example.com"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Password</span>
                            <input
                                type="password"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Enter password"
                            />
                        </label>

                        <Button className="w-full">Login</Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-text/70">
                        New to Vyntra?{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-accent">
                            Create account
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}
