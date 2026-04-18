export async function createBooking({ itemId, startDate, endDate }) {
	const response = await fetch("/api/bookings", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ itemId, startDate, endDate }),
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to create booking");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to create booking");
	}

	return data.booking;
}
