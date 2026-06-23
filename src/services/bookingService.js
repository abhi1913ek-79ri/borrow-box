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

async function patchBookingAction(bookingId, action, fallbackError) {
	if (!bookingId) {
		throw new Error("Invalid booking id");
	}

	const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
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
		throw new Error(data.error || fallbackError);
	}

	if (!data.success) {
		throw new Error(data.error || fallbackError);
	}

	return data.booking;
}

export function acceptBooking(bookingId) {
	return patchBookingAction(bookingId, "accept", "Unable to accept booking");
}

export function rejectBooking(bookingId) {
	return patchBookingAction(bookingId, "reject", "Unable to reject booking");
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
	return patchBookingAction(bookingId, "dispatch", "Unable to start delivery");
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
	return patchBookingAction(bookingId, "confirm-return", "Unable to confirm return");
}

export function performOwnerBookingAction(bookingId, action) {
	const handlers = {
		accept: acceptBooking,
		reject: rejectBooking,
		dispatch: dispatchBooking,
		confirmReturn: confirmBookingReturn,
	};

	const handler = handlers[action];

	if (!handler) {
		throw new Error("Invalid booking action");
	}

	return handler(bookingId);
}
