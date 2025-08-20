"use client";
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from './CompareContext';
import { useGenomeCache } from '../genome/GenomeCacheContext';
import { Button } from '../ui/button';
// Dynamic import inside export function to avoid SSR/type resolution issues and heavy initial bundle size

interface Strength { name?: string; proficiency?: string; weight?: number }

export const ComparePanel: React.FC = () => {
  const { pinned, togglePin, clearPins, metaFor } = useCompare();
  const genome = useGenomeCache();
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<'all'|'shared'|'unique'>('all');
  const [sortMode, setSortMode] = useState<'alpha'|'shared-desc'>('shared-desc');

  const profiles = pinned.map(u => ({ username: u, meta: metaFor(u), data: genome.get(u) }));

  const allStrengths = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of profiles) {
      const strengths = p.data?.strengths || [];
      for (const s of strengths) {
        if (!s.name) continue; const key = s.name.toLowerCase();
        map.set(key, (map.get(key)||0)+1);
      }
    }
    return map; // key -> count occurrences
  }, [profiles]);

  // Export feature removed per request

  if (pinned.length === 0) return null;
  const sharedCountMap = allStrengths;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur border-t border-border shadow-elevation2">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3" id="compare-panel-export">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-sm">Compare ({pinned.length})</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-success/15 border border-success/30 text-success">Shared</span>
                <span className="px-1.5 py-0.5 rounded bg-warning/15 border border-warning/30 text-warning">Unique</span>
              </div>
              <span className="text-muted-subtle text-[10px] hidden sm:inline">Shared Strengths: {Array.from(sharedCountMap.values()).filter(c=>c>1).length}</span>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <select aria-label="Filter strengths" value={filter} onChange={e=>setFilter(e.target.value as any)} className="text-[10px] rounded bg-surfaceAlt border border-border px-2 py-1">
                <option value="all">All</option>
                <option value="shared">Shared</option>
                <option value="unique">Unique</option>
              </select>
              <select aria-label="Sort strengths" value={sortMode} onChange={e=>setSortMode(e.target.value as any)} className="text-[10px] rounded bg-surfaceAlt border border-border px-2 py-1">
                <option value="shared-desc">Shared ↓</option>
                <option value="alpha">A → Z</option>
              </select>
              <Button size="sm" variant="ghost" onClick={()=>setExpanded(e=>!e)}>{expanded? 'Collapse':'Expand'}</Button>
              <Button size="sm" variant="ghost" onClick={clearPins}>Clear</Button>
            </div>
          </div>
        <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${profiles.length}, minmax(280px,1fr))` }}>
            {profiles.map(p => {
              const d = p.data;
              const person = d?.person;
              const meta = p.meta;
              const displayName = meta?.name || person?.name || p.username;
              const headline = meta?.headline || person?.professionalHeadline || '—';
              const avatar = meta?.imageUrl || person?.picture;
              const initials = (displayName||p.username).split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
              return (
                <div key={p.username} className="relative rounded-lg border border-border/60 bg-surfaceAlt/60 backdrop-blur p-4 flex flex-col">
                  <button aria-label="Unpin" className="absolute top-2 right-2 text-[10px] text-muted-subtle hover:text-error" onClick={()=>togglePin(p.username)}>✕</button>
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border/40">
                    <div className="h-11 w-11 rounded-md overflow-hidden bg-brand-primary/15 flex items-center justify-center text-brand-primary text-xs font-semibold ring-1 ring-brand-primary/20">
                      {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium leading-tight truncate" title={displayName}>{displayName}</div>
                      <div className="text-[10px] text-muted-subtle line-clamp-2 max-w-[200px]" title={headline}>{headline}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold mb-1 tracking-wide">Strengths</div>
                  {d ? (
                    <StrengthList strengths={d.strengths||[]} occurrenceMap={allStrengths} totalProfiles={profiles.length} filter={filter} sortMode={sortMode} />
                  ) : (
                    <div className="text-[10px] text-muted-subtle">Loading…</div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StrengthList: React.FC<{ strengths: Strength[]; occurrenceMap: Map<string, number>; totalProfiles: number; filter: 'all'|'shared'|'unique'; sortMode: 'alpha'|'shared-desc' }> = ({ strengths, occurrenceMap, totalProfiles, filter, sortMode }) => {
  let list = strengths.slice(0, 80); // increase slice due to filtering
  list = list.filter(s=>s.name);
  if (filter !== 'all') {
    list = list.filter(s=>{
      const key = s.name!.toLowerCase();
      const count = occurrenceMap.get(key)||0;
      if (filter === 'shared') return count > 1;
      if (filter === 'unique') return count === 1 && totalProfiles > 1;
      return true;
    });
  }
  if (sortMode === 'shared-desc') {
    list = list.slice().sort((a,b)=>{
      const ca = occurrenceMap.get(a.name!.toLowerCase())||0;
      const cb = occurrenceMap.get(b.name!.toLowerCase())||0;
      if (cb !== ca) return cb - ca;
      return a.name!.localeCompare(b.name!);
    });
  } else if (sortMode === 'alpha') {
    list = list.slice().sort((a,b)=>a.name!.localeCompare(b.name!));
  }
  const top = list.slice(0, 40);
  return (
    <ul className="space-y-1 max-h-56 overflow-auto pr-1 custom-scrollbar">
      {top.map((s,i)=>{
        if (!s.name) return null;
        const key = s.name.toLowerCase();
        const count = occurrenceMap.get(key)||0;
        const shared = count > 1;
        const unique = count === 1 && totalProfiles > 1;
        return (
          <li key={i} className={`group flex items-center gap-2 text-[10px] rounded-md px-2 py-1 border leading-snug ${shared? 'bg-success/15 border-success/40 text-success':''} ${unique? 'bg-warning/15 border-warning/40 text-warning':''}`} title={`${s.name}${s.proficiency? ' • '+s.proficiency:''}`}> 
            <span className="truncate flex-1" style={{ maxWidth: 150 }}>{s.name}</span>
            <span className="opacity-60 text-[9px] tabular-nums">{s.proficiency?.[0] || ''}</span>
          </li>
        );
      })}
      {!top.length && <li className="text-[10px] text-muted-subtle">—</li>}
    </ul>
  );
};

export default ComparePanel;