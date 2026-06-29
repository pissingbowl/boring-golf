# Boring Golf

**Created by [Charlie Hilbrant](https://github.com/pissingbowl).**

Boring Golf is a golf trip coordination platform and brand. This repository is a **monorepo** that holds two independently deployable products under one roof:

| Folder | Product | Audience |
|--------|---------|----------|
| [`app/`](./app/) | **Boring Golf App** — trip planning, itineraries, live rounds, operator tools | Members on an active trip |
| [`store/`](./store/) | **Boring Golf Store** — static storefront / landing experience | Visitors, merch, marketing |

Each folder has its own `package.json`, deploy settings, and runtime. They share this Git history and GitHub repo, but they do **not** share a build step or a single server process.

---

## Table of contents

- [Why a monorepo?](#why-a-monorepo)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start — Store](#quick-start--store)
- [Quick start — App](#quick-start--app)
- [Environment variables](#environment-variables)
- [Deployment (Railway)](#deployment-railway)
- [Suggested domains](#suggested-domains)
- [Git & history notes](#git--history-notes)
- [Related repositories](#related-repositories)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)

---

## Why a monorepo?

Splitting **app** and **store** keeps concerns separate:

- **Store** — fast, static, zero backend dependencies; safe to iterate on branding and merch without touching trip logic.
- **App** — full-stack (React + Express + PostgreSQL + Supabase auth); heavier deploy, secrets, and database migrations.

One repo means one place for issues, docs, and releases, while Railway (or any host) can point two services at two subfolders.

---

## Repository layout

```
boring-golf/                    ← you are here (repo root)
├── README.md                   ← this file
├── .gitignore                  ← ignores node_modules, .env, dist, etc. (both folders)
│
├── app/                        ← Boring Golf App (full product)
│   ├── client/                 ← React + Vite frontend
│   ├── server/                 ← Express API + auth + services
│   ├── shared/                 ← Shared TypeScript types / schema
│   ├── migrations/             ← Database migrations
│   ├── public/                 ← Static assets (videos, patterns)
│   ├── package.json
│   ├── .env.example
│   └── README.md               ← App-specific docs
│
└── store/                      ← Boring Golf Store (static site)
    ├── index.html              ← Self-contained page (styles & content inlined)
    ├── server.js               ← Tiny Node static file server (Railway-friendly)
    ├── package.json
    └── README.md               ← Store-specific deploy notes
```

**Not tracked by Git (ignored):** `node_modules/`, `dist/`, `build/`, `.env`, `.env.*`, logs, and OS junk. Never commit secrets.

---

## Prerequisites

| Requirement | Store | App |
|-------------|-------|-----|
| Node.js 18+ | Yes | Yes |
| PostgreSQL | No | Yes |
| Supabase project | No | Yes (magic-link auth) |
| npm | Yes | Yes |

---

## Quick start — Store

The store is a **single self-contained HTML file** plus a minimal Node server for production hosting.

```bash
cd store
npm start
# → http://localhost:3000
```

- **No `npm install` required** — no dependencies in `package.json`.
- **No build step** — edit `index.html` directly.
- See [`store/README.md`](./store/README.md) for Railway CLI and GitHub deploy options.

---

## Quick start — App

The app is a **React frontend** and **Express backend** in one Node project.

```bash
cd app
npm install          # installs root + client (via postinstall)
cp .env.example .env # then fill in real values — see below
npm run db:push      # push schema to PostgreSQL (when DB is configured)
npm run dev          # development server
# → http://localhost:5000
```

### App scripts (from `app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run build` | Production build |
| `npm run start` | Run production build (`dist/index.cjs`) |
| `npm run check` | TypeScript check |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run system:map` | Generate system map docs |

Full app documentation: [`app/README.md`](./app/README.md).

### App tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, TypeScript, Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Supabase (magic link / email OTP)
- **State:** TanStack React Query

---

## Environment variables

### Store

None required. Railway sets `PORT` automatically; locally defaults to `3000`.

### App

Copy `app/.env.example` → `app/.env` and configure at minimum:

- Database connection (PostgreSQL)
- Supabase URL and keys (auth)
- Session / cookie secrets as documented in `.env.example`

**Never commit `.env` files.** They are listed in the root `.gitignore`.

---

## Deployment (Railway)

Use **two Railway services** from the **same GitHub repo**, with different **root directories**:

### Service 1 — Boring Golf Store

| Setting | Value |
|---------|--------|
| Repo | `pissingbowl/boring-golf` |
| Root directory | `store` |
| Start command | `npm start` (default) |
| Build command | *(none)* |

Generate a public domain in Railway → Networking. Example: `boringgolf.com` or a Railway subdomain while testing.

### Service 2 — Boring Golf App

| Setting | Value |
|---------|--------|
| Repo | `pissingbowl/boring-golf` |
| Root directory | `app` |
| Build command | `npm run build` |
| Start command | `npm run start` |

Add all required env vars from `app/.env.example` in the Railway service settings. Attach a PostgreSQL plugin or external DB URL.

Generate a separate domain. Example: `app.boringgolf.com`.

---

## Suggested domains

| URL | Folder | Purpose |
|-----|--------|---------|
| `boringgolf.com` | `store/` | Brand, merch, landing |
| `app.boringgolf.com` | `app/` | Signed-in trip experience |

DNS is configured at your registrar / Cloudflare; Railway only needs the custom domain attached per service.

---

## Git & history notes

This monorepo was assembled from two lines of work:

1. **`store/`** — static store page (formerly at repo root as the welcome page).
2. **`app/`** — full application restored from the local `backup-before-replace` snapshot.

Additional work-in-progress (dashboard, scorecard, icons) may still exist in a **local git stash** on your machine — it is not necessarily reflected in `app/` yet. Ask before merging stash if you are unsure.

---

## Related repositories

| Repo | Role |
|------|------|
| **[pissingbowl/boring-golf](https://github.com/pissingbowl/boring-golf)** (this repo) | Monorepo — app + store |
| **[pissingbowl/boring_golf](https://github.com/pissingbowl/boring_golf)** (legacy) | Older standalone app history; kept as archive/reference |

Do not force-push the legacy repo unless you intentionally want to replace its history.

---

## Troubleshooting

### `npm install` fails in `app/`

- Ensure Node 18+.
- Run from `app/`, not repo root.
- The `postinstall` script runs `npm install` inside `client/` — both must succeed.

### Store shows blank page locally

- Confirm you ran `npm start` from **`store/`**, not repo root.
- Open `http://localhost:3000` (not the app port `5000`).

### App won't start — database errors

- Check `app/.env` and that PostgreSQL is reachable.
- Run `npm run db:push` after env is correct.

### Leftover folders at repo root (`client/`, `server/`, `node_modules/`)

These may appear on disk from earlier setups. **Git only tracks `app/` and `store/`.** Safe to delete root-level leftovers once you confirm the monorepo works; they are not part of the intended layout.

### Push rejected / unrelated histories

If pushing to a new empty GitHub repo, a normal `git push -u origin main` should work after the monorepo commit. If GitHub already has different commits on `main`, stop and reconcile before force-pushing.

---

## Credits

**Boring Golf** was created by **Charlie Hilbrant**.

- GitHub: [@pissingbowl](https://github.com/pissingbowl)
- Repository: [github.com/pissingbowl/boring-golf](https://github.com/pissingbowl/boring-golf)

For app feature details, design system notes, and operator/guest UX philosophy, see the docs inside `app/` (`DESIGN_SYSTEM.md`, `DEV_HANDOFF.md`, etc.).

---

## License

See individual packages and assets within `app/` and `store/` for license details. If no license file is present at root, treat the codebase as private unless otherwise specified by the owner.
