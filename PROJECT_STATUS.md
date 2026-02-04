# Boring Golf - Project Status

**Last Updated:** January 15, 2026

## 1. File Structure

```
boring-golf/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/                    # shadcn/ui components (70+ files)
│       │   ├── guest/                 # Guest app components
│       │   │   ├── help-button.tsx
│       │   │   ├── live-scoring.tsx
│       │   │   └── now-next-later.tsx
│       │   ├── operator/              # Operator console components
│       │   │   ├── boring-swag.tsx
│       │   │   ├── caddie-mode.tsx
│       │   │   ├── create-trip-form.tsx
│       │   │   ├── guest-management.tsx
│       │   │   ├── itinerary-builder.tsx
│       │   │   ├── merch-manager.tsx
│       │   │   ├── shipping-tracker.tsx
│       │   │   ├── task-board.tsx
│       │   │   ├── tournament-admin.tsx
│       │   │   └── tournament-designer.tsx
│       │   ├── triple-phone/          # Landing page demos
│       │   ├── add-event-modal.tsx
│       │   ├── app-sidebar.tsx
│       │   ├── mobile-bottom-nav.tsx
│       │   ├── navbar.tsx             # Global navigation bar
│       │   ├── theme-toggle.tsx
│       │   ├── trip-shell.tsx         # TripContext wrapper for operator pages
│       │   ├── trip-sidebar.tsx       # Operator trip sidebar (dark green)
│       │   └── vibe-switcher.tsx
│       ├── contexts/
│       │   └── trip-context.tsx       # TripContext for active trip
│       ├── hooks/
│       │   ├── use-mobile.tsx
│       │   ├── use-notifications.tsx
│       │   └── use-toast.tsx
│       ├── lib/
│       │   ├── queryClient.ts
│       │   ├── theme-provider.tsx
│       │   ├── utils.ts
│       │   └── vibe-provider.tsx
│       ├── pages/
│       │   ├── admin/                 # Admin panel pages
│       │   │   ├── dashboard.tsx
│       │   │   ├── games.tsx
│       │   │   ├── layout.tsx
│       │   │   ├── login.tsx
│       │   │   ├── ops-back.tsx       # Knowledge base control room
│       │   │   ├── system.tsx
│       │   │   ├── trips.tsx
│       │   │   └── users.tsx
│       │   ├── charlie-scorecard.tsx  # Premium scorecard page
│       │   ├── dashboard.tsx          # Operator trip dashboard
│       │   ├── game-leaderboard.tsx
│       │   ├── guest.tsx              # Guest command app
│       │   ├── itinerary.tsx
│       │   ├── join-trip.tsx          # Guest join via invite link
│       │   ├── landing.tsx            # Marketing landing page
│       │   ├── ledger.tsx             # Expense/payment tracking
│       │   ├── live-schedule.tsx      # Masters-style schedule
│       │   ├── live.tsx               # Live feed page
│       │   ├── merch.tsx
│       │   ├── my-trips.tsx           # User's trip list
│       │   ├── not-found.tsx
│       │   ├── onboarding.tsx
│       │   ├── roster.tsx
│       │   ├── scorecard.tsx
│       │   ├── shipping.tsx
│       │   ├── signin.tsx
│       │   ├── signup.tsx
│       │   ├── tasks.tsx
│       │   ├── tournaments.tsx
│       │   ├── trip-designer.tsx      # Create new trip wizard
│       │   ├── trip-invite.tsx
│       │   └── trip.tsx               # Guest trip view
│       ├── App.tsx
│       └── index.css                  # Design system + Tailwind
├── server/
│   ├── admin/
│   │   ├── index.ts
│   │   ├── logging.ts
│   │   └── routes.ts
│   ├── auth/
│   │   ├── index.ts
│   │   ├── routes.ts                  # Auth endpoints + TEST_USER_ID
│   │   └── supabaseAuth.ts            # Supabase Auth integration
│   ├── mocks/                         # Mock data for UI development
│   │   ├── expenses.ts
│   │   ├── index.ts
│   │   ├── issues.ts
│   │   ├── itinerary.ts
│   │   ├── ledger.ts
│   │   ├── live-feed.ts
│   │   ├── logistics.ts
│   │   ├── rounds.ts
│   │   ├── tournaments.ts
│   │   ├── trips.ts
│   │   └── users.ts
│   ├── services/
│   │   ├── expenses.ts
│   │   ├── index.ts
│   │   ├── itinerary.ts
│   │   ├── trips.ts                   # Trip CRUD, getUserTrips
│   │   └── users.ts
│   ├── db.ts                          # Drizzle DB connection
│   ├── index.ts                       # Server entry point
│   ├── routes.ts                      # All API routes
│   ├── static.ts                      # Production static file serving
│   ├── storage.ts
│   ├── supabase.ts
│   └── vite.ts                        # Vite dev server setup
├── shared/
│   ├── models/
│   │   └── auth.ts                    # Users & sessions tables
│   ├── domain.ts                      # Business domain types
│   ├── gravity.ts                     # NOW/NEXT/LATER engine
│   └── schema.ts                      # Drizzle ORM schema
├── migrations/                        # Database migrations
├── design_guidelines.md               # Visual design system
├── replit.md                          # Project documentation
└── package.json
```

