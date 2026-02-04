# Boring Golf - Project Summary

## Overview

A presence-based golf trip coordination platform with role-based permissions, featuring an Operator Console (desktop) for captains, Guest Command App (mobile PWA) for players, and Admin Panel with OPS_BACK control room.

---

## File Structure

```
boring-golf/
├── client/                     # React Frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── guest/          # Mobile guest interface components
│       │   ├── operator/       # Desktop operator console components
│       │   └── ui/             # shadcn/ui base components
│       ├── pages/              # Route page components
│       │   ├── admin/          # Admin panel pages
│       │   ├── landing.tsx     # Public landing page
│       │   ├── onboarding.tsx  # User profile setup
│       │   ├── dashboard.tsx   # Main operator dashboard
│       │   └── ...
│       ├── hooks/              # Custom React hooks
│       │   └── use-auth.ts     # Authentication hook
│       └── lib/                # Utilities
│           ├── supabase.ts     # Supabase client
│           └── queryClient.ts  # TanStack Query setup
│
├── server/                     # Express Backend
│   ├── auth/                   # Authentication module
│   │   ├── supabaseAuth.ts     # Supabase auth utilities
│   │   ├── routes.ts           # Auth API routes
│   │   └── index.ts            # Auth module exports
│   ├── admin/                  # Admin panel backend
│   │   ├── routes.ts           # Admin API routes
│   │   └── logging.ts          # Admin action logging
│   ├── mocks/                  # Mock data (development)
│   ├── services/               # Data access layer
│   ├── routes.ts               # Main API routes
│   ├── storage.ts              # Database storage interface
│   ├── static.ts               # Static file serving (production)
│   ├── supabase.ts             # Server Supabase admin client
│   └── index.ts                # Server entry point
│
├── shared/                     # Shared Code
│   ├── schema.ts               # Drizzle database schema
│   ├── domain.ts               # TypeScript domain types
│   ├── gravity.ts              # NOW/NEXT/LATER computation engine
│   └── models/
│       └── auth.ts             # User type definitions
│
├── supabase/                   # Supabase Configuration
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema + RLS
│
├── dist/                       # Build output (generated)
│   ├── public/                 # Built frontend assets
│   └── index.cjs               # Bundled server
│
└── Configuration Files
    ├── package.json            # Dependencies & scripts
    ├── tsconfig.json           # TypeScript config
    ├── vite.config.ts          # Vite build config
    ├── tailwind.config.ts      # Tailwind CSS config
    ├── drizzle.config.ts       # Drizzle ORM config
    ├── railway.json            # Railway deployment config
    ├── .env.example            # Environment template
    └── README.md               # Setup instructions
```

---

## Key Components

### Frontend

| Component | Purpose |
|-----------|---------|
| `landing.tsx` | Public landing page with magic link signup |
| `onboarding.tsx` | User profile collection (handicap, shirt size, etc.) |
| `dashboard.tsx` | Operator console main view |
| `guest/GravityWell.tsx` | Mobile NOW/NEXT/LATER interface |
| `ui/*` | shadcn/ui component library |

### Backend

| Module | Purpose |
|--------|---------|
| `server/auth/` | Supabase magic link authentication |
| `server/admin/` | Admin panel with OPS_BACK control room |
| `server/services/` | Data access abstraction (mock-first) |
| `server/mocks/` | Development mock data |

### Shared

| File | Purpose |
|------|---------|
| `schema.ts` | Drizzle ORM database schema |
| `domain.ts` | Business logic types (Trip, Guest, etc.) |
| `gravity.ts` | Time-aware NOW/NEXT/LATER state engine |

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTH FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │  Landing     │  User enters email + profile data
  │  Page        │  ─────────────────────────────────►
  └──────────────┘
         │
         │ 1. Store profile in localStorage ('pendingProfile')
         │ 2. Call supabase.auth.signInWithOtp(email)
         │ 3. Redirect URL: /api/auth/callback
         ▼
  ┌──────────────┐
  │   Supabase   │  Sends magic link email
  │   Auth       │  ─────────────────────────────────►
  └──────────────┘
         │
         │ User clicks email link
         │ URL contains: ?token_hash=xxx&type=magiclink
         ▼
  ┌──────────────┐
  │  /api/auth/  │  1. supabaseAdmin.auth.verifyOtp(token_hash)
  │  callback    │  2. Upsert user in database
  └──────────────┘  3. Create express-session
         │          4. Redirect to /onboarding
         ▼
  ┌──────────────┐
  │  Onboarding  │  1. Load from localStorage ('pendingProfile')
  │  Page        │  2. User completes profile form
  └──────────────┘  3. PATCH /api/auth/profile
         │          4. Set profileComplete = true
         ▼
  ┌──────────────┐
  │  Dashboard   │  Authenticated user experience
  │              │  Session cookie maintains auth state
  └──────────────┘
```

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (linked to auth.users) |
| `trips` | Golf trips with dates, location, status |
| `trip_members` | Many-to-many trip membership with roles |

### Key Fields

**profiles:**
- `id` (UUID, FK to auth.users)
- `email`, `name`, `handicap`, `home_airport`, `shirt_size`
- `dietary`, `shipping_*` (address fields)
- `profile_complete` (boolean)

**trips:**
- `id` (UUID), `user_id` (FK to profiles)
- `name`, `location`, `start_date`, `end_date`
- `status` (planning|confirmed|active|completed|cancelled)

**trip_members:**
- `trip_id`, `user_id` (composite unique)
- `role` (captain|operator|member|guest)

### Row Level Security (RLS)

- Users can only read/update their own profile
- Users can read trips they created or are members of
- Trip creators can manage trip members
- Members can remove themselves from trips

---

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `tsx server/index.ts` | Development with HMR |
| `build` | `tsx script/build.ts` | Production build |
| `start` | `node dist/index.cjs` | Production server |
| `check` | `tsc` | TypeScript type checking |
| `db:push` | `drizzle-kit push` | Sync schema to database |

---

## First Run Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Fill in .env with your values:
#    - Supabase project URL and keys
#    - Database connection string
#    - Session secret (32+ chars)

# 4. Push database schema
npm run db:push

# 5. Start development server
npm run dev
```

---

## Known Issues / TODOs

### High Priority
- [ ] Replace mock data services with real database queries
- [ ] Implement trip CRUD operations
- [ ] Add email notifications for trip invites

### Medium Priority
- [ ] Add WebSocket for real-time updates
- [ ] Implement trip itinerary builder persistence
- [ ] Add file upload for trip photos

### Low Priority
- [ ] Code splitting for smaller bundle size
- [ ] Add PWA service worker for offline support
- [ ] Implement push notifications

### Technical Debt
- Mock data layer in `server/mocks/` needs migration to real database
- Large asset images in `attached_assets/` should be moved to cloud storage
- Consider implementing proper database migrations vs db:push

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session secret (32+ chars) |
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend Supabase anon key |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |

---

## Deployment

### Railway
1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Railway auto-detects Node.js and runs `npm run build` then `npm run start`

### Supabase
1. Apply migration: `supabase/migrations/001_initial_schema.sql`
2. Configure auth redirect URLs
3. Enable email authentication with magic links
