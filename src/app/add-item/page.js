import Link from "next/link";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";

export default function AddItemAccessPage() {
    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <section className="theme-card w-full max-w-xl rounded-2xl border border-accent/20 bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Add Listing</p>
                    <h1 className="mt-2 text-2xl font-semibold text-text">Please login to add a new item</h1>
                    <p className="mt-2 text-sm text-text/70">
                        You need an account to create listings. Login first, then you can publish your item from the dashboard form.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href="/login">
                            <Button>Go to Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="secondary">Create Account</Button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
