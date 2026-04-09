# Backend Handoff Guide

This project is now UI-first but backend-ready. The frontend already uses service functions that can be switched from mock mode to real API calls.

## 1) Search and Filter (Items)

Frontend flow:

- Page: src/app/items/page.js
- Service: src/services/itemService.js
- URL query source: search and category from searchParams

Current behavior:

- getMarketplaceItems() loads item list.
- filterMarketplaceItems() applies UI filters in memory:
  - search
  - selectedCategory
  - maxPrice
  - city
  - onlyAvailable

Backend integration target:

- Replace getMarketplaceItems() with GET /api/items
- Option A: Keep client filtering (small dataset)
- Option B (recommended): send filters to backend and return filtered/paginated data

Recommended API query params:

- search
- category
- maxPrice
- city
- onlyAvailable
- lat, lng (live location / map center)
- radiusKm (nearby filter)
- page, limit, sort

Do not omit after backend:

- URL state sync from src/app/items/page.js (search/category must still come from URL)
- Loading and error states in UI
- Live location request on browse page
- Nearby radius control and map-picker sync

Leaflet / OpenStreetMap integration note:

- Frontend map picker uses Leaflet with OpenStreetMap tiles.
- No map API key is required for the current UI.
- If the browser blocks geolocation, the page still loads and the user can pick a location manually on the map.

## 2) Profile Read and Update

Frontend flow:

- Page: src/app/profile/page.js
- Service: src/services/profileService.js

Current behavior:

- getMyProfile() returns mock profile.
- updateMyProfile(formValues) updates in-memory profile.
- buildProfileUpdatePayload() defines backend-safe payload.

Backend integration target:

- Replace getMyProfile() with GET /api/users/me
- Replace updateMyProfile() with PATCH /api/users/me

Update payload allowed fields:

- name
- email
- phone
- address.city
- address.state
- address.pincode

Fields intentionally omitted from update payload:

- \_id
- password
- isVerified
- createdAt
- updatedAt

Do not omit after backend:

- save loading state
- save error state
- cancel behavior that resets form to latest profile data

## 3) Add Item Form Submit

Frontend flow:

- Component: src/components/AddItemForm.jsx
- Service: src/services/itemService.js

Current behavior:

- Form submits to createItemListing(formValues).
- Service sanitizes payload via buildCreateItemPayload().
- UI shows success/error states.

Backend integration target:

- Replace createItemListing() with POST /api/items

Create payload fields allowed from UI:

- title
- description
- itemType
- category
- pricePerDay
- pricePerHour
- depositAmount
- images
- availability.isAvailable
- location.address
- location.city
- location.coordinates.lat
- location.coordinates.lng

Fields intentionally omitted from create payload:

- owner
- rating
- totalReviews
- createdAt
- updatedAt

Do not omit after backend:

- payload sanitization before request
- submit loading and error states
- map coordinate input and picker sync

## 4) Service Layer Contract (Important)

Keep these service function names stable so UI files do not need rewrite:

- getMarketplaceItems
- filterMarketplaceItems
- createItemListing
- getMyProfile
- updateMyProfile
- buildProfileUpdatePayload
- buildCreateItemPayload

Only replace internals of services with real API calls.

## 5) Suggested Next Backend Tasks

1. Implement GET /api/items with filter query support and pagination.
2. Implement POST /api/items with schema validation and auth owner injection.
3. Implement GET /api/users/me.
4. Implement PATCH /api/users/me with field whitelist.
5. Return consistent error format so UI error messages can map directly.