## 2. Route Definitions

### Frontend Routes (Wouter)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Landing | Marketing landing page |
| `/signin` | SignIn | Supabase magic link sign in |
| `/signup` | SignUp | New user registration |
| `/onboarding` | Onboarding | Profile completion flow |
| `/my-trips` | MyTripsPage | User's trip list |
| `/trip-designer` | TripDesigner | Create new trip wizard |
| `/guest` | GuestPage | Guest command app |
| `/trip/:tripId` | TripPage | Guest trip view |
| `/trip/:tripId/invite` | TripInvite | Invite management |
| `/join/:tripId` | JoinTrip | Guest join flow |
| `/charliescorecard` | CharlieScorecard | Premium scorecard |
| `/live-schedule` | LiveSchedule | Masters-style schedule |
| `/trip/:tripId/games/:gameId/leaderboard` | GameLeaderboard | Game leaderboard |
| `/admin` | AdminLogin | Admin login |
| `/admin/dashboard` | AdminDashboard | Admin overview |
| `/admin/users` | AdminUsers | User management |
| `/admin/trips` | AdminTrips | Trip management |
| `/admin/games` | AdminGames | Game management |
| `/admin/system` | AdminSystem | System settings |
| `/admin/ops-back` | AdminOpsBack | Knowledge base |
| `/trips/:tripId/dashboard` | TripShell+Dashboard | Operator dashboard |
| `/trips/:tripId/roster` | TripShell+Roster | Guest roster |
| `/trips/:tripId/itinerary` | TripShell+Itinerary | Itinerary view |
| `/trips/:tripId/tournaments` | TripShell+Tournaments | Tournament setup |
| `/trips/:tripId/tournaments/scorecard` | TripShell+Scorecard | Scoring |
| `/trips/:tripId/ledger` | TripShell+Ledger | Expenses/payments |
| `/trips/:tripId/tasks` | TripShell+Tasks | Task management |
| `/trips/:tripId/shipping` | TripShell+Shipping | Bag/item tracking |
| `/trips/:tripId/merch` | TripShell+Merch | Merchandise orders |
| `/trips/:tripId/live` | TripShell+Live | Live feed |

