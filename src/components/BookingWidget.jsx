import Button from "./Button";

export default function BookingWidget({ dailyPrice = 64 }) {
    const days = 4;
    const serviceFee = 12;
    const subtotal = dailyPrice * days;
    const total = subtotal + serviceFee;

    return (
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                ${dailyPrice}
                <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">per day</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">From</span>
                    <input
                        type="text"
                        value="08 Apr 2026"
                        readOnly
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">To</span>
                    <input
                        type="text"
                        value="12 Apr 2026"
                        readOnly
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>
                        ${dailyPrice} x {days} days
                    </span>
                    <span>${subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Service fee</span>
                    <span>${serviceFee}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>${total}</span>
                </div>
            </div>

            <Button className="mt-5 w-full">Confirm Booking</Button>
        </aside>
    );
}