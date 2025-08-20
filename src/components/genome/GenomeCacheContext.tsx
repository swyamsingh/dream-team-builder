"use client";
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

export interface GenomeData {
  person?: { name?: string; username?: string; professionalHeadline?: string; location?: any; picture?: string };
  strengths?: { name?: string; proficiency?: string; weight?: number }[];
  education?: { name?: string; fromMonth?: number; fromYear?: number; toYear?: number }[];
  jobs?: { name?: string; organizations?: { name?: string }[]; fromYear?: number; toYear?: number }[];
  languages?: { language?: string; fluency?: string }[];
}

interface GenomeCacheValue {
  get: (username: string) => GenomeData | undefined;
  prefetch: (usernames: string[]) => void;
  put: (username: string, data: GenomeData) => void;
  has: (username: string) => boolean;
}

const GenomeCacheContext = createContext<GenomeCacheValue | null>(null);

export function GenomeCacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<Map<string, GenomeData>>(new Map());
  const inFlight = useRef<Set<string>>(new Set());
  const queue = useRef<string[]>([]);
  const [, force] = useState(0); // for reactive updates if needed
  const CONCURRENCY = 3;

  const drain = useCallback(() => {
    while (inFlight.current.size < CONCURRENCY && queue.current.length) {
      const u = queue.current.shift()!;
      if (inFlight.current.has(u) || cacheRef.current.has(u)) continue;
      inFlight.current.add(u);
      fetch(`/api/profile/${encodeURIComponent(u)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) { cacheRef.current.set(u, data); force(x=>x+1); } })
        .finally(() => { inFlight.current.delete(u); drain(); });
    }
  }, []);

  const prefetch = useCallback((usernames: string[]) => {
    for (const u of usernames) {
      if (!u) continue;
      if (cacheRef.current.has(u) || inFlight.current.has(u) || queue.current.includes(u)) continue;
      queue.current.push(u);
    }
    drain();
  }, [drain]);

  const get = useCallback((u: string) => cacheRef.current.get(u), []);
  const put = useCallback((u: string, d: GenomeData) => { cacheRef.current.set(u, d); force(x=>x+1); }, []);
  const has = useCallback((u: string) => cacheRef.current.has(u), []);

  return (
    <GenomeCacheContext.Provider value={{ get, prefetch, put, has }}>
      {children}
    </GenomeCacheContext.Provider>
  );
}

export function useGenomeCache(): GenomeCacheValue {
  const ctx = useContext(GenomeCacheContext);
  if (!ctx) throw new Error('useGenomeCache must be used within GenomeCacheProvider');
  return ctx;
}
