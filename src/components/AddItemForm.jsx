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
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add New Item</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Schema-based listing form with location typing + map coordinate picker.</p>
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                    <input
                        name="title"
                        type="text"
                        required
                        placeholder="Bosch Drill Machine"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                    <textarea
                        name="description"
                        rows={4}
                        required
                        placeholder="Heavy duty drill machine for home use"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Item Type</span>
                    <input
                        name="itemType"
                        type="text"
                        required
                        placeholder="tool"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
                    <select name="category" defaultValue="power-tools" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
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
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Per Day</span>
                    <input
                        name="pricePerDay"
                        type="number"
                        required
                        min="0"
                        placeholder="100"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Per Hour</span>
                    <input
                        name="pricePerHour"
                        type="number"
                        required
                        min="0"
                        placeholder="20"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Amount</span>
                    <input
                        name="depositAmount"
                        type="number"
                        required
                        min="0"
                        placeholder="500"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label className="flex items-center gap-2 self-end pb-2">
                    <input name="isAvailable" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability: isAvailable</span>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Images (array)</span>
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        Drag image files here (url1, url2...)
                    </div>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location Address</span>
                    <input
                        name="address"
                        type="text"
                        required
                        placeholder="Karawal Nagar"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
                    <input
                        name="city"
                        type="text"
                        required
                        placeholder="Delhi"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <label>
                        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</span>
                        <input
                            type="number"
                            step="0.0001"
                            value={latitude}
                            onChange={(event) => onLocationChange(Number(event.target.value), longitude)}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </label>

                    <label>
                        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</span>
                        <input
                            type="number"
                            step="0.0001"
                            value={longitude}
                            onChange={(event) => onLocationChange(latitude, Number(event.target.value))}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </label>
                </div>

                <div className="sm:col-span-2">
                    <LocationPicker latitude={latitude} longitude={longitude} onChange={onLocationChange} />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Auto-managed fields (backend-generated in real app)</p>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">owner, rating, totalReviews, createdAt, updatedAt</p>
                </div>

                {submitError && (
                    <div className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {submitError}
                    </div>
                )}

                {submitMessage && (
                    <div className="sm:col-span-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
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
