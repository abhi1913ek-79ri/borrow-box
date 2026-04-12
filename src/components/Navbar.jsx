"use client";

import Link from "next/link";
import Button from "./Button";
import ThemeSwitcher from "./ThemeSwitcher";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { SidebarMenu } from "./Sidebar";
import GoogleAuthModal from "./GoogleAuthModal";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function Navbar({ isLoggedIn = false, mobileSidebarActive = "" }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [query, setQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const isAuthenticated = isLoggedIn || status === "authenticated";
    const userName = session?.user?.name || "Profile";
    const userImage = session?.user?.profileImage || session?.user?.image || "";
    const addItemHref = "/add-item";

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!profileMenuRef.current?.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            document.body.style.overflow = "";
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const handleSearch = (event) => {
        event.preventDefault();
        router.push(`/items?search=${encodeURIComponent(query)}`);
    };

    return (
        <header className="theme-surface sticky top-0 z-40 border-b border-accent/20 bg-card/80 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-base font-bold text-bg shadow-md shadow-primary/40 group-hover:-translate-y-0.5">
                        V
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-text">Vyntra</p>
                        <p className="text-xs text-text/70">Share. Rent. Earn.</p>
                    </div>
                </Link>

                <form onSubmit={handleSearch} className="hidden flex-1 justify-center md:flex">
                    <div className="theme-card flex w-full max-w-xl items-center rounded-2xl border border-accent/20 bg-card px-3 py-2 shadow-sm">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search cameras, bikes, consoles..."
                            className="w-full bg-transparent text-sm text-text placeholder:text-text/60 focus:outline-none"
                        />
                        <Button type="submit" className="ml-2 rounded-xl px-3 py-1.5 text-sm">
                            Search
                        </Button>
                    </div>
                </form>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <ThemeSwitcher className="hidden md:flex" />
                    {isAuthenticated ? (
                        <Link href={addItemHref} className="hidden md:block">
                            <Button className="px-3 sm:px-4">
                                Add New Item
                            </Button>
                        </Link>
                    ) : (
                        <div className="hidden md:flex items-center gap-2 sm:gap-3">
                            <Button
                                className="px-3 sm:px-4 cursor-pointer"
                                onClick={() => setIsLoginModalOpen(true)}
                            >
                                Add New Item
                            </Button>

                            <Button
                                className="px-3 sm:px-4 cursor-pointer"
                                onClick={() => setIsLoginModalOpen(true)}
                            >
                                Login
                            </Button>
                        </div>
                    )}

                    {isAuthenticated ? (
                        <div ref={profileMenuRef} className="relative hidden md:block">
                            <button
                                type="button"
                                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                className="flex h-11 items-center gap-2 rounded-2xl border border-accent/20 bg-card px-2.5 pr-3 text-left text-text shadow-sm hover:bg-accent/10"
                                aria-haspopup="menu"
                                aria-expanded={isProfileMenuOpen}
                            >
                                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-bg">
                                    {userImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                                    ) : (
                                        userName.charAt(0).toUpperCase()
                                    )}
                                </span>
                                <svg className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-2xl border border-accent/20 bg-card p-2 shadow-xl shadow-black/10">
                                    <div className="mb-2 rounded-xl bg-bg/70 px-3 py-2">
                                        <p className="text-sm font-semibold text-text">{userName}</p>
                                        <p className="truncate text-xs text-text/60">{session?.user?.email}</p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="block rounded-xl px-3 py-2 text-sm text-text/90 hover:bg-accent/10"
                                    >
                                        Profile
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            setIsLogoutModalOpen(true);
                                        }}
                                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-text/90 hover:bg-accent/10 cursor-pointer"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-card text-text md:hidden"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-nav-panel"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="mx-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="theme-card flex items-center rounded-2xl border border-accent/20 bg-card px-3 py-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search items"
                        className="w-full bg-transparent text-sm text-text placeholder:text-text/60 focus:outline-none"
                    />
                    <Button type="submit" className="ml-2 rounded-xl px-3 py-1.5 text-xs">
                        Go
                    </Button>
                </form>

                {isMobileMenuOpen && (
                    <div id="mobile-nav-panel" className="mt-3 flex min-h-[calc(100dvh-10.5rem)] flex-col gap-3 overflow-y-auto border border-accent/20 bg-card p-3">
                        {isAuthenticated ? (
                            <Link href={addItemHref} onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full justify-start">Add New Item</Button>
                            </Link>
                        ) : (
                            <Button
                                className="w-full justify-start"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsLoginModalOpen(true);
                                }}
                            >
                                Add New Item
                            </Button>
                        )}

                        {isAuthenticated ? (
                            <>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="secondary" className="w-full justify-start">
                                        Profile
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsLogoutModalOpen(true);
                                    }}
                                >
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <Button
                                className="w-full justify-start"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsLoginModalOpen(true);
                                }}
                            >
                                Login
                            </Button>
                        )}

                        <ThemeSwitcher
                            className="w-full"
                            buttonClassName="w-full justify-between text-left"
                            menuClassName="left-0 right-0"
                            itemClassName="text-left"
                        />

                        {isLoggedIn && mobileSidebarActive && (
                            <SidebarMenu
                                active={mobileSidebarActive}
                                onNavigate={() => setIsMobileMenuOpen(false)}
                            />
                        )}
                    </div>
                )}
            </div>

            <GoogleAuthModal
                open={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                callbackUrl={isAuthenticated ? "/add-item" : "/"}
            />

            <LogoutConfirmModal
                open={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => signOut({ callbackUrl: "/" })}
            />
        </header>
    );
}
