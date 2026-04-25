"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Button from "./Button";
import ImageUploadField from "./ImageUploadField";
import { createItemListing, itemCatalogConfig } from "@/services/itemService";

const OpenStreetMapLocationPicker = dynamic(() => import("./OpenStreetMapLocationPicker"), {
    ssr: false,
});

export default function AddItemForm() {
    const [latitude, setLatitude] = useState(28.7041);
    const [longitude, setLongitude] = useState(77.1025);
    const [liveLocationStatus, setLiveLocationStatus] = useState("idle");
    const [locationPermissionMessage, setLocationPermissionMessage] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");
    const [resetSignal, setResetSignal] = useState(0);

    const onLocationChange = (nextLat, nextLng) => {
        setLatitude(nextLat);
        setLongitude(nextLng);
    };

    const requestLiveLocation = () => {
        if (!navigator.geolocation) {
            setLiveLocationStatus("unsupported");
            setLocationPermissionMessage("Browser geolocation is not supported on this device.");
            return;
        }

        setLiveLocationStatus("requesting");
        setLocationPermissionMessage("Requesting your live location for the map picker...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onLocationChange(
                    Number(position.coords.latitude.toFixed(6)),
                    Number(position.coords.longitude.toFixed(6))
                );
                setLiveLocationStatus("granted");
                setLocationPermissionMessage("Live location enabled for this listing.");
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        
        if (uploadedImages.length === 0) {
            setStatusType("error");
            setStatusMessage("Please upload at least one image.");
            return;
        }

        const formData = new FormData(form);
        const imageUrls = uploadedImages.map((img) => img.url);

        const values = {
            title: formData.get("title"),
            description: formData.get("description"),
            itemType: formData.get("itemType"),
            category: formData.get("category"),
            pricePerDay: formData.get("pricePerDay"),
            pricePerHour: formData.get("pricePerHour"),
            depositAmount: formData.get("depositAmount"),
            isAvailable: formData.get("isAvailable") === "on",
            address: formData.get("address"),
            city: formData.get("city"),
            latitude,
            longitude,
            images: imageUrls,
        };

        try {
            setIsSubmitting(true);
            await createItemListing(values);
            setStatusType("success");
            setStatusMessage("Item added successfully.");
            form.reset();
            setUploadedImages([]);
            setResetSignal((value) => value + 1);
            onLocationChange(28.7041, 77.1025);
            setLiveLocationStatus("idle");
            setLocationPermissionMessage("");
        } catch (error) {
            console.error("Create item error:", error);
            setStatusType("error");
            setStatusMessage("Unable to add item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="theme-card overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-xl shadow-black/10">
            <div className="border-b border-accent/15 bg-linear-to-r from-primary/10 via-card to-accent/10 px-6 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Add Listing</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">Create a rental people can book right away</h2>
                <p className="mt-2 max-w-2xl text-sm text-text/70">
                    Fill in the required listing details, pricing, images, and map location. Your item will be published to the marketplace immediately.
                </p>
            </div>

            <form className="grid gap-6 px-6 py-6 sm:px-8" onSubmit={handleSubmit}>
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4 rounded-2xl border border-accent/15 bg-bg/50 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text/65">Item Details</h3>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Title</span>
                            <input
                                name="title"
                                type="text"
                                required
                                placeholder="Bosch Drill Machine"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Description</span>
                            <textarea
                                name="description"
                                rows={5}
                                required
                                placeholder="Heavy duty drill machine for home use"
                                className="w-full rounded-xl border border-accent/20 bg-bg/80 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Item Type</span>
                            <select
                                name="itemType"
                                required
                                defaultValue="tool"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="tool">Tool</option>
                                <option value="electronics">Electronics</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="furniture">Furniture</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Category</span>
                            <select name="category" defaultValue="power-tools" className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40">
                                {itemCatalogConfig.categories
                                    .filter((category) => category !== "all")
                                    .map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                            </select>
                        </label>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-accent/15 bg-bg/50 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text/65">Pricing & Media</h3>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-medium text-text">Price Per Day</span>
                                <input
                                    name="pricePerDay"
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="100"
                                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-medium text-text">Price Per Hour</span>
                                <input
                                    name="pricePerHour"
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="20"
                                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-medium text-text">Deposit Amount</span>
                                <input
                                    name="depositAmount"
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="500"
                                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                        </div>

                        <ImageUploadField onImagesChange={setUploadedImages} maxImages={5} resetSignal={resetSignal} />

                        <label className="flex items-center gap-2 rounded-xl border border-accent/15 bg-bg/60 px-3 py-2">
                            <input name="isAvailable" type="checkbox" defaultChecked className="h-4 w-4 rounded border-accent/20 text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-text">Mark item as available</span>
                        </label>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                    <div className="space-y-4 rounded-2xl border border-accent/15 bg-bg/50 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text/65">Location</h3>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Location Address</span>
                            <input
                                name="address"
                                type="text"
                                required
                                placeholder="Karawal Nagar"
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">City</span>
                            <select
                                name="city"
                                required
                                defaultValue={itemCatalogConfig.cityList[0]}
                                className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                {itemCatalogConfig.cityList.map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label>
                                <span className="mb-1 block text-sm font-medium text-text">Latitude</span>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={latitude}
                                    onChange={(event) => onLocationChange(Number(event.target.value), longitude)}
                                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

                            <label>
                                <span className="mb-1 block text-sm font-medium text-text">Longitude</span>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={longitude}
                                    onChange={(event) => onLocationChange(latitude, Number(event.target.value))}
                                    className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-accent/15 bg-bg/50 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text/65">Map Picker</h3>
                        <OpenStreetMapLocationPicker
                            latitude={latitude}
                            longitude={longitude}
                            onChange={onLocationChange}
                            onUseLiveLocation={requestLiveLocation}
                            liveLocationStatus={liveLocationStatus}
                        />
                        <p className="text-xs text-text/70">
                            {locationPermissionMessage || "Click the map to choose a location or use your live position."}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-bg/70 p-4 text-sm">
                    <p className="font-medium text-text">Auto-managed fields</p>
                    <p className="mt-1 text-text/70">owner, rating, totalReviews, createdAt, updatedAt</p>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" className="px-6 cursor-pointer" disabled={isSubmitting}>
                        {isSubmitting ? "Preparing..." : "Publish Item"}
                    </Button>
                </div>

            </form>

            {statusMessage && (
                <div
                    className={`pointer-events-none fixed top-6 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm shadow-lg shadow-black/10 ${
                        statusType === "success"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    {statusMessage}
                </div>
            )}

        </section>
    );
}
