# Boring Golf — Welcome Page

Static, fully self-contained landing page. `index.html` has everything inlined
(styles, fonts via Google CDN, design-system components, badge image), so the
only job here is to serve that one file.

## Files
- `index.html` — the page (self-contained)
- `server.js` — tiny zero-dependency Node static server (reads Railway's `PORT`)
- `package.json` — `npm start` → `node server.js`

## Deploy to Railway

### Option A — from GitHub (recommended)
1. In Cursor, put these three files in your repo (or a subfolder) and push to GitHub.
2. Railway → **New Project → Deploy from GitHub repo** → pick the repo.
3. Railway auto-detects Node, runs `npm start`, and assigns a URL.
   (Settings → Networking → **Generate Domain** if you want a public URL.)

### Option B — from your machine with the Railway CLI
```bash
npm i -g @railway/cli      # once
railway login
railway init               # in this folder
railway up                 # deploys
railway domain             # get a public URL
```

## Run locally first (optional)
```bash
npm start
# open http://localhost:3000
```

## Notes
- No build step, no dependencies to install — cold starts are instant.
- To swap in real photos, the page uses drag-and-drop image slots; for a
  production deploy you'll likely want to hard-code real `<img>`/background
  URLs instead. Say the word and I'll wire those in.
