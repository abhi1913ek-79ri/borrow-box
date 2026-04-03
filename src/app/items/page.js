"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";
import OpenStreetMapLocationPicker from "@/components/OpenStreetMapLocationPicker";
import { filterMarketplaceItems, getMarketplaceItems, itemCatalogConfig } from "@/services/itemService";

const categoryLabels = {
    all: "All",
    "power-tools": "Power Tools",
    cameras: "Cameras",
    gaming: "Gaming",
    audio: "Audio",
    drones: "Drones",
    camping: "Camping",
    sports: "Sports",
    electronics: "Electronics",
};

export default function ItemsPage() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || "all";
    const categories = itemCatalogConfig.categories;

    const [search, setSearch] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(
        categories.includes(initialCategory) ? initialCategory : "all"
    );
    const [maxPrice, setMaxPrice] = useState(itemCatalogConfig.priceRange.max);
    const [city, setCity] = useState("all");
    const [latitude, setLatitude] = useState(22.5726);
    const [longitude, setLongitude] = useState(78.9629);
    const [nearbyRadiusKm, setNearbyRadiusKm] = useState(itemCatalogConfig.nearbyRadiusKm);
    const [liveLocationStatus, setLiveLocationStatus] = useState("idle");
    const [locationPermissionMessage, setLocationPermissionMessage] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [items, setItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const [loadError, setLoadError] = useState("");

    const requestLiveLocation = () => {
        if (!navigator.geolocation) {
            setLiveLocationStatus("unsupported");
            setLocationPermissionMessage("Browser geolocation is not supported on this device.");
            return;
        }

        setLiveLocationStatus("requesting");
        setLocationPermissionMessage("Requesting your live location for nearby item results...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(Number(position.coords.latitude.toFixed(6)));
                setLongitude(Number(position.coords.longitude.toFixed(6)));
                setLiveLocationStatus("granted");
                setLocationPermissionMessage("Live location enabled. Nearby items are now filtered around your current position.");
            },
            (error) => {
                setLiveLocationStatus("denied");
                setLocationPermissionMessage(error.message || "Location permission was denied.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    useEffect(() => {
        const loadItems = async () => {
            try {
                setIsLoadingItems(true);
                setLoadError("");
                const results = await getMarketplaceItems();
                setItems(results);
            } catch {
                setLoadError("Unable to load items right now.");
            } finally {
                setIsLoadingItems(false);
            }
        };

        loadItems();
        requestLiveLocation();
    }, []);

    useEffect(() => {
        const nextSearch = searchParams.get("search") || "";
        const nextCategory = searchParams.get("category") || "all";

        setSearch(nextSearch);
        setSelectedCategory(categories.includes(nextCategory) ? nextCategory : "all");
    }, [searchParams]);

    const filteredItems = useMemo(() => {
        return filterMarketplaceItems(items, {
            search,
            selectedCategory,
            maxPrice,
            city,
            onlyAvailable,
            userLocation: { lat: latitude, lng: longitude },
            nearbyRadiusKm,
        });
    }, [city, items, latitude, longitude, maxPrice, nearbyRadiusKm, onlyAvailable, search, selectedCategory]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:h-[calc(100vh-92px)] lg:grid-cols-[320px_1fr] lg:overflow-hidden lg:px-8">
                <aside className="vyntra-scroll h-fit space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:h-full lg:overflow-y-auto lg:pr-2">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Marketplace Filters</p>
                            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">Search products</h1>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            Search bar, categories, price slider, and Google map picker are all UI-driven and update results instantly.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                        <p className="font-medium">Live location status</p>
                        <p className="mt-1 text-xs">
                            {locationPermissionMessage || "We request your live location when you open the browse page."}
                        </p>
                        <Button variant="secondary" className="mt-3 w-full" onClick={requestLiveLocation}>
                            {liveLocationStatus === "requesting" ? "Requesting..." : "Use my live location"}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Search</p>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                type="text"
                                placeholder="Search product, city, address..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            />
                            {(search || selectedCategory !== "all") && (
                                <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                                    Active from navigation: {search ? `search="${search}"` : ""} {selectedCategory !== "all" ? `category=${categoryLabels[selectedCategory]}` : ""}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((category) => {
                                    const isActive = selectedCategory === category;
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${isActive
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {categoryLabels[category] || category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Price Slider</p>
                            <input
                                type="range"
                                min={itemCatalogConfig.priceRange.min}
                                max={itemCatalogConfig.priceRange.max}
                                value={maxPrice}
                                onChange={(event) => setMaxPrice(Number(event.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>${itemCatalogConfig.priceRange.min}</span>
                                <span>Up to ${maxPrice}/day</span>
                                <span>${itemCatalogConfig.priceRange.max}</span>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">City Filter</p>
                            <select
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="all">All Cities</option>
                                {itemCatalogConfig.cityList.map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <OpenStreetMapLocationPicker
                                latitude={latitude}
                                longitude={longitude}
                                onChange={(nextLat, nextLng) => {
                                    setLatitude(nextLat);
                                    setLongitude(nextLng);
                                }}
                                onUseLiveLocation={requestLiveLocation}
                                liveLocationStatus={liveLocationStatus}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Live location is used as the nearby filter center. Click the map to move the location pin.
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nearby Radius</p>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={nearbyRadiusKm}
                                onChange={(event) => setNearbyRadiusKm(Number(event.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>5 km</span>
                                <span>Within {nearbyRadiusKm} km</span>
                                <span>100 km</span>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={onlyAvailable}
                                onChange={(event) => setOnlyAvailable(event.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Show only available items
                        </label>

                        <Link href="/dashboard">
                            <Button variant="secondary" className="w-full">
                                Open Dashboard Filters
                            </Button>
                        </Link>
                    </div>
                </aside>

                <section className="vyntra-scroll min-h-0 space-y-5 lg:h-full lg:overflow-y-auto lg:pr-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Search results</p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {isLoadingItems ? "Loading products..." : `${filteredItems.length} products matched`}
                            </h2>
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <p>Current search: {search || "All items"}</p>
                            <p>Latitude: {latitude.toFixed(2)} | Longitude: {longitude.toFixed(2)}</p>
                            <p>Nearby radius: {nearbyRadiusKm} km</p>
                        </div>
                    </div>

                    {loadError ? (
                        <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-12 text-center dark:border-red-800 dark:bg-red-900/20">
                            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Unable to load marketplace</h3>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{loadError}</p>
                        </div>
                    ) : isLoadingItems ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading products</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Fetching marketplace inventory...</p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredItems.map((item) => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No products matched your filters</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try a broader category, lower price, or different city.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
