const NETWORK_DELAY_MS = 180;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultProfile = {
    _id: "userId",
    name: "Abhishek Kumar",
    email: "abhishek@gmail.com",
    password: "hashed_password",
    profileImage: "https://placehold.co/160x160",
    phone: "9876543210",
    isVerified: false,
    address: {
        city: "Delhi",
        state: "Delhi",
        pincode: "110094",
    },
    createdAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-04-02T10:00:00Z",
};

let currentProfile = { ...defaultProfile };

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
    // Backend integration point: replace with GET /api/users/me.
    await wait(NETWORK_DELAY_MS);
    return {
        ...currentProfile,
        address: { ...currentProfile.address },
    };
}

export async function updateMyProfile(formValues) {
    const payload = buildProfileUpdatePayload(formValues);

    // Backend integration point: replace with PATCH /api/users/me and send payload.
    await wait(NETWORK_DELAY_MS);

    currentProfile = {
        ...currentProfile,
        ...payload,
        address: {
            ...currentProfile.address,
            ...payload.address,
        },
        updatedAt: new Date().toISOString(),
    };

    return {
        ...currentProfile,
        address: { ...currentProfile.address },
    };
}