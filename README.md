# Vyntra

Vyntra is a premium peer-to-peer rental marketplace built with Next.js and Tailwind CSS. It lets people discover items, list their own gear, book rentals, track bookings, manage a wallet, and handle payments in a polished UI-first experience.

This repository is named `borrow-box`, but the product branding in the app is Vyntra.

## What's Included

- Google authentication with NextAuth
- Profile completion gating for new users
- Marketplace browsing with search, category filtering, price filtering, and location support
- Item detail pages and add-item flow with Cloudinary image uploads
- Booking flows for renters and owners
- Wallet, transactions, and payment support with Razorpay
- Notifications and dashboard pages
- Light/dark/theme switching and responsive layouts

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- MongoDB and Mongoose
- NextAuth.js for authentication
- Cloudinary for image storage
- Razorpay for payments
- Leaflet / OpenStreetMap for location picking

## Project Structure

The app is organized around the Next.js App Router under `src/app`.

- `src/app` - routes, pages, and API handlers
- `src/components` - shared UI and feature components
- `src/services` - client-facing service layer used by pages and components
- `src/lib` - database, auth, payment, wallet, and utility helpers
- `src/models` - Mongoose models
- `src/context` - shared context providers
- `src/hooks` - custom hooks

Key routes:

- `/` - home page and featured listings
- `/items` - marketplace search and filters
- `/items/[id]` - item details
- `/add-item` - create a new listing
- `/bookings` - booking management
- `/dashboard` - authenticated dashboard
- `/my-items` - owner listings
- `/profile` - profile view and edit
- `/wallet` - wallet and transaction area

API routes live under `src/app/api` and cover auth, items, bookings, notifications, users, payments, upload, transactions, and wallet actions.

## Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm
- MongoDB database
- Google OAuth credentials
- Cloudinary account
- Razorpay account if you want payments enabled

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and add the variables your setup needs.

Required for the core app:

```env
MONGO_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Required for image uploads:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Optional, but needed if you use the payment flow:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# or, for client-side access when required by your integration:
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Optional, for map search and location picking:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Optional, for email notifications:

```env
RESEND_API_KEY=your_resend_api_key
# or
EMAIL_API_KEY=your_email_provider_key
EMAIL_API_URL=your_email_api_endpoint
EMAIL_FROM=Vyntra <onboarding@resend.dev>
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` - start the development server using Next.js and webpack
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Main User Flows

### Authentication

Users sign in with Google through NextAuth. New users are guided through a profile completion flow before they can continue using the app.

### Browsing Items

The marketplace page supports URL-driven search, category filters, price filters, city filters, availability toggles, and location-aware browsing.

### Adding an Item

The add-item form supports multi-image uploads through Cloudinary and saves the listing through the service layer.

### Bookings and Payments

Booking management, payment creation, verification, transactions, and wallet views are already scaffolded in the app and API routes.

## Backend Notes

This project is UI-first but backend-ready. The service layer in `src/services` is designed to stay stable while implementations are swapped from mock or local behavior to real API calls.

Useful backend references:

- `BACKEND_HANDOFF.md`
- `AUTHENTICATION_SETUP.md`
- `CLOUDINARY_SETUP.md`

## Troubleshooting

- If Google sign-in fails, check `NEXTAUTH_URL`, redirect URIs in Google Cloud Console, and `NEXTAUTH_SECRET`.
- If MongoDB connections fail, confirm `MONGO_URI` is correct and the cluster is reachable.
- If uploads fail, verify the Cloudinary credentials and unsigned upload preset.
- If location search or pickers do not work, confirm the browser has geolocation access or use the manual picker fallback.

## Contributing

Before opening a PR or handing the project off, run:

```bash
npm run lint
npm run build
```

If you change environment-related behavior, update the setup docs and this README together.
