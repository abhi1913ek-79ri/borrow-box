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

async function fetchBookingList(url) {
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to load bookings");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to load bookings");
	}

	return Array.isArray(data.bookings) ? data.bookings : [];
}

export function getMyBookings() {
	return fetchBookingList("/api/bookings/my-bookings");
}

export function getMyItemsBookings() {
	return fetchBookingList("/api/bookings/my-items-bookings");
}

export async function cancelBooking(bookingId) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to cancel booking");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to cancel booking");
	}

	return data;
}

export async function dispatchBooking(bookingId) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}/dispatch`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to start delivery");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to start delivery");
	}

	return data.booking;
}

export async function confirmBookingDelivery(bookingId) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}/confirm-delivery`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to confirm delivery");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to confirm delivery");
	}

	return data.booking;
}

export async function startBookingReturn(bookingId) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}/start-return`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to start return");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to start return");
	}

	return data.booking;
}

export async function confirmBookingReturn(bookingId) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}/confirm-return`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data = {};

	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || "Unable to confirm return");
	}

	if (!data.success) {
		throw new Error(data.error || "Unable to confirm return");
	}

	return data.booking;
}
