export async function getWallet() {
    const response = await fetch("/api/wallet", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Unable to load wallet");
    }

    if (!data.success) {
        throw new Error(data.error || "Unable to load wallet");
    }

    return {
        wallet: data.wallet || {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarned: 0,
            lockedDeposits: 0,
            releasedDeposits: 0,
        },
    };
}
