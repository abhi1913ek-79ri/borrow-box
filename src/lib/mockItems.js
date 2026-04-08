const cities = [
    { city: "Delhi", address: "Karawal Nagar", lat: 28.7041, lng: 77.1025 },
    { city: "Mumbai", address: "Andheri West", lat: 19.076, lng: 72.8777 },
    { city: "Bangalore", address: "Indiranagar", lat: 12.9716, lng: 77.5946 },
    { city: "Kolkata", address: "Park Street", lat: 22.5726, lng: 88.3639 },
    { city: "Pune", address: "Baner", lat: 18.5204, lng: 73.8567 },
    { city: "Goa", address: "Calangute", lat: 15.2993, lng: 74.124 },
    { city: "Jaipur", address: "Malviya Nagar", lat: 26.9124, lng: 75.7873 },
    { city: "Hyderabad", address: "Hitech City", lat: 17.385, lng: 78.4867 },
    { city: "Chennai", address: "T Nagar", lat: 13.0827, lng: 80.2707 },
    { city: "Ahmedabad", address: "Navrangpura", lat: 23.0225, lng: 72.5714 },
];

const productBlueprints = [
    { title: "Bosch Drill Machine", itemType: "tool", category: "power-tools", pricePerDay: 100, pricePerHour: 20, depositAmount: 500, rating: 4.5, totalReviews: 10 },
    { title: "Sony A7 IV Camera", itemType: "camera", category: "cameras", pricePerDay: 240, pricePerHour: 45, depositAmount: 2500, rating: 4.9, totalReviews: 42 },
    { title: "PS5 Console Bundle", itemType: "gaming", category: "gaming", pricePerDay: 180, pricePerHour: 35, depositAmount: 1500, rating: 4.8, totalReviews: 31 },
    { title: "Studio Mic Kit", itemType: "audio", category: "audio", pricePerDay: 90, pricePerHour: 20, depositAmount: 700, rating: 4.7, totalReviews: 18 },
    { title: "DJI Mini Drone", itemType: "drone", category: "drones", pricePerDay: 220, pricePerHour: 50, depositAmount: 2200, rating: 4.9, totalReviews: 22 },
    { title: "3-Person Tent Pro", itemType: "camping", category: "camping", pricePerDay: 75, pricePerHour: 15, depositAmount: 600, rating: 4.6, totalReviews: 14 },
    { title: "Mountain Bike Pro", itemType: "bike", category: "sports", pricePerDay: 140, pricePerHour: 30, depositAmount: 1000, rating: 4.7, totalReviews: 27 },
    { title: "Folding Projector", itemType: "tech", category: "electronics", pricePerDay: 110, pricePerHour: 25, depositAmount: 900, rating: 4.4, totalReviews: 19 },
    { title: "Canon Lens Kit", itemType: "camera", category: "cameras", pricePerDay: 160, pricePerHour: 35, depositAmount: 1400, rating: 4.8, totalReviews: 25 },
    { title: "Camping Stove Pack", itemType: "camping", category: "camping", pricePerDay: 60, pricePerHour: 12, depositAmount: 450, rating: 4.5, totalReviews: 16 },
];

export const categories = [
    "all",
    "power-tools",
    "cameras",
    "gaming",
    "audio",
    "drones",
    "camping",
    "sports",
    "electronics",
];

export const cityList = cities.map((entry) => entry.city);

export const mockItems = Array.from({ length: 100 }, (_, index) => {
    const blueprint = productBlueprints[index % productBlueprints.length];
    const city = cities[index % cities.length];
    const round = Math.floor(index / productBlueprints.length) + 1;

    return {
        _id: `item-${String(index + 1).padStart(3, "0")}`,
        title: `${blueprint.title} ${round}`,
        description: `${blueprint.title} for premium rental use. Ideal for creators, travelers, and professionals.`,
        itemType: blueprint.itemType,
        category: blueprint.category,
        pricePerDay: blueprint.pricePerDay + round * 5,
        pricePerHour: blueprint.pricePerHour + round,
        depositAmount: blueprint.depositAmount + round * 40,
        images: ["url1", "url2"],
        location: {
            address: `${city.address} Rental Hub ${round}`,
            city: city.city,
            coordinates: {
                lat: Number((city.lat + round * 0.008).toFixed(4)),
                lng: Number((city.lng + round * 0.008).toFixed(4)),
            },
        },
        availability: {
            isAvailable: index % 5 !== 0,
        },
        owner: `user-${(index % 9) + 1}`,
        rating: Number((blueprint.rating - (index % 3) * 0.1).toFixed(1)),
        totalReviews: blueprint.totalReviews + index,
        createdAt: "2026-04-02T10:00:00Z",
        updatedAt: "2026-04-02T10:00:00Z",
    };
});

export const featuredItems = mockItems.slice(0, 6);
