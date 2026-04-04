"use client";

import { useState } from "react";
import Button from "./Button";
import LocationPicker from "./LocationPicker";
import { createItemListing, itemCatalogConfig } from "@/services/itemService";

export default function AddItemForm() {
    const [latitude, setLatitude] = useState(28.7041);
    const [longitude, setLongitude] = useState(77.1025);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [submitError, setSubmitError] = useState("");

    const onLocationChange = (nextLat, nextLng) => {
        setLatitude(nextLat);
        setLongitude(nextLng);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

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
            images: ["url1", "url2"],
        };

        try {
            setIsSubmitting(true);
            setSubmitError("");
            setSubmitMessage("");
            const created = await createItemListing(values);
            setSubmitMessage(`Item prepared with ID ${created._id}. Backend can now replace the service with real API.`);
            event.currentTarget.reset();
            onLocationChange(28.7041, 77.1025);
        } catch {
            setSubmitError("Unable to prepare item payload right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="theme-card rounded-2xl border border-accent/20 bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-text">Add New Item</h2>
                <p className="mt-1 text-sm text-text/70">Schema-based listing form with location typing + map coordinate picker.</p>
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-text">Title</span>
                    <input
                        name="title"
                        type="text"
                        required
                        placeholder="Bosch Drill Machine"
                        className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-text">Description</span>
                    <textarea
                        name="description"
                        rows={4}
                        required
                        placeholder="Heavy duty drill machine for home use"
                        className="w-full rounded-xl border border-accent/20 bg-bg/80 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-text">Item Type</span>
                    <input
                        name="itemType"
                        type="text"
                        required
                        placeholder="tool"
                        className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                <label>
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

                <label>
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

                <label>
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

                <label>
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

                <label className="flex items-center gap-2 self-end pb-2">
                    <input name="isAvailable" type="checkbox" defaultChecked className="h-4 w-4 rounded border-accent/20 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-text">Availability: isAvailable</span>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-text">Images (array)</span>
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-accent/25 bg-bg/70 text-sm text-text/70">
                        Drag image files here (url1, url2...)
                    </div>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-text">Location Address</span>
                    <input
                        name="address"
                        type="text"
                        required
                        placeholder="Karawal Nagar"
                        className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-text">City</span>
                    <input
                        name="city"
                        type="text"
                        required
                        placeholder="Delhi"
                        className="h-11 w-full rounded-xl border border-accent/20 bg-bg/80 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
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

                <div className="sm:col-span-2">
                    <LocationPicker latitude={latitude} longitude={longitude} onChange={onLocationChange} />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-accent/20 bg-bg/70 p-3 text-sm">
                    <p className="font-medium text-text">Auto-managed fields (backend-generated in real app)</p>
                    <p className="mt-1 text-text/70">owner, rating, totalReviews, createdAt, updatedAt</p>
                </div>

                {submitError && (
                    <div className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                        {submitError}
                    </div>
                )}

                {submitMessage && (
                    <div className="sm:col-span-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {submitMessage}
                    </div>
                )}

                <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" className="px-6" disabled={isSubmitting}>
                        {isSubmitting ? "Preparing..." : "Publish Item"}
                    </Button>
                </div>
            </form>
        </section>
    );
}
