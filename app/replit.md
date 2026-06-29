# Boring Golf - Golf Trip Operator System

## Overview

Boring Golf is a golf trip coordination platform featuring an Operator Console for organizers and a Guest Command App for participants. It manages the entire golf trip lifecycle, including itinerary, guest logistics, shipping, tournament scoring, merchandise, and expense tracking. The system aims for an intuitive interface that provides information proactively. For guests, this translates to a mobile-first "NOW/NEXT/LATER" interface, while operators benefit from comprehensive awareness and risk visibility. The project's ambition is to streamline golf trip management, offering a sophisticated yet easy-to-use solution for both organizers and participants.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite build tool)
- **Routing**: Wouter
- **State Management**: TanStack React Query (aggressive caching)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS (custom design tokens + CSS variables), light/dark mode

### Visual Design System
- **Aesthetic**: Country Club Luxury
- **Color Palette**: Deep green (`#1A2F23`), Gold (`#C9A227`), Cream (`#F5F3EF`), Warm gray (`#E8E6E1`), Masters red (`#B8372D`)
- **Typography**: Cormorant Garamond (serif for headings), Inter (sans-serif for body)
- **Component Patterns**: Consistent use of cards, gold primary buttons, color-coded badges for status, dark green sidebar with gold accents, large serif page headers.

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ES Modules)
- **API Pattern**: RESTful JSON API (`/api/*`)
- **Build**: esbuild

### Data Layer
- **ORM**: Drizzle ORM (PostgreSQL dialect)
- **Schema**: Defined in `shared/schema.ts`
- **Validation**: Zod schemas (generated via drizzle-zod)
- **Current State**: Mock data layer (`server/mocks/`) for UI development, designed for easy swap to real database.

### Key Design Patterns

- **Mock-First Architecture**: Services abstract data access, supporting mock data during development and migration to real database.
- **Multi-User Trip Management**: Database-backed `tripMembers` table with roles (owner, organizer, member). API endpoints for trip creation, retrieval, and management, requiring authentication.
- **Gravity Well Engine**: Pure TypeScript utility (`shared/gravity.ts`) for computing "NOW/NEXT/LATER" states for the guest interface, based on time proximity to itinerary blocks.
- **Guest Command App**: Mobile-first interface focused on a primary state sentence and NOW/NEXT/LATER sections, with minimal design and 60-second auto-refresh.
- **Shared Types**: Domain types (`shared/domain.ts`) separate business logic from database schema.
- **Authentication & Onboarding**: Supabase Auth (magic link email OTP), session management (PostgreSQL), and an onboarding flow for new users to complete profile details. User profiles are tracked by `profileComplete` status.
- **Two Interface Approach**: Operator routes nested under `/trips/:tripId/*` with a sidebar and shared context, and guest routes (`/my-trips`, `/trip/:tripId`, `/guest`) which are mobile-first and sparse.
- **Admin Panel**: Separate authentication and routes (`/admin/*`) for managing users, trips, games, system settings, and a knowledge base (OPS_BACK).
- **OPS_BACK Control Room**: Console-styled interface within the admin panel for managing knowledge entries (courses, cities, history, tips, quotes) with CRUD operations.
- **LIVE Feed**: Operator console feature at `/live` with a card carousel for real-time trip information.
- **Live Schedule Page**: Masters broadcast-style schedule view (`/live-schedule`) with NOW/NEXT/TOMORROW sections and visual progress indicators.
- **Charlie Scorecard**: Premium golf scorecard (`/charliescorecard`) with live skins tracking, course selection, leaderboard, and interactive score entry.
- **Invite Flow**: Dedicated pages for inviting users to a trip (`/trip/:tripId/invite`) and for guests to join (`/join/:tripId`), supporting shareable links and form-based joining.
- **Trip Card Share Asset**: Instagram-ready shareable card for trip details.
- **Itinerary Builder**: Modal-based interface for adding various event types (Round, Meal, Activity, Travel, Free Time) to a trip.
- **Dashboard Quick Actions**: Operator dashboard with quick access to common actions and stats.
- **Mobile Bottom Navigation**: Fixed bottom navigation for mobile guest views.
- **Golf Group Validation**: Ensures players are assigned to groups before scoring, with API endpoints for readiness checks and group retrieval.

### Project Structure
- `client/src/`: Frontend components (guest, operator, UI), pages (admin), utilities.
- `server/`: Backend admin, mock data, services, API routes, storage.
- `shared/`: Shared schema, domain types, and gravity engine logic.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle Kit**: For database migrations.
- **pg Pool**: For database connection.

### UI Dependencies
- **Radix UI**: Accessible UI primitives.
- **Lucide React**: Icon library.
- **date-fns**: Date manipulation.
- **cmdk**: Command palette component.

### Build & Development
- **Vite**: Client-side development server and bundling.
- **esbuild**: Server-side bundling.

### State & Data
- **TanStack Query**: Server state management.
- **Zod**: Schema validation.