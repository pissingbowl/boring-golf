import express from "express";
import path from "path";
import fs from "fs";
import { createServer } from "http";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Use process.cwd() for CJS/ESM compatibility (no __dirname)
// Both dev and prod serve from dist/public (run npm run build first)
const distPublic = path.resolve(process.cwd(), "dist", "public");
const assetsDir = path.join(distPublic, "assets");
const indexHtml = path.join(distPublic, "index.html");

// Create HTTP server for API routes
const httpServer = createServer(app);

// JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Diagnostic endpoint
app.get("/__diag", (_req, res) => {
  const safeList = (p: string) => {
    try {
      return fs.readdirSync(p).filter(f => f.endsWith(".js") || f.endsWith(".css"));
    } catch {
      return null;
    }
  };

  let indexScript: string | null = null;
  let indexCss: string | null = null;
  try {
    const html = fs.readFileSync(indexHtml, "utf8");
    const scriptMatch = html.match(/src="\/assets\/([^"]+\.js)"/);
    const cssMatch = html.match(/href="\/assets\/([^"]+\.css)"/);
    if (scriptMatch) indexScript = scriptMatch[1];
    if (cssMatch) indexCss = cssMatch[1];
  } catch {}

  res.json({
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
    distPath: distPublic,
    indexPath: indexHtml,
    distExists: fs.existsSync(distPublic),
    indexExists: fs.existsSync(indexHtml),
    assetsDirPath: assetsDir,
    assetsExists: fs.existsSync(assetsDir),
    assetsContents: safeList(assetsDir),
    indexScript,
    indexCss,
  });
});

/**
 * CRITICAL:
 * 1) Serve /assets from the real assets directory
 * 2) If a file is missing, return 404 (NOT 500) and DO NOT fall through to SPA
 */
app.use(
  "/assets",
  express.static(assetsDir, {
    fallthrough: false,            // <-- do not continue to other handlers
    immutable: true,
    maxAge: "1y",
  })
);

// If /assets file missing, express.static will throw to error handler.
// Convert that to a clean 404 instead of a 500.
app.use("/assets", (err: any, _req: any, res: any, next: any) => {
  if (err) return res.status(404).send("Asset not found");
  next();
});

/**
 * Serve everything else from distPublic.
 * But do NOT cache index.html, because it contains hashed asset filenames.
 * If index.html is cached while assets change, you get blank pages.
 */
app.use(
  express.static(distPublic, {
    setHeaders(res, filePath) {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-store");
      }
    },
  })
);

// Start server with API routes
(async () => {
  // Register API routes
  const { registerRoutes } = await import("./routes");
  await registerRoutes(httpServer, app);

  // SPA fallback (only after static + assets + API are handled)
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(indexHtml);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] listening on ${PORT}`);
    console.log(`[server] distPublic=${distPublic}`);
    console.log(`[server] assetsDir=${assetsDir}`);
  });
})();
