export async function getTransactions() {
	const response = await fetch("/api/transactions", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.error || "Unable to load transactions");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to load transactions");
	}

	return Array.isArray(data.transactions) ? data.transactions : [];
}
