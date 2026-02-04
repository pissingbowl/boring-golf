/**
 * Global Debug Object
 * Exposes window.__BG__ for console access in dev mode
 *
 * Usage in browser console:
 *   __BG__.netlog          // View network log
 *   __BG__.dumpAuth()      // View auth state
 *   __BG__.dumpLocalStorage() // View localStorage
 *   __BG__.dumpQueries()   // View React Query cache
 */

import type { NetLogEntry } from './http';

// Initialize only in dev mode
export function initGlobalDebug(queryClient?: { getQueryCache?: () => unknown }): void {
  if (typeof window === 'undefined') return;
  if (!import.meta.env.DEV) return;

  // Ensure netlog exists
  if (!window.__BG_NETLOG__) {
    window.__BG_NETLOG__ = [];
  }

  window.__BG__ = {
    // Network log
    get netlog(): NetLogEntry[] {
      return window.__BG_NETLOG__ || [];
    },

    // Dump all stores (placeholder for zustand/redux)
    dumpStores(): void {
      console.log('[BG] No external stores detected (using React state)');
      console.log('[BG] Use React DevTools to inspect component state');
    },

    // Dump auth state from localStorage
    dumpAuth(): Record<string, unknown> {
      const auth = {
        memberName: localStorage.getItem('memberName'),
        tripMemberId: localStorage.getItem('tripMemberId'),
        tripId: localStorage.getItem('tripId'),
        vibe: localStorage.getItem('boring-golf-vibe'),
      };
      console.log('[BG] Auth State:', auth);
      return auth;
    },

    // Dump React Query cache
    dumpQueries(): void {
      if (queryClient?.getQueryCache) {
        const cache = queryClient.getQueryCache();
        console.log('[BG] React Query Cache:', cache);
      } else {
        console.log('[BG] React Query client not available');
        console.log('[BG] Note: Most pages use direct fetch, not React Query');
      }
    },

    // Dump all localStorage
    dumpLocalStorage(): Record<string, string | null> {
      const result: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          result[key] = localStorage.getItem(key);
        }
      }
      console.log('[BG] localStorage:', result);
      return result;
    },
  };

  console.log('[BG] Debug object initialized. Try: __BG__.dumpAuth()');
}

// Export type for window augmentation
export type DebugObject = typeof window.__BG__;
