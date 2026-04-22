import { categories, cityList } from "@/lib/mockItems";

export const itemCatalogConfig = {
    categories,
    cityList,
    priceRange: {
        min: 0,
        max: 500,
    },
    nearbyRadiusKm: 25,
};

function toRadians(value) {
    return (value * Math.PI) / 180;
}

export function getDistanceKm(origin, target) {
    if (!origin || !target) {
        return Number.POSITIVE_INFINITY;
    }

    const earthRadiusKm = 6371;
    const deltaLat = toRadians(target.lat - origin.lat);
    const deltaLng = toRadians(target.lng - origin.lng);
    const originLat = toRadians(origin.lat);
    const targetLat = toRadians(target.lat);

    const a = Math.sin(deltaLat / 2) ** 2
        + Math.cos(originLat) * Math.cos(targetLat) * Math.sin(deltaLng / 2) ** 2;
    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getMarketplaceItems() {
    const response = await fetch("/api/items", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load items");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to load items");
    }

    return data.items || [];
}

export async function getMyItems() {
    const response = await fetch("/api/items/my-items", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load your items");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to load your items");
    }

    return data.items || [];
}

export function filterMarketplaceItems(items, filters) {
    const {
        search = "",
        selectedCategory = "all",
        maxPrice = itemCatalogConfig.priceRange.max,
        city = "all",
        onlyAvailable = false,
        userLocation = null,
        nearbyRadiusKm = itemCatalogConfig.nearbyRadiusKm,
    } = filters;

    return items.filter((item) => {
        const matchesSearch = [item.title, item.description, item.category, item.location?.city, item.location?.address]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesPrice = item.pricePerDay <= maxPrice;
        const matchesCity = city === "all" || item.location?.city === city;
        const matchesAvailability = !onlyAvailable || item.availability?.isAvailable;
        const itemLocation = item.location?.coordinates;
        const matchesNearby = !userLocation || getDistanceKm(userLocation, itemLocation) <= nearbyRadiusKm;

        return matchesSearch && matchesCategory && matchesPrice && matchesCity && matchesAvailability && matchesNearby;
    });
}

export function buildCreateItemPayload(formValues) {
    // Backend-managed fields intentionally omitted from payload:
    // owner, rating, totalReviews, createdAt, updatedAt
    return {
        title: formValues.title?.trim() || "",
        description: formValues.description?.trim() || "",
        itemType: formValues.itemType?.trim() || "",
        category: formValues.category?.trim() || "",
        pricePerDay: Number(formValues.pricePerDay) || 0,
        pricePerHour: Number(formValues.pricePerHour) || 0,
        depositAmount: Number(formValues.depositAmount) || 0,
        images: formValues.images || [],
        availability: {
            isAvailable: Boolean(formValues.isAvailable),
        },
        location: {
            address: formValues.address?.trim() || "",
            city: formValues.city?.trim() || "",
            coordinates: {
                lat: Number(formValues.latitude) || 0,
                lng: Number(formValues.longitude) || 0,
            },
        },
    };
}

export async function createItemListing(formValues) {
    const payload = buildCreateItemPayload(formValues);

    try {
        const response = await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create item");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to create item");
        }

        return data.item;
    } catch (error) {
        console.error("Create item listing error:", error);
        throw error;
    }
}

export async function deleteItemListing(itemId) {
    if (!itemId) {
        throw new Error("Invalid item id");
    }

    const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
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
        throw new Error(data.error || "Failed to delete item");
    }

    if (!data.success) {
        throw new Error(data.error || "Failed to delete item");
    }

    return data;
}
