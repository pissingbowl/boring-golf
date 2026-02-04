/**
 * HTTP Client with Network Logging
 * Wraps fetch() and logs all requests to window.__BG_NETLOG__
 *
 * Usage:
 *   import { http } from '@/lib/http';
 *   const data = await http.get('/api/trips');
 *   const trip = await http.post('/api/trips', { name: 'My Trip', ... });
 */

export interface NetLogEntry {
  id: number;
  timestamp: number;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  requestBody: unknown;
  responseBody: unknown;
  error: string | null;
}

// Network log array (max 50 entries)
const MAX_LOG_SIZE = 50;
let netlogId = 0;

function getNetlog(): NetLogEntry[] {
  if (typeof window === 'undefined') return [];
  if (!window.__BG_NETLOG__) {
    window.__BG_NETLOG__ = [];
  }
  return window.__BG_NETLOG__;
}

function addToNetlog(entry: NetLogEntry): void {
  const log = getNetlog();
  log.unshift(entry);
  if (log.length > MAX_LOG_SIZE) {
    log.pop();
  }
}

function truncate(value: unknown, maxLen = 500): unknown {
  if (typeof value === 'string' && value.length > maxLen) {
    return value.slice(0, maxLen) + '... [truncated]';
  }
  if (typeof value === 'object' && value !== null) {
    const str = JSON.stringify(value);
    if (str.length > maxLen) {
      return JSON.parse(str.slice(0, maxLen) + '"}') ?? '[truncated object]';
    }
  }
  return value;
}

function redactSensitive(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) return body;

  const sensitive = ['password', 'token', 'secret', 'api_key', 'apiKey', 'authorization'];
  const result = { ...body as Record<string, unknown> };

  for (const key of Object.keys(result)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      result[key] = '[REDACTED]';
    }
  }

  return result;
}

async function loggedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const entry: NetLogEntry = {
    id: ++netlogId,
    timestamp: Date.now(),
    method: options.method || 'GET',
    url,
    status: null,
    duration: null,
    requestBody: null,
    responseBody: null,
    error: null,
  };

  // Log request body (redacted)
  if (options.body) {
    try {
      const parsed = JSON.parse(options.body as string);
      entry.requestBody = truncate(redactSensitive(parsed));
    } catch {
      entry.requestBody = '[non-JSON body]';
    }
  }

  const startTime = performance.now();

  // Console log start
  if (import.meta.env.DEV) {
    console.log(`[BG] ${entry.method} ${url}`, entry.requestBody || '');
  }

  try {
    const response = await fetch(url, options);
    entry.status = response.status;
    entry.duration = Math.round(performance.now() - startTime);

    // Clone response to read body
    const cloned = response.clone();
    try {
      const text = await cloned.text();
      try {
        entry.responseBody = truncate(JSON.parse(text));
      } catch {
        entry.responseBody = truncate(text);
      }
    } catch {
      entry.responseBody = '[unreadable]';
    }

    // Console log result
    if (import.meta.env.DEV) {
      console.log(
        `[BG] ${entry.method} ${url} → ${entry.status} (${entry.duration}ms)`,
        entry.responseBody
      );
    }

    addToNetlog(entry);
    return response;
  } catch (err) {
    entry.duration = Math.round(performance.now() - startTime);
    entry.error = err instanceof Error ? err.message : String(err);

    if (import.meta.env.DEV) {
      console.error(`[BG] ${entry.method} ${url} → ERROR:`, entry.error);
    }

    addToNetlog(entry);
    throw err;
  }
}

// Build full URL
function buildUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL || '';
  if (path.startsWith('http')) return path;
  return `${base}${path}`;
}

// HTTP client methods
export const http = {
  async get<T = unknown>(path: string): Promise<T> {
    const response = await loggedFetch(buildUrl(path));
    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`);
    }
    return response.json();
  },

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await loggedFetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `POST ${path} failed: ${response.status}`);
    }
    return response.json();
  },

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await loggedFetch(buildUrl(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `PUT ${path} failed: ${response.status}`);
    }
    return response.json();
  },

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await loggedFetch(buildUrl(path), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `PATCH ${path} failed: ${response.status}`);
    }
    return response.json();
  },

  async delete<T = unknown>(path: string): Promise<T> {
    const response = await loggedFetch(buildUrl(path), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`DELETE ${path} failed: ${response.status}`);
    }
    return response.json();
  },

  // Raw fetch with logging
  fetch: loggedFetch,

  // Get the network log
  getNetlog,
};

// TypeScript global declaration
declare global {
  interface Window {
    __BG_NETLOG__: NetLogEntry[];
    __BG__: {
      netlog: NetLogEntry[];
      dumpStores: () => void;
      dumpAuth: () => Record<string, unknown>;
      dumpQueries: () => void;
      dumpLocalStorage: () => Record<string, string | null>;
    };
  }
}

export type { NetLogEntry as HttpLogEntry };
