import Link from "next/link";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <section className="theme-card w-full max-w-md rounded-2xl border border-accent/20 bg-card p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-text">Create your account</h1>
                    <p className="mt-1 text-sm text-text/70">Start renting and earning with Vyntra.</p>

                    <form className="mt-6 space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Full Name</span>
                            <input
                                type="text"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Your name"
                            />
                        </label>

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
                                placeholder="Create password"
                            />
                        </label>

                        <Button className="w-full">Create Account</Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-text/70">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary hover:text-accent">
                            Login
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}
