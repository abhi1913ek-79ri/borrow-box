import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

export async function PATCH(req) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const phone = String(body?.phone || "").trim();
	const city = String(body?.city || "").trim();
	const state = String(body?.state || "").trim();
	const pincode = String(body?.pincode || "").trim();

	if (!PHONE_REGEX.test(phone)) {
		return NextResponse.json(
			{ error: "Please enter a valid mobile number." },
			{ status: 400 },
		);
	}

	if (!city || !state) {
		return NextResponse.json(
			{ error: "City and state are required." },
			{ status: 400 },
		);
	}

	if (!PINCODE_REGEX.test(pincode)) {
		return NextResponse.json(
			{ error: "Please enter a valid 6-digit pincode." },
			{ status: 400 },
		);
	}

	await connectDB();

	const user = await User.findOneAndUpdate(
		{ email: session.user.email },
		{
			$set: {
				phone,
				address: {
					city,
					state,
					pincode,
				},
				isProfileComplete: true,
			},
		},
		{ new: true },
	);

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({
		message: "Profile updated",
		user: {
			id: user._id,
			email: user.email,
			phone: user.phone,
			address: user.address,
			isProfileComplete: user.isProfileComplete,
		},
	});
}
