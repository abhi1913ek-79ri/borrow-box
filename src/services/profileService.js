export function buildProfileUpdatePayload(formValues) {
    // Backend-managed fields intentionally omitted:
    // _id, password, isVerified, createdAt, updatedAt
    return {
        name: formValues.name?.trim() || "",
        email: formValues.email?.trim() || "",
        phone: formValues.phone?.trim() || "",
        address: {
            city: formValues.city?.trim() || "",
            state: formValues.state?.trim() || "",
            pincode: formValues.pincode?.trim() || "",
        },
    };
}

export async function getMyProfile() {
    const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || "Unable to load profile.");
    }

    return result.user;
}

export async function updateMyProfile(formValues) {
    const payload = buildProfileUpdatePayload(formValues);

    const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || "Unable to save profile changes.");
    }

    return {
        ...result.user,
        address: {
            ...result.user.address,
        },
    };
}