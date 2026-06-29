/**
 * Debug Page - Runtime Introspection
 * Route: /__debug (dev-only)
 *
 * Displays:
 * - Current route + params
 * - Auth state summary
 * - localStorage contents
 * - Network log (last 20 requests)
 * - React Query cache summary
 */

import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import type { NetLogEntry } from '@/lib/http';

export default function DebugPage() {
  const location = useLocation();
  const params = useParams();
  const [netlog, setNetlog] = useState<NetLogEntry[]>([]);
  const [localStorage, setLocalStorage] = useState<Record<string, string | null>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data
  useEffect(() => {
    // Get network log
    if (window.__BG_NETLOG__) {
      setNetlog([...window.__BG_NETLOG__].slice(0, 20));
    }

    // Get localStorage
    const storage: Record<string, string | null> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        storage[key] = window.localStorage.getItem(key);
      }
    }
    setLocalStorage(storage);
  }, [refreshKey]);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const authState = {
    memberName: localStorage['memberName'] || null,
    tripMemberId: localStorage['tripMemberId'] || null,
    tripId: localStorage['tripId'] || null,
    vibe: localStorage['boring-golf-vibe'] || 'southeastern-pine',
  };

  return (
    <div style={{
      padding: 20,
      fontFamily: 'monospace',
      fontSize: 13,
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      minHeight: '100vh',
    }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#00ff88', fontSize: 20 }}>
          [BG] Debug Panel
        </h1>
        <div>
          <Link to="/" style={{ color: '#00b4d8', marginRight: 16 }}>← Home</Link>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{
              padding: '4px 12px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Current Route */}
      <Section title="Current Route">
        <Row label="pathname" value={location.pathname} />
        <Row label="search" value={location.search || '(none)'} />
        <Row label="hash" value={location.hash || '(none)'} />
        <Row label="params" value={JSON.stringify(params)} />
      </Section>

      {/* Auth State */}
      <Section title="Auth State">
        <Row label="memberName" value={authState.memberName || '(not set)'} />
        <Row label="tripMemberId" value={authState.tripMemberId || '(not set)'} />
        <Row label="tripId" value={authState.tripId || '(not set)'} />
        <Row label="vibe" value={authState.vibe} />
        <div style={{ marginTop: 8, color: '#888' }}>
          {authState.memberName ? '✓ User identified' : '✗ No user identity'}
        </div>
      </Section>

      {/* localStorage */}
      <Section title="localStorage">
        {Object.keys(localStorage).length === 0 ? (
          <div style={{ color: '#888' }}>(empty)</div>
        ) : (
          Object.entries(localStorage).map(([key, value]) => (
            <Row key={key} label={key} value={truncate(value || '', 60)} />
          ))
        )}
      </Section>

      {/* Network Log */}
      <Section title={`Network Log (${netlog.length} entries)`}>
        {netlog.length === 0 ? (
          <div style={{ color: '#888' }}>No requests logged yet</div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {netlog.map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: 8,
                  marginBottom: 8,
                  backgroundColor: '#252538',
                  borderRadius: 4,
                  borderLeft: `3px solid ${getStatusColor(entry.status)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span style={{ color: getMethodColor(entry.method) }}>{entry.method}</span>
                    {' '}
                    <span style={{ color: '#fff' }}>{entry.url}</span>
                  </span>
                  <span style={{ color: getStatusColor(entry.status) }}>
                    {entry.status || 'pending'} {entry.duration ? `(${entry.duration}ms)` : ''}
                  </span>
                </div>
                {entry.error && (
                  <div style={{ color: '#ff6b6b', marginTop: 4 }}>
                    Error: {entry.error}
                  </div>
                )}
                {entry.responseBody !== null && (
                  <div style={{ color: '#888', marginTop: 4, fontSize: 11 }}>
                    Response: {truncate(String(JSON.stringify(entry.responseBody)), 100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Console Commands */}
      <Section title="Console Commands">
        <div style={{ color: '#888' }}>
          <code style={{ color: '#00ff88' }}>__BG__.netlog</code> - View full network log
          <br />
          <code style={{ color: '#00ff88' }}>__BG__.dumpAuth()</code> - View auth state
          <br />
          <code style={{ color: '#00ff88' }}>__BG__.dumpLocalStorage()</code> - View all localStorage
          <br />
          <code style={{ color: '#00ff88' }}>__BG__.dumpQueries()</code> - View React Query cache
        </div>
      </Section>

      {/* Quick Links */}
      <Section title="Quick Links">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <QuickLink to="/" label="Landing" />
          <QuickLink to="/home" label="Home" />
          <QuickLink to="/my-trips" label="My Trips" />
          <QuickLink to="/create-trip" label="Create Trip" />
          <QuickLink to="/join" label="Join Trip" />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: 14,
        color: '#00b4d8',
        marginBottom: 8,
        borderBottom: '1px solid #333',
        paddingBottom: 4,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', marginBottom: 4 }}>
      <span style={{ color: '#888', minWidth: 140 }}>{label}:</span>
      <span style={{ color: '#fff' }}>{value}</span>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        padding: '4px 12px',
        backgroundColor: '#333',
        color: '#00b4d8',
        borderRadius: 4,
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  );
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

function getStatusColor(status: number | null): string {
  if (status === null) return '#888';
  if (status >= 200 && status < 300) return '#00ff88';
  if (status >= 400) return '#ff6b6b';
  return '#ffcc00';
}

function getMethodColor(method: string): string {
  switch (method) {
    case 'GET': return '#00b4d8';
    case 'POST': return '#00ff88';
    case 'PUT': return '#ffcc00';
    case 'PATCH': return '#ff9f43';
    case 'DELETE': return '#ff6b6b';
    default: return '#888';
  }
}
