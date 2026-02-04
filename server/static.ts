import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // __dirname is /app/dist in production (where index.cjs lives)
  const distPath = path.resolve(__dirname, "public");
  const assetsPath = path.join(distPath, "assets");
  const indexPath = path.join(distPath, "index.html");

  // /__diag - evidence-only debug route (BEFORE static middleware)
  app.get("/__diag", (_req, res) => {
    let distContents: string[] = [];
    let assetsContents: string[] = [];

    try {
      if (fs.existsSync(distPath)) {
        distContents = fs.readdirSync(distPath);
      }
    } catch (e) {
      distContents = [`ERROR: ${e}`];
    }

    try {
      if (fs.existsSync(assetsPath)) {
        assetsContents = fs.readdirSync(assetsPath);
      }
    } catch (e) {
      assetsContents = [`ERROR: ${e}`];
    }

    res.json({
      cwd: process.cwd(),
      __dirname,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      distPath,
      distExists: fs.existsSync(distPath),
      distContents,
      indexPath,
      indexExists: fs.existsSync(indexPath),
      assetsPath,
      assetsExists: fs.existsSync(assetsPath),
      assetsContents,
    });
  });

  // Static serving - simple and correct
  app.use("/assets", express.static(assetsPath));
  app.use(express.static(distPath));

  // SPA fallback - AFTER static middleware
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(indexPath);
  });

  // Error handler for static errors
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error("EXPRESS_ERROR", req.method, req.url, err?.stack || err);
    res.status(500).send("server error");
  });
}
