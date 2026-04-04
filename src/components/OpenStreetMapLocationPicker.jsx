"use client";

import { useEffect, useMemo } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const DEFAULT_CENTER = [22.5726, 78.9629];
const DEFAULT_ZOOM = 11;

function MapClickHandler({ onChange }) {
    useMapEvents({
        click(event) {
            onChange(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6)));
        },
    });

    return null;
}

function MapCenterSync({ latitude, longitude }) {
    const map = useMap();

    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }, [latitude, longitude, map]);

    return null;
}

export default function OpenStreetMapLocationPicker({
    latitude,
    longitude,
    onChange,
    onUseLiveLocation,
    liveLocationStatus = "idle",
}) {
    const markerIcon = useMemo(
        () =>
            divIcon({
                className: "",
                html: `
                    <div style="
                        width: 18px;
                        height: 18px;
                        border-radius: 9999px;
                        background: linear-gradient(180deg, var(--primary), var(--accent));
                        border: 3px solid var(--bg);
                        box-shadow: 0 10px 18px color-mix(in srgb, var(--primary) 28%, transparent);
                    "></div>
                `,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            }),
        []
    );

    const center = useMemo(() => [latitude || DEFAULT_CENTER[0], longitude || DEFAULT_CENTER[1]], [latitude, longitude]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text/70">
                <span>OpenStreetMap Picker</span>
                <span>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-accent/20 shadow-sm">
                <MapContainer
                    center={center}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom
                    style={{ width: "100%", height: "220px" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenterSync latitude={latitude} longitude={longitude} />
                    <MapClickHandler onChange={onChange} />
                    <Marker position={center} icon={markerIcon} />
                </MapContainer>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2 text-xs text-text/80">
                <span>
                    Live location: {liveLocationStatus === "granted" ? "enabled" : liveLocationStatus === "denied" ? "blocked" : liveLocationStatus === "requesting" ? "requesting" : "idle"}
                </span>
                <button
                    type="button"
                    onClick={onUseLiveLocation}
                    className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-bg hover:-translate-y-0.5"
                >
                    Use live location
                </button>
            </div>
        </div>
    );
}