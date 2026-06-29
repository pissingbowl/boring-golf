# Boring Golf - System Map

> Auto-generated: 2026-01-28
> Last scanned by: scripts/system-map.ts

---

## A. App Entry + Composition

### Entry Files
| File | Purpose |
|------|---------|
| `client/src/main.tsx` | React bootstrap - mounts app to `#root` |
| `client/index.html` | HTML shell with `<div id="root">` |
| `server/index.ts` | Express server - static serving + SPA fallback |

### Root Providers (in order, outermost first)
```
<StrictMode>
  <QueryClientProvider>      // @tanstack/react-query
    <BrowserRouter>          // react-router-dom
      <VibeProvider>         // client/src/lib/vibe-provider.tsx
        <Routes>...</Routes>
      </VibeProvider>
    </BrowserRouter>
  </QueryClientProvider>
</StrictMode>
```

### Global CSS Entry Points
| File | Purpose |
|------|---------|
| `client/src/index.css` | Complete design system (tokens, vibe palettes, base styles) |

---

## B. Routing Inventory

### Client Routes (`client/src/main.tsx`)

| Path | Component | File | Auth Required |
|------|-----------|------|---------------|
| `/` | LandingPage | `pages/LandingPage.tsx` → `pages/__old_mvp/landing.tsx` | No |
| `/home` | HomePage | `pages/HomePage.tsx` | No |
| `/create-trip` | CreateTripPage | `pages/CreateTripPage.tsx` | No |
| `/trip-designer` | CreateTripPage | `pages/CreateTripPage.tsx` | No |
| `/edit-trip/:id` | EditTripPage | `pages/EditTripPage.tsx` | No |
| `/my-trips` | MyTripsPage | `pages/MyTripsPage.tsx` | No |
| `/trip/:id` | TripDetailPage | `pages/TripDetailPage.tsx` | No |
| `/join` | JoinTripPage | `pages/JoinTripPage.tsx` | No |
| `/join/:code` | JoinTripPage | `pages/JoinTripPage.tsx` | No |

### Route Guards
- **None active** - All routes are public
- `requireAuth` middleware exists in `server/middleware/auth.ts` but not used on main trip routes

### Nested Routes / Layouts
- **None** - Flat route structure, no shared layouts

---

## C. State Inventory

### 1. VibeContext (Theme State)
| Property | Location |
|----------|----------|
| **File** | `client/src/lib/vibe-provider.tsx` |
| **Type** | React Context |
| **Data Owned** | `vibe: VibeName`, `vibeColors: VibeColors` |
| **Public API** | `useVibe()` → `{ vibe, setVibe, vibeColors }` |
| **Writes** | `setVibe()` updates state + localStorage + `document.body.setAttribute('data-vibe', ...)` |
| **Persistence** | `localStorage.getItem('boring-golf-vibe')` |

#### VibeName Options (12 total)
```
"southeastern-pine" | "desert-air" | "pacific-links" | "palm-beach" |
"highland-moor" | "irish-coast" | "outback-sun" | "tokyo-modern" |
"caribbean-blue" | "napa-valley" | "cabo-sunset" | "alpine-morning"
```

### 2. React Query (Server State)
| Property | Location |
|----------|----------|
| **File** | Initialized in `client/src/main.tsx` |
| **Config** | `staleTime: 5min`, `retry: 1` |
| **Usage** | Only imported in landing page for demo; pages use direct fetch |

### 3. localStorage (User Identity)
| Key | Purpose | Set By |
|-----|---------|--------|
| `memberName` | User's display name | JoinTripPage on join |
| `tripMemberId` | User's member ID for current trip | JoinTripPage, CreateTripPage |
| `tripId` | Current trip ID | JoinTripPage, CreateTripPage |
| `boring-golf-vibe` | Selected theme | VibeProvider |

### 4. Component Local State
Most pages use `useState` for:
- Form state (`formState`)
- Loading state (`loading`, `isSubmitting`)
- Error state (`error`)
- Data state (`trips`, `rounds`, `expenses`, etc.)

---

## D. Data Layer Inventory

### API Client
| Property | Value |
|----------|-------|
| **Pattern** | Direct `fetch()` calls |
| **Base URL** | `import.meta.env.VITE_API_URL` |
| **Wrapper** | None (raw fetch) |
| **Auth Header** | Not sent on most routes |

### API Endpoints

#### Trips
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/trips` | List all trips | No |
| POST | `/api/trips` | Create trip | No |
| GET | `/api/trips/:id` | Get single trip | No |
| PUT | `/api/trips/:id` | Update trip | No |
| DELETE | `/api/trips/:id` | Delete trip | No |
| PATCH | `/api/trips/:id` | Partial update | Yes |
| GET | `/api/trips/:id/full` | Trip with all details | Yes |
| GET | `/api/my-trips` | User's trips | Yes |

#### Rounds
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/trips/:tripId/rounds` | List rounds for trip | No |
| POST | `/api/trips/:tripId/rounds` | Create round | No |
| DELETE | `/api/rounds/:id` | Delete round | No |

