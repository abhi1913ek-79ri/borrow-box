# Project Guidelines

## Build and Validate

- Install dependencies with `npm install`.
- Run development server with `npm run dev`.
- Run lint checks with `npm run lint` before finalizing edits.
- Build for production verification with `npm run build` when changes affect routing, config, or deployment behavior.

## Architecture

- This project uses Next.js App Router under [src/app](src/app).
- UI pages and components are implemented, while backend routes and data models are mostly placeholders.
- Treat the service layer under [src/services](src/services) as the integration boundary between UI and backend.
- Keep service function contracts stable so UI files do not require rewrites during backend integration.

## Conventions

- Use the `@/*` path alias (maps to `src/*`) for imports.
- Follow existing component and styling patterns:
  - Reusable UI components in [src/components](src/components)
  - Tailwind utility classes and `dark:` variants
  - Variant-driven button and card patterns (see [src/components/Button.jsx](src/components/Button.jsx))
- Keep user-facing loading and error states intact when updating data flows.
- Preserve URL-driven filter behavior on marketplace pages (see [src/app/items/page.js](src/app/items/page.js)).

## Backend Integration Rules

- Use [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md) as the source of truth for API payloads and rollout sequence.
- Prefer replacing internals of existing service functions instead of changing function names or call sites.
- Preserve payload sanitization helpers in services (for example create-item and profile update payload builders).

## Current Pitfalls

- Auth is scaffolded but not implemented yet (`src/app/api/auth`, `src/lib/auth.js`, `src/context/AuthContext.js`, `src/hooks/useAuth.js`).
- API route files and model files exist but are currently placeholders in several areas.
- Geolocation can fail or be blocked by browser permissions; keep manual map-based fallback UX functional.
- No test framework is currently configured; if adding tests, document the command updates in this file and README.

## Useful References

- Backend handoff and API contract: [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md)
- Current project scripts and dependencies: [package.json](package.json)
- Marketplace filtering and location behavior: [src/services/itemService.js](src/services/itemService.js) and [src/app/items/page.js](src/app/items/page.js)
- Profile data flow and safe update payload: [src/services/profileService.js](src/services/profileService.js)
