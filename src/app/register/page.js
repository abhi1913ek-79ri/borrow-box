import Link from "next/link";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create your account</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start renting and earning with Vyntra.</p>

                    <form className="mt-6 space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
                            <input
                                type="text"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                placeholder="Your name"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                            <input
                                type="email"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                placeholder="you@example.com"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
                            <input
                                type="password"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                placeholder="Create password"
                            />
                        </label>

                        <Button className="w-full">Create Account</Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                            Login
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}