### Backend API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Current user (returns test user for dev) |
| GET | `/api/auth/callback` | Supabase OAuth callback |
| POST | `/api/auth/login` | Magic link login |
| POST | `/api/auth/logout` | Session logout |
| PATCH | `/api/auth/profile` | Update user profile |
| GET | `/api/me` | Current user info |
| GET | `/api/my-trips` | User's trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips` | List trips |
| GET | `/api/trips/:id` | Get trip |
| GET | `/api/trips/:id/full` | Trip with all details |
| GET | `/api/trips/:id/gravity` | Gravity well state |
| GET | `/api/trips/:id/risk` | Risk summary |
| GET | `/api/trips/:tripId/members` | Trip members |
| POST | `/api/trips/:tripId/members/invite` | Invite member |
| PATCH | `/api/trips/:tripId/members/:memberId` | Update member |
| DELETE | `/api/trips/:tripId/members/:memberId` | Remove member |
| GET | `/api/trips/:tripId/blocks` | Itinerary blocks |
| GET | `/api/trips/:tripId/tasks` | Tasks |
| GET | `/api/trips/:tripId/shipments` | Shipments |
| GET | `/api/trips/:tripId/bags` | Golf bags |
| GET | `/api/trips/:tripId/travel` | Travel items |
| GET | `/api/trips/:tripId/tournaments` | Tournaments |
| GET | `/api/trips/:tripId/games` | Games |
| POST | `/api/trips/:tripId/games` | Create game |
| PATCH | `/api/games/:gameId` | Update game |
| DELETE | `/api/games/:gameId` | Delete game |
| GET | `/api/games/:gameId/readiness` | Validate game |
| GET | `/api/games/:gameId/groups` | Game groups |
| GET | `/api/trips/:tripId/groups` | Trip groups |
| PATCH | `/api/groups/:groupId` | Update group |
| GET | `/api/trips/:tripId/expenses` | Expenses |
| GET | `/api/trips/:tripId/expenses/summary` | Expense summary |
| GET | `/api/trips/:tripId/ledger` | Ledger summary |
| GET | `/api/trips/:tripId/ledger/entries` | Ledger entries |
| GET | `/api/trips/:tripId/ledger/balances` | Balances |
| GET | `/api/trips/:tripId/ledger/settlements` | Settlements |
| POST | `/api/trips/:tripId/ledger/settlements` | Create settlement |
| GET | `/api/payment-methods` | Available payment methods |
| GET | `/api/trips/:tripId/issues` | Issues |
| GET | `/api/trips/:tripId/announcements` | Announcements |
| GET | `/api/tournaments/:tournamentId/leaderboard` | Leaderboard |
| GET | `/api/tournaments/:tournamentId/teams` | Teams |
| GET | `/api/tournaments/:tournamentId/rounds` | Rounds |
| GET | `/api/rounds/:roundId/scores` | Scores |
| GET | `/api/live/*` | Live feed data (PGA tour, news, etc.) |
| GET | `/api/rounds/active` | Active round (caddie mode) |
| POST | `/api/rounds/active/score` | Update player score |
| POST | `/api/rounds/active/advance` | Advance to next hole |
| POST | `/api/rounds/active/go-to-hole` | Jump to hole |
| POST | `/api/rounds/active/end` | End round |
| GET | `/api/courses/:courseId/holes` | Course hole data |
| GET | `/api/admin/*` | Admin routes |
| GET | `/api/knowledge` | Knowledge entries |
| POST | `/api/knowledge` | Create knowledge entry |

## 3. Database Schema

### Tables

