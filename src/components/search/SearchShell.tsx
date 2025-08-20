"use client";
import React, { useState, useRef, useEffect } from 'react';
import { streamSearch } from './streamClient';
import { ProfileDrawer } from './ProfileDrawer';
import PersonCard from './PersonCard';
import { AnimatePresence, motion } from 'framer-motion';
import { VirtuosoGrid } from 'react-virtuoso';
import { useReducedMotionPref } from '../../hooks/useReducedMotionPref';
import { useCompare } from '../compare/CompareContext';
import { useGenomeCache } from '../genome/GenomeCacheContext';
import { useLists } from '../shortlists/useLists';
import { ListsPanel } from '../shortlists';
import { useToast } from '../ui/toast';

interface ResultItem {
  ardaId: number;
  username: string;
  name: string;
  professionalHeadline?: string;
  imageUrl?: string | null;
}

type IdentityType = 'person' | 'organization';

export const SearchShell: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); }, []);
  const [query, setQuery] = useState('');
  const [identityType, setIdentityType] = useState<IdentityType>('person');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minComp, setMinComp] = useState<number | ''>('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const reduced = useReducedMotionPref();
  const [limit, setLimit] = useState(40);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { addToList, lists, activeListId, inAnyList, removeFromAll } = useLists() as any;
  const { togglePin, isPinned } = useCompare();
  const { push } = useToast();
  const genome = useGenomeCache();

  function startSearch() {
    if (!query.trim()) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setResults([]);
    setStreaming(true);
  setError('');
    streamSearch({
      query: query.trim(),
      identityType,
      limit,
      location: location.trim() || undefined,
      remoteOnly,
      minCompensation: typeof minComp === 'number' ? minComp : undefined,
      signal: ac.signal,
      onStart: () => setStartedAt(Date.now()),
      onResult: r => {
        setResults(prev => {
          const next = [...prev, r];
          // Prefetch genome for first 6 unique usernames once we have at least 3 results
          const first = next.slice(0, 6).map(x=>x.username);
          genome.prefetch(first);
          return next;
        });
      },
  onError: e => { setError(e.message); },
      onEnd: () => setStreaming(false)
    });
  }

  function stop() { abortRef.current?.abort(); setStreaming(false); }

  function toggleList(username: string, name: string) {
    if (!lists.length || !activeListId) return; // no list to add to
    if (inAnyList(username)) { removeFromAll(username); push({ title: 'Removed', description: username, variant: 'warning' }); }
    else { addToList(activeListId, { username, name }); push({ title: 'Saved', description: username }); }
  }

  if(!mounted) return null; // Avoid server/client markup mismatch until client hydration complete
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium mb-1">Name</label>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') startSearch(); }} placeholder="Type a name..." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Type</label>
          <select value={identityType} onChange={e=>setIdentityType(e.target.value as IdentityType)} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <option value="person">People</option>
            <option value="organization">Orgs</option>
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium mb-1">Location (hint)</label>
          <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. remote, USA" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-xs pt-6">
          <input type="checkbox" className="accent-primary" checked={remoteOnly} onChange={e=>setRemoteOnly(e.target.checked)} /> Remote
        </label>
        <div className="w-32">
          <label className="block text-xs font-medium mb-1">Min Comp ($)</label>
          <input type="number" min={0} value={minComp} onChange={e=>setMinComp(e.target.value===''? '': Number(e.target.value))} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Limit</label>
          <input type="number" min={1} max={200} value={limit} onChange={e=>setLimit(Number(e.target.value)||10)} className="w-24 rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2 pt-5">
          {!streaming && <button onClick={startSearch} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg">Stream</button>}
          {streaming && <button onClick={stop} className="rounded-md bg-error px-4 py-2 text-sm font-medium text-error-light">Stop</button>}
        </div>
  <div className="text-[11px] text-muted-subtle pt-5" aria-live="polite">{results.length} / {limit} results{startedAt && streaming && ' • streaming'}</div>
      </div>
      {error && <div className="text-error text-xs">{error}</div>}
      <div style={{ height: 'calc(100vh - 280px)' }} className="relative">
  <VirtuosoGrid
          data={results}
          overscan={200}
          listClassName="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-start"
          itemContent={(idx, r) => {
            const card = (
              <PersonCard
                id={r.ardaId}
                username={r.username}
                name={r.name}
                headline={r.professionalHeadline}
                imageUrl={r.imageUrl}
                location={(r as any).location}
                onToggleSave={()=>toggleList(r.username, r.name)}
                onOpen={()=>setSelected(r.username)}
                onCompare={()=>{ togglePin({ username: r.username, name: r.name, headline: r.professionalHeadline, imageUrl: r.imageUrl }); push({ title: isPinned(r.username)?'Unpinned':'Pinned', description: r.username }); }}
                skills={[]}
                inList={inAnyList(r.username)}
              />
            );
            if (!reduced && idx < 12) {
              return (
                <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.025 }}>
                  {card}
                </motion.div>
              );
            }
            return card;
          }}
          components={{
            EmptyPlaceholder: () => streaming ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {Array.from({ length: 8 }).map((_,i)=>(
                  <div key={i} className="rounded-xl border border-border/40 bg-surfaceAlt/40 p-4 animate-pulse space-y-3">
                    <div className="h-4 bg-surfaceAlt rounded w-3/4" />
                    <div className="h-3 bg-surfaceAlt rounded w-full" />
                    <div className="h-3 bg-surfaceAlt rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : <div className="text-xs text-muted-subtle">No results</div>
          } as any}
        />
        {streaming && results.length > 0 && results.length < limit && (
          <div className="absolute bottom-2 left-0 right-0 mx-auto flex flex-wrap gap-2 justify-center pointer-events-none">
            {Array.from({ length: Math.min(4, limit - results.length) }).map((_,i)=>(
              <div key={`sk-${i}`} className="h-24 w-40 rounded-xl border border-border/40 bg-surfaceAlt/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
      <ProfileDrawer username={selected} onClose={()=>setSelected(null)} />
  <ListsPanel />
    </div>
  );
};

export default SearchShell;
