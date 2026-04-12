# Vyntra Authentication Implementation Guide

## Overview

This guide explains the complete authentication flow for Vyntra, which uses Google Sign-in with NextAuth.js and a popup-based login experience.

## Authentication Flow

### 1. Popup Sign-In Flow
- **Entry point:** `src/components/GoogleAuthModal.jsx`
- Users open the Google sign-in popup from the navbar or gated actions
- After clicking "Continue with Google":
  - If the user is **NEW**: A profile completion gate appears after sign-in
  - If the user is **EXISTING**: Redirected to `/` or the original callback page

### 2. Google Sign-in Callback
- **Handler:** `src/app/api/auth/[...nextauth]/route.js`
- When user signs in with Google:
  - System checks if user email exists in database
  - If **NEW**: Creates user with `isProfileComplete = false`
  - If **EXISTING**: Retrieves user from database
  - Stores session data with profile completion status

### 3. Profile Completion Gate
- **Component:** `src/components/ProfileCompletionGate.jsx`
- **Visible to:** Only new users with incomplete profiles
- **Fields:**
  - ✏️ **Username** (changeable) - How other users see you
  - 🔒 **Email** (read-only) - Verified through Google
  - 📱 **Mobile Number** - For booking confirmations
  - 📍 **Address Details:**
    - City
    - State
    - Pincode

### 4. Profile Completion API
- **Endpoint:** `POST /api/users/complete-profile`
- Updates user profile with:
  - Name/Username
  - Phone number
  - Address (city, state, pincode)
  - Sets `isProfileComplete = true`

### 5. Home Page (`/`)
- **Route:** `src/app/page.js`
- **Visible to:** Only authenticated users with complete profiles
- Shows welcome message and quick stats
- Access to list items and browse marketplace

## Database Schema (User Model)

```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  profileImage: String,
  isVerified: Boolean,
  address: {
    city: String,
    state: String,
    pincode: String
  },
  isProfileComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### Step 1: Environment Variables

Create `.env.local` file in project root (copy from `.env.local.example`):

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NODE_ENV=development
```

### Step 2: Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output to your `.env.local` file.

### Step 3: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable Google+ API:
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy **Client ID** and **Client Secret** to `.env.local`

### Step 4: MongoDB Setup

1. Create MongoDB cluster or use MongoDB Atlas
2. Get connection string
3. Add to `.env.local` as `MONGODB_URI`

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## User Journey Diagram

```
┌─────────────────────────────┐
│ Open Google sign-in popup   │
└────────┬────────────────────┘
      │
      ▼
  ┌─────────────────┐
  │ Check Database  │
  └────┬────────┬───┘
    │        │
  ┌────▼───┐ ┌─▼─────────┐
  │New User│ │Existing   │
  └────┬───┘ │User       │
    │     └─┬─────────┘
    ▼       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │Profile Gate     │────▶ │   /home page    │
    │ - Name          │     │ (Dashboard)     │
    │ - Phone         │     └─────────────────┘
    │ - Address       │
    └────────┬────────┘
       │
       ▼
    ┌─────────────────┐
    │Profile Complete │
    └────────┬────────┘
       │
       ▼
    ┌─────────────────┐
    │  /home page     │
    │ (Dashboard)     │
    └─────────────────┘
```

## Components

### Navbar (`src/components/Navbar.jsx`)
- Displays user info when authenticated
- Shows a sign-in button that opens the popup when not authenticated
- Logout functionality

### Styling

All components use **Tailwind CSS** with a blue theme:
- Primary: `from-blue-600 to-blue-700`
- Background: `from-blue-50 to-slate-100`
- Text: `slate-900` for body, `slate-600` for secondary

## Security Features

1. ✅ JWT-based sessions
2. ✅ Google OAuth verification
3. ✅ Email uniqueness enforcement
4. ✅ Protected API endpoints (require session)
5. ✅ Read-only email field (from Google)
6. ✅ Address not shared with other users
7. ✅ Session timeout: 30 days

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.js    (Auth config)
│   │       └── users/complete-profile/   (Profile API)
│   ├── page.js                           (Home page)
│   └── layout.js
├── components/
│   ├── Navbar.jsx
│   └── SessionWrapper.jsx
├── models/
│   └── User.js
├── lib/
│   └── db.js (MongoDB connection)
└── .env.local.example
```

## Troubleshooting

### Issue: "Google redirect URI mismatch"
**Solution:** Ensure your `NEXTAUTH_URL` and Google OAuth redirect URIs match exactly.

### Issue: "Cannot find module next-auth"
**Solution:** Install dependencies: `npm install`

### Issue: "MONGODB_URI not found"
**Solution:** Create `.env.local` file with MongoDB connection string.

### Issue: "User redirects in loop"
**Solution:** Check browser console for errors, ensure session is properly saved.

## Next Steps

1. ✅ Implement item listing functionality
2. ✅ Create item browsing/search
3. ✅ Add booking management
4. ✅ Implement payment integration
5. ✅ Add user reviews and ratings
6. ✅ Create notification system

## Environment Variables Checklist

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)
- [ ] `NEXTAUTH_SECRET` - Generated secret key
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

All set! Your authentication system is ready to use. 🚀