#### Itinerary
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/trips/:tripId/itinerary` | List itinerary blocks | No |
| POST | `/api/trips/:tripId/itinerary` | Create itinerary block | No |
| DELETE | `/api/itinerary/:id` | Delete itinerary block | No |
| PATCH | `/api/itinerary/:id` | Update itinerary block | No |

#### Members
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/trips/:tripId/members` | List trip members | No |
| POST | `/api/trips/:tripId/members` | Add member | No |
| DELETE | `/api/trip-members/:id` | Remove member | No |
| POST | `/api/join` | Join trip via invite code | No |

#### Expenses
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/trips/:tripId/expenses` | List expenses with splits | No |
| POST | `/api/trips/:tripId/expenses` | Create expense with splits | No |
| DELETE | `/api/expenses/:id` | Delete expense | No |
| GET | `/api/trips/:tripId/balances` | Get balance summary | No |

### Database Schema (Postgres via raw SQL)

```sql
-- trips
id UUID PRIMARY KEY
name TEXT NOT NULL
destination TEXT NOT NULL
start_date DATE
nights INTEGER
invite_code TEXT UNIQUE
created_at TIMESTAMPTZ

-- rounds
id UUID PRIMARY KEY
trip_id UUID REFERENCES trips(id) ON DELETE CASCADE
course_name TEXT NOT NULL
date DATE NOT NULL
notes TEXT
created_at TIMESTAMPTZ

-- itinerary_blocks
id UUID PRIMARY KEY
trip_id UUID REFERENCES trips(id) ON DELETE CASCADE
date DATE NOT NULL
start_time TEXT
title TEXT NOT NULL
type TEXT NOT NULL  -- 'golf' | 'meal' | 'travel' | 'lodging' | 'misc'
notes TEXT
round_id UUID REFERENCES rounds(id) ON DELETE SET NULL
created_at TIMESTAMPTZ

-- trip_members
id UUID PRIMARY KEY
trip_id UUID REFERENCES trips(id) ON DELETE CASCADE
name TEXT NOT NULL
created_at TIMESTAMPTZ
UNIQUE(trip_id, name)

-- expenses
id UUID PRIMARY KEY
trip_id UUID REFERENCES trips(id) ON DELETE CASCADE
paid_by TEXT NOT NULL
amount NUMERIC NOT NULL
description TEXT NOT NULL
category TEXT DEFAULT 'misc'
expense_date DATE DEFAULT CURRENT_DATE
created_at TIMESTAMPTZ

-- expense_splits
id UUID PRIMARY KEY
expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE
member TEXT NOT NULL
amount_owed NUMERIC NOT NULL
is_paid BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
```

### Query Keys (React Query)
> Not actively used - pages fetch directly. QueryClient exists but queries not defined.

---

## E. Auth / Identity Flow

### Current State
| Aspect | Value |
|--------|-------|
| **Auth Provider** | Supabase (configured but not enforced) |
| **Server Auth File** | `server/auth/supabaseAuth.ts` |
| **Client Auth** | None |
| **Session Storage** | localStorage (memberName, tripMemberId) |

### How Identity Works Now
1. User creates or joins a trip
2. `memberName` and `tripMemberId` stored in localStorage
3. TripDetailPage reads localStorage to pre-fill expense forms
4. No actual authentication - just name-based identification

### Supabase Auth (Available but unused)
```typescript
// server/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### requireAuth Middleware
```typescript
// server/middleware/auth.ts
// Validates Supabase Bearer token
// Only used on /api/me, /api/my-trips, /api/trips/:id/full, etc.
```

---

## F. UI Primitives & Patterns

### Component Library
| Library | Location | Usage |
|---------|----------|-------|
| Radix UI | `@radix-ui/*` | Dialog, Dropdown, Select, Tabs, etc. |
| Lucide React | `lucide-react` | Icons |
| Framer Motion | `framer-motion` | Animations |

### Form Pattern
| Aspect | Value |
|--------|-------|
| **Library** | react-hook-form (installed) |
| **Validation** | Zod (server-side only) |
| **Current Usage** | Manual useState + onChange in all pages |

### Toast/Notifications
- Not implemented
- `@radix-ui/react-toast` is installed but not wired up

### Modal Pattern
- `@radix-ui/react-dialog` installed
- No modals in current trip pages (uses `window.confirm` for deletes)

