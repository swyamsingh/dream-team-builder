"use client";
import React, { useState, useRef, useEffect } from 'react';
import { streamSearch } from './streamClient';
import { ProfileDrawer } from './ProfileDrawer';
import { useLists } from '../shortlists/useLists';
import { ListsPanel } from '../shortlists';

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
  const [limit, setLimit] = useState(40);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { addToList, lists, activeListId, inAnyList, removeFromAll } = useLists() as any;

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
      onResult: r => setResults(prev => [...prev, r]),
  onError: e => { setError(e.message); },
      onEnd: () => setStreaming(false)
    });
  }

  function stop() { abortRef.current?.abort(); setStreaming(false); }

  function toggleList(username: string, name: string) {
    if (!lists.length || !activeListId) return; // no list to add to
    if (inAnyList(username)) removeFromAll(username); else addToList(activeListId, { username, name });
  }

  if(!mounted) return null; // Avoid server/client markup mismatch until client hydration complete
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium mb-1">Query</label>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') startSearch(); }} placeholder="Search people or orgs" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
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
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map(r => (
          <div key={r.ardaId} className="group rounded-xl border border-border/60 bg-gradient-to-b from-surfaceAlt/80 to-surface/40 p-4 flex flex-col gap-2 cursor-pointer hover:border-primary/60 hover:shadow-elevation2 transition-all" onClick={()=>setSelected(r.username)}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium leading-tight line-clamp-2 tracking-tight flex-1">{r.name}</div>
              {lists.length>0 && (
                <div className="flex gap-1">
                  <button title={inAnyList(r.username)?'Remove from lists':'Add to active list'} onClick={(e)=>{ e.stopPropagation(); toggleList(r.username, r.name); }} disabled={!activeListId} className={`h-6 w-6 flex items-center justify-center rounded border text-[11px] transition-colors ${inAnyList(r.username)?'bg-success/20 border-success text-success hover:bg-success/30':'bg-surface border-border/60 text-muted hover:text-foreground hover:border-primary/50'} ${!activeListId? 'opacity-40 cursor-not-allowed':''}`}>{inAnyList(r.username)?'−':'+'}</button>
                  <button onClick={(e)=>{ e.stopPropagation(); toggleList(r.username, r.name); }} disabled={!activeListId} className={`text-[10px] rounded px-2 py-0.5 border transition-colors hidden md:inline-block ${inAnyList(r.username)?'bg-success/20 border-success text-success':'bg-surface border-border/60 text-muted hover:text-foreground'} ${!activeListId? 'opacity-40 cursor-not-allowed':''}`}>{inAnyList(r.username)?'Saved':'Save'}</button>
                </div>
              )}
            </div>
            <div className="text-[11px] text-muted-subtle line-clamp-2 min-h-[30px]">{r.professionalHeadline || '—'}</div>
          </div>
        ))}
        {streaming && (
          results.length === 0 ? (
            <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_,i)=>(
                <div key={i} className="rounded-xl border border-border/40 bg-surfaceAlt/40 p-4 animate-pulse space-y-3">
                  <div className="h-4 bg-surfaceAlt rounded w-3/4" />
                  <div className="h-3 bg-surfaceAlt rounded w-full" />
                  <div className="h-3 bg-surfaceAlt rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : results.length < limit ? (
            Array.from({ length: Math.min(8, limit - results.length) }).map((_,i)=>(
              <div key={`sk-${i}`} className="rounded-xl border border-border/40 bg-surfaceAlt/30 p-4 animate-pulse space-y-3">
                <div className="h-4 bg-surfaceAlt rounded w-2/3" />
                <div className="h-3 bg-surfaceAlt rounded w-5/6" />
                <div className="h-3 bg-surfaceAlt rounded w-4/5" />
              </div>
            ))
          ) : null
        )}
      </div>
      <ProfileDrawer username={selected} onClose={()=>setSelected(null)} />
  <ListsPanel />
    </div>
  );
};

export default SearchShell;
