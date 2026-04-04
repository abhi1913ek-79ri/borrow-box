import Button from "./Button";

export default function BookingWidget({ dailyPrice = 64, depositAmount = 500 }) {
    const days = 4;
    const totalPrice = dailyPrice * days;
    const payableNow = totalPrice + depositAmount;

    return (
        <aside className="theme-card rounded-2xl border border-accent/20 bg-card p-5 shadow-sm">
            <p className="text-xl font-semibold text-text">
                ${dailyPrice}
                <span className="ml-1 text-sm font-normal text-text/70">per day</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-text/70">From</span>
                    <input
                        type="date"
                        defaultValue="2026-04-05"
                        className="h-10 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text"
                    />
                </label>
                <label>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-text/70">To</span>
                    <input
                        type="date"
                        defaultValue="2026-04-07"
                        className="h-10 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text"
                    />
                </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">bookingStatus: confirmed</div>
                <div className="rounded-lg bg-bg/80 px-2 py-1 text-text/70">paymentStatus: pending</div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-accent/25 p-2 text-xs text-text/70">
                paymentId: razorpay_id_optional
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-text/70">
                    <span>
                        ${dailyPrice} x {days} days
                    </span>
                    <span>${totalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-text/70">
                    <span>Deposit Amount</span>
                    <span>${depositAmount}</span>
                </div>
                <div className="h-px bg-accent/20" />
                <div className="flex items-center justify-between font-semibold text-text">
                    <span>Payable Now</span>
                    <span>${payableNow}</span>
                </div>
            </div>

            <Button className="mt-5 w-full">Confirm Booking</Button>
        </aside>
    );
}