```
┌─────────────────────┐      ┌─────────────────────┐
│       trips         │      │      tripMembers    │
├─────────────────────┤      ├─────────────────────┤
│ id (PK, UUID)       │──┐   │ id (PK, UUID)       │
│ name                │  │   │ tripId (FK)         │──┐
│ theme               │  │   │ userId              │  │
│ location            │  └──>│ role (enum)         │  │
│ startDate           │      │ joinedAt            │  │
│ endDate             │      └─────────────────────┘  │
│ tier (enum)         │                               │
│ budget              │      ┌─────────────────────┐  │
│ status (enum)       │      │       guests        │  │
│ inviteCode (UUID)   │──┐   ├─────────────────────┤  │
│ createdAt           │  │   │ id (PK, UUID)       │  │
└─────────────────────┘  │   │ tripId (FK)         │<─┘
                         └──>│ name                │
┌─────────────────────┐      │ email, phone        │
│   itineraryBlocks   │      │ role (enum)         │
├─────────────────────┤      │ rsvpStatus (enum)   │
│ id (PK, UUID)       │      │ dietary, tshirtSize │
│ tripId (FK)         │      │ handicap, ghin      │
│ type (enum)         │      │ arrivalDate, etc.   │
│ title, description  │      └─────────────────────┘
│ location, mapLink   │
│ startTime, endTime  │      ┌─────────────────────┐
│ bufferBefore/After  │      │      tournaments    │
│ status (enum)       │      ├─────────────────────┤
│ vendorId, confirm.  │      │ id (PK, UUID)       │
│ cost, notes         │      │ tripId (FK)         │
│ participants[]      │      │ name                │
└─────────────────────┘      │ format (enum)       │
                             │ rules               │
┌─────────────────────┐      │ handicapMethod      │
│       tasks         │      │ prizePool           │
├─────────────────────┤      │ isActive            │
│ id (PK, UUID)       │      └─────────────────────┘
│ tripId (FK)         │              │
│ title, description  │              │
│ owner               │      ┌───────┴───────┐
│ dueDate             │      │               │
│ status (enum)       │      ▼               ▼
│ priority            │  ┌─────────┐   ┌─────────┐
│ checklist (jsonb)   │  │  teams  │   │ rounds  │
└─────────────────────┘  ├─────────┤   ├─────────┤
                         │ id      │   │ id      │
┌─────────────────────┐  │ tourId  │   │ tourId  │
│     shipments       │  │ name    │   │ name    │
├─────────────────────┤  │ color   │   │ course  │
│ id (PK, UUID)       │  │ members │   │ date    │
│ tripId (FK)         │  └─────────┘   │ complete│
│ guestId (FK)        │                └────┬────┘
│ carrier, tracking   │                     │
│ shipTo, eta         │      ┌─────────────────────┐
│ status (enum)       │      │       scores        │
│ itemDescription     │      ├─────────────────────┤
└─────────────────────┘      │ id (PK, UUID)       │
                             │ roundId (FK)        │
┌─────────────────────┐      │ guestId (FK)        │
│     merchOrders     │      │ teamId              │
├─────────────────────┤      │ holeScores (jsonb)  │
│ id (PK, UUID)       │      │ totalStrokes        │
│ tripId (FK)         │      │ netScore, points    │
│ designName          │      │ confirmed           │
│ items (jsonb)       │      └─────────────────────┘
│ sizeRuns (jsonb)    │
│ status (enum)       │      ┌─────────────────────┐
│ deadline, cost      │      │ knowledgeEntries    │
└─────────────────────┘      ├─────────────────────┤
                             │ id (PK, UUID)       │
┌─────────────────────┐      │ category (enum)     │
│       issues        │      │ title, content      │
├─────────────────────┤      │ relatedEntityId     │
│ id (PK, UUID)       │      │ tags[]              │
│ tripId (FK)         │      │ isActive            │
│ guestId (FK)        │      │ createdBy           │
│ title, description  │      └─────────────────────┘
│ severity (enum)     │
│ status (enum)       │      ┌─────────────────────┐
│ owner, playbook     │      │       users         │
│ resolution          │      ├─────────────────────┤
│ createdAt, resolved │      │ id (PK)             │
└─────────────────────┘      │ email               │
                             │ firstName, lastName │
┌─────────────────────┐      │ handicap            │
│   announcements     │      │ dietary, tshirtSize │
├─────────────────────┤      │ homeAirport         │
│ id (PK, UUID)       │      │ shipping address    │
│ tripId (FK)         │      │ profileComplete     │
│ message             │      │ createdAt           │
│ createdAt, sentBy   │      └─────────────────────┘
└─────────────────────┘
                             ┌─────────────────────┐
                             │      sessions       │
                             ├─────────────────────┤
                             │ sid (PK)            │
                             │ sess (jsonb)        │
                             │ expire              │
                             └─────────────────────┘
```

### Enums

- **trip_status**: draft, planning, confirmed, active, completed, cancelled
- **trip_tier**: ghost, onsite, signature
- **member_role**: owner, organizer, member
- **guest_role**: captain, guest, vip
- **rsvp_status**: pending, confirmed, declined
- **block_type**: tee_time, meal, transport, lodging, activity, free_time
- **block_status**: upcoming, boarding, in_progress, complete, changed, cancelled
- **task_status**: pending, in_progress, completed, blocked
- **shipment_status**: invite_sent, address_confirmed, label_created, in_transit, delivered, received, issue
- **tournament_format**: scramble, best_ball, match_play, stableford, skins, ryder_cup
- **merch_status**: collecting, ordered, shipped, delivered, staged
- **issue_status**: open, in_progress, resolved
- **issue_severity**: low, medium, high, critical
- **knowledge_category**: course, city, history, easter_egg, tip, quote

## 4. Key Components

### Layout Components

| Component | Purpose |
|-----------|---------|
| `TripShell` | Wraps operator pages with TripContext, TripSidebar, and NavBar |
| `TripSidebar` | Dark green sidebar for trip navigation (operator console) |
| `NavBar` | Global top navigation with logo, links, and auth state |
| `MobileBottomNav` | Fixed bottom nav for mobile guest views |

### Operator Components

| Component | Purpose |
|-----------|---------|
| `TripDashboard` | Quick stats, risk radar, recent activity |
| `GuestManagement` | Invite, manage, and track guests |
| `ItineraryBuilder` | Visual itinerary block editor |
| `TournamentDesigner` | Create and configure tournaments |
| `TournamentAdmin` | Manage active tournaments |
| `CaddieMode` | Live scoring interface |
| `TaskBoard` | Kanban-style task management |
| `ShippingTracker` | Track bags and shipments |
| `MerchManager` | Handle merchandise orders |
| `CreateTripForm` | New trip creation form |

