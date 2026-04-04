"use client";

import Link from "next/link";
import { useState } from "react";

const menuItems = [
    { label: "Home", href: "/dashboard", icon: "home" },
    { label: "Browse Items", href: "/items", icon: "grid" },
    { label: "My Items", href: "/dashboard", icon: "box" },
    { label: "Bookings", href: "/dashboard", icon: "calendar" },
    { label: "Profile", href: "/profile", icon: "user" },
];

function Icon({ type }) {
    const iconClass = "h-5 w-5";

    if (type === "home") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
            </svg>
        );
    }

    if (type === "grid") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="3" width="8" height="8" rx="2" />
                <rect x="13" y="3" width="8" height="8" rx="2" />
                <rect x="3" y="13" width="8" height="8" rx="2" />
                <rect x="13" y="13" width="8" height="8" rx="2" />
            </svg>
        );
    }

    if (type === "calendar") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
        );
    }

    if (type === "user") {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.8-3.2 4.4-4.8 8-4.8S18.2 16.8 20 20" />
            </svg>
        );
    }

    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path d="M9 5V3M15 5V3" />
        </svg>
    );
}

export default function Sidebar({ active = "Home" }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`vyntra-scroll hidden h-fit rounded-2xl border border-accent/20 bg-card p-3 shadow-sm md:block md:h-full md:overflow-y-auto ${collapsed ? "w-21" : "w-full max-w-65"
                }`}
        >
            <button
                onClick={() => setCollapsed((prev) => !prev)}
                className="mb-3 flex w-full items-center justify-center rounded-2xl border border-accent/20 bg-bg/80 px-3 py-2 text-xs font-semibold text-text/80 hover:bg-accent/10"
            >
                {collapsed ? "Expand" : "Collapse"}
            </button>

            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = item.label === active;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium ${isActive
                                ? "bg-primary text-bg shadow-sm"
                                : "text-text hover:bg-accent/10"
                                }`}
                        >
                            <span className="mr-3 inline-flex items-center justify-center">
                                <Icon type={item.icon} />
                            </span>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
export function SidebarMenu({ active = "Home", onNavigate }) {
    return (
        <aside
            className="rounded-2xl border border-accent/20 bg-card p-3 shadow-sm"
        >
            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = item.label === active;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium ${isActive
                                ? "bg-primary text-bg shadow-sm"
                                : "text-text hover:bg-accent/10"
                                }`}
                        >
                            <span className="mr-3 inline-flex items-center justify-center">
                                <Icon type={item.icon} />
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}