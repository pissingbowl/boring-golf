# Boring Golf

A presence-based golf trip coordination platform with role-based permissions.

## Features

- **Operator Console** (Desktop): Comprehensive trip management for captains and organizers
- **Guest Command App** (Mobile PWA): NOW/NEXT/LATER gravity well interface for players
- **Admin Panel**: System management with OPS_BACK control room
- **Magic Link Auth**: Passwordless authentication via Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Supabase (magic link / email OTP)
- **State**: TanStack React Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/boring-golf.git
   cd boring-golf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual values.

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema to database |

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
├── server/           # Express backend
│   ├── auth/         # Authentication module
│   ├── admin/        # Admin panel routes
│   ├── mocks/        # Mock data (development)
│   └── services/     # Data access layer
├── shared/           # Shared types and utilities
│   ├── schema.ts     # Drizzle database schema
│   ├── domain.ts     # Domain types
│   └── gravity.ts    # NOW/NEXT/LATER engine
└── migrations/       # Database migrations
```

## Supabase Setup

1. Create a new Supabase project
2. Enable Email Auth with Magic Link in Authentication settings
3. Add your app URL to the allowed redirect URLs:
   - `http://localhost:5000/api/auth/callback` (development)
   - `https://your-domain.com/api/auth/callback` (production)
4. Copy your project URL and keys to `.env`

## License

MIT
# boring_golf
