#!/usr/bin/env tsx
/**
 * system-map.ts - Automated codebase scanner
 * Generates docs/SYSTEM_MAP.md with architecture inventory
 *
 * Usage: npm run system:map
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const CLIENT_SRC = path.join(ROOT, 'client/src');
const SERVER_SRC = path.join(ROOT, 'server');
const OUTPUT = path.join(ROOT, 'docs/SYSTEM_MAP.md');

interface RouteInfo {
  path: string;
  component: string;
  file: string;
}

interface ContextInfo {
  name: string;
  file: string;
  hooks: string[];
}

interface ApiEndpoint {
  method: string;
  path: string;
  auth: boolean;
}

// Utility: recursively get all files with extension
function getFiles(dir: string, ext: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getFiles(fullPath, ext));
    } else if (item.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Utility: read file safely
function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

// Scan for React Router routes in main.tsx
function scanRoutes(): RouteInfo[] {
  const mainPath = path.join(CLIENT_SRC, 'main.tsx');
  const content = readFile(mainPath);
  const routes: RouteInfo[] = [];

  // Match <Route path="..." element={<Component />} />
  const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s*\/>\}/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const [, routePath, component] = match;
    routes.push({
      path: routePath,
      component,
      file: `pages/${component}.tsx`
    });
  }

  return routes;
}

// Scan for React Contexts
function scanContexts(): ContextInfo[] {
  const contexts: ContextInfo[] = [];
  const files = getFiles(CLIENT_SRC, '.tsx');

  for (const file of files) {
    const content = readFile(file);

    // Look for createContext
    if (content.includes('createContext')) {
      const relativePath = path.relative(CLIENT_SRC, file);

      // Extract context name from file
      const nameMatch = content.match(/const\s+(\w+Context)\s*=/);
      const name = nameMatch ? nameMatch[1] : path.basename(file, '.tsx');

      // Find exported hooks
      const hookMatches = content.matchAll(/export\s+function\s+(use\w+)/g);
      const hooks = Array.from(hookMatches).map(m => m[1]);

      contexts.push({
        name,
        file: relativePath,
        hooks
      });
    }
  }

  return contexts;
}

// Scan for API endpoints in server routes
function scanApiEndpoints(): ApiEndpoint[] {
  const routesPath = path.join(SERVER_SRC, 'routes.ts');
  const content = readFile(routesPath);
  const endpoints: ApiEndpoint[] = [];

  // Match app.get/post/put/delete/patch
  const methods = ['get', 'post', 'put', 'delete', 'patch'];

  for (const method of methods) {
    const regex = new RegExp(`app\\.${method}\\s*\\(\\s*["']([^"']+)["']`, 'g');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, apiPath] = match;

      // Check if this route has requireAuth
      const lineStart = content.lastIndexOf('\n', match.index);
      const lineEnd = content.indexOf('\n', match.index + fullMatch.length);
      const line = content.slice(lineStart, lineEnd);
      const hasAuth = line.includes('requireAuth');

      endpoints.push({
        method: method.toUpperCase(),
        path: apiPath,
        auth: hasAuth
      });
    }
  }

  return endpoints;
}

// Scan for fetch calls in client
function scanFetchCalls(): string[] {
  const fetchPaths = new Set<string>();
  const files = getFiles(CLIENT_SRC, '.tsx');

  for (const file of files) {
    const content = readFile(file);

    // Match fetch(`${...}/api/...`) or fetch("/api/...")
    const fetchRegex = /fetch\s*\(\s*[`"'].*?\/api\/([^`"'\s]+)/g;
    let match;

    while ((match = fetchRegex.exec(content)) !== null) {
      fetchPaths.add(`/api/${match[1].replace(/\$\{[^}]+\}/g, ':param')}`);
    }
  }

  return Array.from(fetchPaths);
}

// Scan for state patterns (useState, useContext, zustand)
function scanStatePatterns(): { stores: string[]; contexts: string[] } {
  const files = getFiles(CLIENT_SRC, '.tsx');
  const stores: string[] = [];
  const contexts: string[] = [];

  for (const file of files) {
    const content = readFile(file);
    const relativePath = path.relative(CLIENT_SRC, file);

    // Check for zustand
    if (content.includes('create(') && content.includes('zustand')) {
      stores.push(relativePath);
    }

    // Check for createContext
    if (content.includes('createContext')) {
      contexts.push(relativePath);
    }
  }

  return { stores, contexts };
}

// Scan for localStorage usage
function scanLocalStorage(): { key: string; file: string }[] {
  const files = getFiles(CLIENT_SRC, '.tsx');
  const usages: { key: string; file: string }[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const content = readFile(file);
    const relativePath = path.relative(CLIENT_SRC, file);

    // Match localStorage.getItem/setItem
    const regex = /localStorage\.(get|set)Item\s*\(\s*["']([^"']+)["']/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const key = match[2];
      if (!seen.has(key)) {
        seen.add(key);
        usages.push({ key, file: relativePath });
      }
    }
  }

  return usages;
}

// Generate markdown
function generateMarkdown(): string {
  const now = new Date().toISOString().split('T')[0];
  const routes = scanRoutes();
  const contexts = scanContexts();
  const endpoints = scanApiEndpoints();
  const fetchCalls = scanFetchCalls();
  const statePatterns = scanStatePatterns();
  const localStorage = scanLocalStorage();

  let md = `# Boring Golf - System Map

> Auto-generated: ${now}
> Run \`npm run system:map\` to regenerate

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Client Routes | ${routes.length} |
| React Contexts | ${contexts.length} |
| API Endpoints | ${endpoints.length} |
| localStorage Keys | ${localStorage.length} |

---

## A. Client Routes

| Path | Component | File |
|------|-----------|------|
${routes.map(r => `| \`${r.path}\` | ${r.component} | \`${r.file}\` |`).join('\n')}

---

## B. State Management

### React Contexts
${contexts.length === 0 ? 'None found.' : contexts.map(c => `
#### ${c.name}
- **File**: \`${c.file}\`
- **Hooks**: ${c.hooks.length > 0 ? c.hooks.map(h => `\`${h}()\``).join(', ') : 'None exported'}
`).join('\n')}

### Zustand Stores
${statePatterns.stores.length === 0 ? 'None found.' : statePatterns.stores.map(s => `- \`${s}\``).join('\n')}

### localStorage Keys
| Key | Used In |
|-----|---------|
${localStorage.map(l => `| \`${l.key}\` | \`${l.file}\` |`).join('\n')}

---

## C. API Endpoints (Server)

### Routes with Auth
${endpoints.filter(e => e.auth).map(e => `- \`${e.method} ${e.path}\``).join('\n') || 'None'}

### Routes without Auth
${endpoints.filter(e => !e.auth).map(e => `- \`${e.method} ${e.path}\``).join('\n') || 'None'}

---

## D. Client Fetch Calls

API paths used by client:
${fetchCalls.map(f => `- \`${f}\``).join('\n')}

---

## E. File Tree

### Client (\`client/src/\`)
\`\`\`
${getFiles(CLIENT_SRC, '.tsx').map(f => path.relative(CLIENT_SRC, f)).sort().join('\n')}
\`\`\`

### Server (\`server/\`)
\`\`\`
${getFiles(SERVER_SRC, '.ts').map(f => path.relative(SERVER_SRC, f)).sort().join('\n')}
\`\`\`

---

*Run \`npm run system:map\` to regenerate this file*
`;

  return md;
}

// Main
function main() {
  console.log('[system-map] Scanning codebase...');

  const markdown = generateMarkdown();

  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT, markdown);
  console.log(`[system-map] Generated ${OUTPUT}`);
  console.log('[system-map] Done!');
}

main();