### Design System
| Token | CSS Variable | Default |
|-------|--------------|---------|
| Primary | `--bg-primary` | `#1A2F23` |
| Background | `--bg-background` | `#F5F3EF` |
| Accent | `--bg-accent` | `#C9A227` |
| Surface | `--bg-surface` | `#E8E6E1` |
| Secondary | `--bg-secondary` | `#3D5A47` |
| Font Serif | `--font-serif` | Cormorant Garamond |
| Font Sans | `--font-sans` | Inter |

---

## G. Trip Domain Snapshot

### Trip Type Definition
```typescript
// Used in client pages
type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  nights: number | null;
  invite_code: string | null;
};
```

### Trip Components
| Component | File | Purpose |
|-----------|------|---------|
| TripCard | `components/TripCard.tsx` | List item for MyTripsPage |
| CreateTripPage | `pages/CreateTripPage.tsx` | Trip creation wizard with templates |
| EditTripPage | `pages/EditTripPage.tsx` | Edit trip basics |
| TripDetailPage | `pages/TripDetailPage.tsx` | Full trip management |
| MyTripsPage | `pages/MyTripsPage.tsx` | List all trips |
| JoinTripPage | `pages/JoinTripPage.tsx` | Join via invite code |

### Trip Templates (CreateTripPage)
| Template | Destination | Nights | Rounds |
|----------|-------------|--------|--------|
| pinehurst | Pinehurst, NC | 3 | No. 2, No. 4, No. 8 |
| bandon | Bandon, OR | 4 | Dunes, Pacific, Old Mac, Trails |
| scottsdale | Scottsdale, AZ | 3 | TPC, Troon North |
| staycation | Local | 2 | Municipal, Country Club |

### Trip Creation Flow
1. User fills form (name, destination, start_date, nights)
2. Optional: select template to pre-fill
3. POST `/api/trips` creates trip with invite_code
4. If `memberName` in localStorage, POST `/api/trips/:id/members` adds creator
5. If template selected, seed rounds and itinerary
6. Navigate to `/my-trips`

### Trip Detail Features
- **Members** - Add/remove members
- **Rounds** - Add/remove golf rounds
- **Itinerary** - Add/remove blocks (grouped by date)
- **Expenses** - Add expenses with equal splits
- **Balances** - View who owes whom
- **Invite** - Copy invite code or URL

---

## H. Trip Creation Wiring Plan

### Recommended Route
`/create-trip` (already exists at `pages/CreateTripPage.tsx`)

### Trip Data Model
```typescript
interface TripCreate {
  name: string;           // required
  destination: string;    // required
  start_date: string;     // required, ISO date
  nights: number;         // required, 1-14
}

interface TripResponse {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  nights: number;
  invite_code: string;
  created_at: string;
}
```

### API Call
```typescript
POST /api/trips
Content-Type: application/json

{
  "name": "Pinehurst Weekend",
  "destination": "Pinehurst, NC",
  "start_date": "2026-04-15",
  "nights": 3
}
```

### State Updates After Creation
1. Store `tripId` in localStorage
2. If template, seed rounds via `POST /api/trips/:id/rounds`
3. If template, seed itinerary via `POST /api/trips/:id/itinerary`
4. If memberName exists, add self as member via `POST /api/trips/:id/members`
5. Navigate to `/my-trips` (current) or `/trip/:id` (better UX)

### Form System
Current: Manual `useState` + native HTML inputs

Recommended (matches existing stack):
- Keep manual `useState` for simplicity
- Add Zod validation client-side
- Use existing template system

---

## I. File Index

### Client
```
client/
├── index.html
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Debug component (not used in routing)
│   ├── index.css             # Design system
│   ├── components/
│   │   ├── TripCard.tsx
│   │   └── __old_mvp/
│   │       ├── vibe-switcher.tsx
│   │       └── triple-phone/
│   ├── lib/
│   │   └── vibe-provider.tsx # Theme context
│   └── pages/
│       ├── LandingPage.tsx
│       ├── HomePage.tsx
│       ├── CreateTripPage.tsx
│       ├── EditTripPage.tsx
│       ├── MyTripsPage.tsx
│       ├── TripDetailPage.tsx
│       ├── JoinTripPage.tsx
│       └── __old_mvp/
│           └── landing.tsx   # Marketing page
```

### Server
```
server/
├── index.ts          # Express app + static serving
├── routes.ts         # All API routes
├── db.ts             # Drizzle database client
├── supabase.ts       # Supabase client
├── static.ts         # Static file serving helper
├── auth/
│   ├── index.ts
│   ├── routes.ts
│   └── supabaseAuth.ts
├── middleware/
│   └── auth.ts       # requireAuth middleware
├── services/
│   ├── index.ts
│   ├── trips.ts      # Trip service (Drizzle)
│   ├── expenses.ts
│   ├── itinerary.ts
│   └── users.ts
└── mocks/            # Mock data for UI development
```

---

*Generated by `scripts/system-map.ts` - Run `npm run system:map` to regenerate*
