"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const DEFAULT_CENTER = {
    lat: 22.5726,
    lng: 78.9629,
};

const DEFAULT_ZOOM = 11;

function GoogleMapPickerBody({ latitude, longitude, onChange, onUseLiveLocation, liveLocationStatus, apiKey }) {
    const [map, setMap] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
    });

    const center = useMemo(() => ({
        lat: latitude || DEFAULT_CENTER.lat,
        lng: longitude || DEFAULT_CENTER.lng,
    }), [latitude, longitude]);

    useEffect(() => {
        if (map) {
            map.panTo(center);
        }
    }, [center, map]);

    if (loadError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                Google Maps failed to load. Check your API key and billing setup.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Loading Google Map picker...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Google Map Picker</span>
                <span>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "220px" }}
                    center={center}
                    zoom={DEFAULT_ZOOM}
                    onLoad={(loadedMap) => setMap(loadedMap)}
                    onClick={(event) => {
                        const lat = event.latLng?.lat?.();
                        const lng = event.latLng?.lng?.();

                        if (typeof lat === "number" && typeof lng === "number") {
                            onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
                        }
                    }}
                    options={{
                        clickableIcons: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    <MarkerF position={center} />
                </GoogleMap>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50/70 px-3 py-2 text-xs text-gray-600 dark:bg-blue-900/20 dark:text-gray-300">
                <span>
                    Live location: {liveLocationStatus === "granted" ? "enabled" : liveLocationStatus === "denied" ? "blocked" : liveLocationStatus === "requesting" ? "requesting" : "idle"}
                </span>
                <button
                    type="button"
                    onClick={onUseLiveLocation}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700"
                >
                    Use live location
                </button>
            </div>
        </div>
    );
}

export default function GoogleLocationPicker({
    latitude,
    longitude,
    onChange,
    onUseLiveLocation,
    liveLocationStatus = "idle",
}) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    if (!apiKey) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Google Map Picker</span>
                    <span>
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </span>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                    Add <span className="font-semibold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> to enable the real Google Map picker.
                    <div className="mt-2">
                        The current page still requests live location and can filter nearby items.
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onUseLiveLocation}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                    Use live location
                </button>
            </div>
        );
    }

    return (
        <GoogleMapPickerBody
            apiKey={apiKey}
            latitude={latitude}
            longitude={longitude}
            onChange={onChange}
            onUseLiveLocation={onUseLiveLocation}
            liveLocationStatus={liveLocationStatus}
        />
    );
}
