"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

interface CompareMeta { username: string; name?: string; headline?: string; imageUrl?: string | null }

interface CompareContextValue {
  pinned: string[]; // usernames
  togglePin: (input: string | CompareMeta) => void; // backwards compatible
  isPinned: (username: string) => boolean;
  clearPins: () => void;
  metaFor: (username: string) => CompareMeta | undefined;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<string[]>([]);
  const [meta, setMeta] = useState<Record<string, CompareMeta>>({});

  const togglePin = useCallback((input: string | CompareMeta) => {
    const u = typeof input === 'string' ? input : input.username;
    setPinned(prev => {
      if (prev.includes(u)) {
        const next = prev.filter(x=>x!==u);
        return next;
      }
      if (prev.length >= 3) return prev; // enforce max 3
      return [...prev, u];
    });
    // store meta if provided
    if (typeof input !== 'string') {
      setMeta(m => ({ ...m, [u]: input }));
    }
  }, []);

  const isPinned = useCallback((u: string) => pinned.includes(u), [pinned]);
  const clearPins = useCallback(()=> { setPinned([]); /* keep meta for potential re-pin */ }, []);
  const metaFor = useCallback((u: string) => meta[u], [meta]);
  return <CompareContext.Provider value={{ pinned, togglePin, isPinned, clearPins, metaFor }}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
