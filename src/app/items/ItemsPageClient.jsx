"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";
import { filterMarketplaceItems, getMarketplaceItems, itemCatalogConfig } from "@/services/itemService";

const OpenStreetMapLocationPicker = dynamic(() => import("@/components/OpenStreetMapLocationPicker"), {
    ssr: false,
});

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

export default function ItemsPageClient() {
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
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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
    }, [categories, searchParams]);

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

    const filtersContent = ({ showSearch = true } = {}) => (
        <div className="space-y-4">
            {showSearch && (
                <div>
                    <p className="mb-2 text-sm font-medium text-text">Search</p>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        type="text"
                        placeholder="Search product, city, address..."
                        className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {(search || selectedCategory !== "all") && (
                        <p className="mt-2 text-xs text-primary">
                            Active from navigation: {search ? `search="${search}"` : ""} {selectedCategory !== "all" ? `category=${categoryLabels[selectedCategory]}` : ""}
                        </p>
                    )}
                </div>
            )}

            <div>
                <p className="mb-2 text-sm font-medium text-text">Category</p>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${isActive
                                    ? "bg-primary text-bg"
                                    : "bg-bg/80 text-text hover:bg-accent/10"
                                    }`}
                            >
                                {categoryLabels[category] || category}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-text">Price Slider</p>
                <input
                    type="range"
                    min={itemCatalogConfig.priceRange.min}
                    max={itemCatalogConfig.priceRange.max}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-primary"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-text/70">
                    <span>${itemCatalogConfig.priceRange.min}</span>
                    <span>Up to ${maxPrice}/day</span>
                    <span>${itemCatalogConfig.priceRange.max}</span>
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-text">City Filter</p>
                <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                <p className="mt-2 text-xs text-text/70">
                    Live location is used as the nearby filter center. Click the map to move the location pin.
                </p>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-text">Nearby Radius</p>
                <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={nearbyRadiusKm}
                    onChange={(event) => setNearbyRadiusKm(Number(event.target.value))}
                    className="w-full accent-primary"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-text/70">
                    <span>5 km</span>
                    <span>Within {nearbyRadiusKm} km</span>
                    <span>100 km</span>
                </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-bg/80 px-3 py-2 text-sm text-text">
                <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(event) => setOnlyAvailable(event.target.checked)}
                    className="h-4 w-4 rounded border-accent/20 text-primary focus:ring-primary"
                />
                Show only available items
            </label>

            <Link href="/dashboard">
                <Button variant="secondary" className="w-full">
                    Open Dashboard Filters
                </Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg text-text">
            <Navbar />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 md:h-[calc(100vh-92px)] md:grid-cols-[320px_1fr] md:overflow-hidden lg:px-8">
                <aside className="vyntra-scroll hidden h-fit space-y-5 rounded-2xl border border-accent/20 bg-card p-4 shadow-sm md:block md:h-full md:overflow-y-auto md:pr-2">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text/70">Marketplace Filters</p>
                            <h1 className="mt-1 text-2xl font-semibold text-text">Search products</h1>
                        </div>

                        <div className="rounded-2xl bg-primary/10 p-3 text-sm text-primary">
                            Search bar, categories, price slider, and Google map picker are all UI-driven and update results instantly.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-accent/20 bg-bg/80 p-3 text-sm text-text/80">
                        <p className="font-medium">Live location status</p>
                        <p className="mt-1 text-xs">
                            {locationPermissionMessage || "We request your live location when you open the browse page."}
                        </p>
                        <Button variant="secondary" className="mt-3 w-full" onClick={requestLiveLocation}>
                            {liveLocationStatus === "requesting" ? "Requesting..." : "Use my live location"}
                        </Button>
                    </div>

                    {filtersContent()}
                </aside>

                <section className="vyntra-scroll min-h-0 space-y-5 md:h-full md:overflow-y-auto md:pr-2">
                    <div className="space-y-3 rounded-2xl border border-accent/20 bg-card p-4 shadow-sm md:hidden">
                        <div>
                            <p className="mb-2 text-sm font-medium text-text">Search</p>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                type="text"
                                placeholder="Search product, city, address..."
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            {(search || selectedCategory !== "all") && (
                                <p className="mt-2 text-xs text-primary">
                                    Active from navigation: {search ? `search="${search}"` : ""} {selectedCategory !== "all" ? `category=${categoryLabels[selectedCategory]}` : ""}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                            className="flex h-11 w-full items-center justify-between rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm font-semibold text-text transition hover:bg-accent/10"
                        >
                            <span className="inline-flex items-center gap-2">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M3 12h18M3 18h18" />
                                </svg>
                                Filter Menu
                            </span>
                            <span className="text-xs">{isMobileFilterOpen ? "Close" : "Open"}</span>
                        </button>

                        {isMobileFilterOpen && (
                            <div className="space-y-4 rounded-xl border border-accent/20 bg-bg/80 p-3">
                                <div className="rounded-2xl border border-accent/20 bg-card p-3 text-sm text-text/80">
                                    <p className="font-medium">Live location status</p>
                                    <p className="mt-1 text-xs">
                                        {locationPermissionMessage || "We request your live location when you open the browse page."}
                                    </p>
                                    <Button variant="secondary" className="mt-3 w-full" onClick={requestLiveLocation}>
                                        {liveLocationStatus === "requesting" ? "Requesting..." : "Use my live location"}
                                    </Button>
                                </div>

                                {filtersContent({ showSearch: false })}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/20 bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-sm text-text/70">Search results</p>
                            <h2 className="text-xl font-semibold text-text">
                                {isLoadingItems ? "Loading products..." : `${filteredItems.length} products matched`}
                            </h2>
                        </div>
                        <div className="text-right text-sm text-text/70">
                            <p>Current search: {search || "All items"}</p>
                            <p>Latitude: {latitude.toFixed(2)} | Longitude: {longitude.toFixed(2)}</p>
                            <p>Nearby radius: {nearbyRadiusKm} km</p>
                        </div>
                    </div>

                    {loadError ? (
                        <div className="rounded-2xl border border-dashed border-red-300 bg-card p-12 text-center">
                            <h3 className="text-lg font-semibold text-red-600">Unable to load marketplace</h3>
                            <p className="mt-2 text-sm text-text/70">{loadError}</p>
                        </div>
                    ) : isLoadingItems ? (
                        <div className="rounded-2xl border border-dashed border-accent/25 bg-card p-12 text-center">
                            <h3 className="text-lg font-semibold text-text">Loading products</h3>
                            <p className="mt-2 text-sm text-text/70">Fetching marketplace inventory...</p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredItems.map((item) => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-accent/25 bg-card p-12 text-center">
                            <h3 className="text-lg font-semibold text-text">No products matched your filters</h3>
                            <p className="mt-2 text-sm text-text/70">Try a broader category, lower price, or different city.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
