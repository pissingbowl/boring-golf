# Boring Golf — Dev Handoff

## Project Summary
- React + Vite frontend in `client/`
- Express + TypeScript backend in `server/`
- Shared types/schema in `shared/`
- PostgreSQL via Drizzle + raw SQL in `server/routes.ts`

## Repository Structure
```
boring_golf/
├── client/                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/     # Reusable UI components (e.g., TripCard)
│   │   ├── pages/          # Route-level pages (MyTripsPage, CreateTripPage)
│   │   ├── lib/            # Helpers/utilities
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.tsx         # Router + top-level routes
│   │   └── index.css       # Base/global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── .env.local          # Frontend env (VITE_API_URL)
├── server/                 # Backend (Express)
│   ├── index.ts            # App setup + middleware + server start
│   ├── routes.ts           # API routes (trips, db-check, etc.)
│   ├── auth/               # Supabase auth helpers
│   ├── admin/              # Admin routes
│   ├── middleware/         # Auth middleware
│   ├── mocks/              # Mock data for UI
│   └── services/           # Data access layer
├── shared/                 # Shared types and schema
│   ├── schema.ts
│   └── domain.ts
├── migrations/             # DB migrations
├── public/                 # Static assets
├── attached_assets/        # Design references/specs
├── tailwind.config.ts      # Tailwind theme + tokens
├── components.json         # shadcn/ui configuration
└── design_guidelines.md    # Product design philosophy
```

## Current Frontend Routes
- `/` → Basic landing text
- `/my-trips` → Lists trips via API
- `/create-trip` → Simple create form

## Styling & Design System

### Design Philosophy (`design_guidelines.md`)
- Two interfaces: **Guest Command App (mobile)** and **Operator Console (desktop)**.
- Emphasis on clarity, operational feel, and no “delight” or decorative UI.
- Strong guidance on typography size, minimal weight changes, and functional color usage.
- Avoid playful shapes, heavy shadows, or unnecessary motion.

### Tailwind Config (`tailwind.config.ts`)
- Tailwind is configured, but current MVP pages are mostly inline styles.
- Uses CSS variables for theme tokens: `--background`, `--foreground`, `--primary`, `--border`, etc.
- Custom radii: `lg=9px`, `md=6px`, `sm=3px`.
- Plugins: `tailwindcss-animate`, `@tailwindcss/typography`.

### shadcn/ui (`components.json`)
- Style: `new-york`, baseColor: `neutral`, CSS variables enabled.
- Tailwind config points to `tailwind.config.ts`.
- Aliases:
  - `@/components`, `@/components/ui`, `@/lib`, `@/hooks`

### Global CSS (`client/src/index.css`)
- Currently default Vite styles (system fonts, base colors, and button styles).
- If replacing with Tailwind, update or remove these defaults accordingly.

## Environment
- Frontend: `client/.env.local`
  - `VITE_API_URL=http://127.0.0.1:5050`
- Backend expects `server/.env` for Supabase and DB.

## Backend Notes
- `POST /api/trips` now accepts **both** `start_date` and `startDate` and stores `start_date`.
- Uses raw SQL in `server/routes.ts` for trips to avoid schema mismatch.

## Current MVP Data Flow
- `MyTripsPage` loads trips via `GET ${VITE_API_URL}/api/trips`.
- `CreateTripPage` posts to `POST ${VITE_API_URL}/api/trips` and redirects to `/my-trips`.
- `TripCard` handles display of a trip (name, destination, formatted date, nights).

## Quick Start
```bash
cd /Users/charliehilbrant/boring-golf-clean/boring_golf
npm install
npm run dev
```
Frontend runs separately from `client/` with:
```bash
cd client
npm run dev -- --host 127.0.0.1 --port 5173
```

## Files Most Likely to Change Next
- `client/src/pages/MyTripsPage.tsx`
- `client/src/pages/CreateTripPage.tsx`
- `client/src/components/TripCard.tsx`
- `server/routes.ts` (trips endpoints)
