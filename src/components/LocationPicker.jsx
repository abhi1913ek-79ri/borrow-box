"use client";

import { useMemo } from "react";

const BASE_LAT = 28.7041;
const BASE_LNG = 77.1025;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export default function LocationPicker({ latitude, longitude, onChange }) {
    const markerPosition = useMemo(() => {
        const x = clamp(((longitude - (BASE_LNG - 0.2)) / 0.4) * 100, 0, 100);
        const y = clamp((1 - (latitude - (BASE_LAT - 0.2)) / 0.4) * 100, 0, 100);
        return { x, y };
    }, [latitude, longitude]);

    const handleMapClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        const nextLat = Number((BASE_LAT + (0.5 - yRatio) * 0.4).toFixed(6));
        const nextLng = Number((BASE_LNG + (xRatio - 0.5) * 0.4).toFixed(6));

        onChange(nextLat, nextLng);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-primary/10 px-3 py-2 text-xs text-text/80">
                <span>Map Picker (static UI)</span>
                <span>
                    lat: {latitude.toFixed(4)} | lng: {longitude.toFixed(4)}
                </span>
            </div>

            <button
                type="button"
                onClick={handleMapClick}
                className="relative h-48 w-full overflow-hidden rounded-2xl border border-accent/20 bg-linear-to-br from-primary/15 via-accent/10 to-primary/20"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.2),transparent_45%),radial-gradient(circle_at_70%_65%,rgba(14,165,233,0.2),transparent_45%)]" />
                <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4">
                    {Array.from({ length: 24 }).map((_, idx) => (
                        <div key={idx} className="border border-white/15" />
                    ))}
                </div>
                <div
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-primary shadow-lg shadow-primary/30"
                    style={{ left: `${markerPosition.x}%`, top: `${markerPosition.y}%` }}
                />
                <p className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-card/85 px-2 py-1 text-xs font-medium text-text">
                    Click to pick
                </p>
            </button>
        </div>
    );
}