### Guest Components

| Component | Purpose |
|-----------|---------|
| `NowNextLater` | Gravity well display (primary guest interface) |
| `LiveScoring` | Real-time score updates |
| `HelpButton` | Quick access to support |

### Contexts & Providers

| Provider | Purpose |
|----------|---------|
| `TripContext` | Provides tripId and trip data to operator pages |
| `ThemeProvider` | Light/dark mode theming |
| `VibeProvider` | Color palette switching (12 vibes) |
| `NotificationProvider` | Toast/notification system |

## 5. Authentication State

### Current Implementation

**STATUS: DEVELOPMENT MODE (Auth Bypassed)**

The authentication system uses Supabase Auth with magic link (email OTP) but is currently bypassed for development:

```typescript
// server/auth/routes.ts
const TEST_USER_ID = "f07cd069-8a65-400e-bd3c-9d6d3417147a";

app.get('/api/auth/me', async (req, res) => {
  const userId = req.session?.userId || TEST_USER_ID;
  const user = await getUser(userId);
  if (!user) {
    return res.json({
      id: TEST_USER_ID,
      email: 'test@boringgolf.com',
      firstName: 'Test',
      lastName: 'User',
      profileComplete: true
    });
  }
  res.json(user);
});
```

### Components

1. **Supabase Auth Integration** (`server/auth/supabaseAuth.ts`)
   - Magic link/email OTP authentication
   - Session storage in PostgreSQL (`sessions` table)
   - `isAuthenticated` middleware for protected routes

2. **Session Management**
   - 7-day session TTL
   - `connect-pg-simple` for PostgreSQL session store
   - Secure cookies in production

3. **User Flow (when enabled)**
   - `/signup` - Email entry for magic link
   - `/signin` - Login with magic link
   - `/api/auth/callback` - Supabase OAuth callback
   - `/onboarding` - Profile completion after first login

### To Enable Full Auth

1. Remove TEST_USER_ID fallback from `/api/auth/me`
2. Uncomment redirect logic in `landing.tsx`
3. Add `isAuthenticated` middleware to protected routes

## 6. Environment Variables

### Shared Environment

| Variable | Value | Purpose |
|----------|-------|---------|
| `ADMIN_EMAIL` | charlie@boringgolf.com | Admin panel login |
| `ADMIN_PASSWORD` | FlamingMat2026! | Admin panel login |
| `VITE_APP_URL` | https://boringgolf-boring-golf.up.railway.app | Production URL |

### Secrets (Available)

| Secret | Purpose |
|--------|---------|
| `SESSION_SECRET` | Express session signing |
| `DATABASE_URL` | PostgreSQL connection string |
| `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` | DB connection details |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key |
| `VITE_SUPABASE_URL` | Client-side Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Client-side Supabase key |

## 7. Known Issues & TODOs

### Current Issues

1. **LSP Error in server/routes.ts**
   - There's an unresolved LSP diagnostic (likely a type issue)
   - Needs investigation

2. **Mock Data Layer**
   - Most data is served from `server/mocks/` directory
   - Designed for easy swap to real database
   - Trip CRUD uses real database; most other features use mocks

3. **Auth Flow Disabled**
   - Landing page redirect commented out
   - TEST_USER_ID used for all API calls
   - Need to re-enable for production

### Pending Features

- [ ] Real database integration for all features (currently using mocks)
- [ ] Push notifications
- [ ] Real-time updates (WebSocket)
- [ ] File upload for merch designs
- [ ] Email notifications (Supabase triggers)
- [ ] PWA manifest and service worker
- [ ] Mobile app optimization

### Design System Notes

- **Primary Color**: Deep green `#1A2F23`
- **Accent Color**: Gold `#C9A227`
- **Background**: Cream `#F5F3EF`
- **Typography**: Cormorant Garamond (headings), Inter (body)
- **Sidebar**: Dark green with light text (recently fixed)

### Deployment

- **Platform**: Railway (configured in `railway.json`)
- **Static Files**: Served from `process.cwd() + '/dist/public'`
- **Build**: `npm run build` (Vite + esbuild)
