"use client";

import { useMemo } from "react";

const BASE_LAT = 22.5726;
const BASE_LNG = 78.9629;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export default function FilterLocationPicker({ latitude, longitude, onChange }) {
    const marker = useMemo(() => {
        const x = clamp(((longitude - (BASE_LNG - 10)) / 20) * 100, 0, 100);
        const y = clamp((1 - (latitude - (BASE_LAT - 10)) / 20) * 100, 0, 100);
        return { x, y };
    }, [latitude, longitude]);

    const handleClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        const nextLat = Number((BASE_LAT + (0.5 - yRatio) * 20).toFixed(4));
        const nextLng = Number((BASE_LNG + (xRatio - 0.5) * 20).toFixed(4));

        onChange(nextLat, nextLng);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text/70">
                <span>Location Picker</span>
                <span>
                    {latitude.toFixed(2)}, {longitude.toFixed(2)}
                </span>
            </div>

            <button
                type="button"
                onClick={handleClick}
                className="relative h-44 w-full overflow-hidden rounded-2xl border border-accent/20 bg-linear-to-br from-primary/15 via-accent/10 to-primary/20"
            >
                <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4">
                    {Array.from({ length: 24 }).map((_, index) => (
                        <div key={index} className="border border-white/15" />
                    ))}
                </div>
                <div
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-primary shadow-lg shadow-primary/30"
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                />
                <p className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-card/85 px-2 py-1 text-xs font-medium text-text">
                    Click map to set location
                </p>
            </button>
        </div>
    );
}
