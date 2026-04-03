"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getMyProfile, updateMyProfile } from "@/services/profileService";

function formatDateTime(value) {
    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        pincode: "",
    });

    const loadProfile = async () => {
        try {
            setIsLoadingProfile(true);
            setProfileError("");
            const result = await getMyProfile();
            setProfile(result);
            setFormState({
                name: result.name,
                email: result.email,
                phone: result.phone,
                city: result.address.city,
                state: result.address.state,
                pincode: result.address.pincode,
            });
        } catch {
            setProfileError("Unable to load profile right now.");
        } finally {
            setIsLoadingProfile(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleStartEdit = () => {
        if (!profile) {
            return;
        }

        setFormState({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            city: profile.address.city,
            state: profile.address.state,
            pincode: profile.address.pincode,
        });
        setSaveError("");
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (!profile) {
            return;
        }

        setFormState({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            city: profile.address.city,
            state: profile.address.state,
            pincode: profile.address.pincode,
        });
        setSaveError("");
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError("");
            const updatedProfile = await updateMyProfile(formState);
            setProfile(updatedProfile);
            setFormState({
                name: updatedProfile.name,
                email: updatedProfile.email,
                phone: updatedProfile.phone,
                city: updatedProfile.address.city,
                state: updatedProfile.address.state,
                pincode: updatedProfile.address.pincode,
            });
            setIsEditing(false);
        } catch {
            setSaveError("Unable to save profile changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar isLoggedIn />
                <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:h-[calc(100vh-92px)] lg:grid-cols-[auto_1fr] lg:overflow-hidden lg:px-8">
                    <Sidebar active="Profile" />
                    <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading profile...</h2>
                    </section>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar isLoggedIn />
                <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:h-[calc(100vh-92px)] lg:grid-cols-[auto_1fr] lg:overflow-hidden lg:px-8">
                    <Sidebar active="Profile" />
                    <section className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-12 text-center dark:border-red-800 dark:bg-red-900/20">
                        <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Could not load profile</h2>
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{profileError || "Try again in a moment."}</p>
                        <Button className="mt-4" onClick={loadProfile}>Retry</Button>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar isLoggedIn />

            <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:h-[calc(100vh-92px)] lg:grid-cols-[auto_1fr] lg:overflow-hidden lg:px-8">
                <Sidebar active="Profile" />

                <div className="vyntra-scroll min-h-0 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-2">
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="h-28 bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500" />
                        <div className="px-6 pb-6">
                            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex items-end gap-4">
                                    <div className="grid h-28 w-28 place-items-center rounded-2xl border-4 border-white bg-linear-to-br from-blue-600 via-blue-500 to-cyan-400 text-3xl font-bold text-white shadow-md dark:border-gray-800">
                                        {profile.name
                                            .split(" ")
                                            .map((part) => part[0])
                                            .join("")}
                                    </div>
                                    <div className="pb-2">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input
                                                    name="name"
                                                    value={formState.name}
                                                    onChange={handleFieldChange}
                                                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                />
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={formState.email}
                                                    onChange={handleFieldChange}
                                                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h1>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pb-1">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.isVerified
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                        }`}>
                                        {profile.isVerified ? "Verified" : "Not Verified"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2">
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Details</h2>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">User ID</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile._id}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                                    {isEditing ? (
                                        <input
                                            name="phone"
                                            value={formState.phone}
                                            onChange={handleFieldChange}
                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{profile.phone}</p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">Password</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.password}</p>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Address</h2>
                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">City</p>
                                    {isEditing ? (
                                        <input
                                            name="city"
                                            value={formState.city}
                                            onChange={handleFieldChange}
                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{profile.address.city}</p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">State</p>
                                    {isEditing ? (
                                        <input
                                            name="state"
                                            value={formState.state}
                                            onChange={handleFieldChange}
                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{profile.address.state}</p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="text-gray-500 dark:text-gray-400">Pincode</p>
                                    {isEditing ? (
                                        <input
                                            name="pincode"
                                            value={formState.pincode}
                                            onChange={handleFieldChange}
                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{profile.address.pincode}</p>
                                    )}
                                </div>
                            </div>
                        </article>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Fields</h2>
                        {saveError && (
                            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{saveError}</p>
                        )}
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                <p className="text-gray-500 dark:text-gray-400">createdAt</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(profile.createdAt)}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                                <p className="text-gray-500 dark:text-gray-400">updatedAt</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(profile.updatedAt)}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            {isEditing ? (
                                <>
                                    <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Profile"}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleStartEdit}>Edit Profile</Button>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
