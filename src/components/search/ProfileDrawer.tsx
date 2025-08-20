"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLists } from '../shortlists/useLists';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useCompare } from '../compare/CompareContext';
import { useGenomeCache } from '../genome/GenomeCacheContext';
import { Radar } from '../visualization/Radar';
import { useToast } from '../ui/toast';

interface GenomeData {
  person?: { name?: string; username?: string; professionalHeadline?: string; location?: any; picture?: string };
  strengths?: { name?: string; proficiency?: string; weight?: number }[];
  education?: { name?: string; fromMonth?: number; fromYear?: number; toYear?: number }[];
  jobs?: { name?: string; organizations?: { name?: string }[]; fromYear?: number; toYear?: number }[];
  languages?: { language?: string; fluency?: string }[];
}

export const ProfileDrawer: React.FC<{ username: string | null; onClose: () => void }> = ({ username, onClose }) => {
  const [data, setData] = useState<GenomeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Include setActiveListId so we don't call the hook again inside event handlers (violates Rules of Hooks)
  const { addToList, inAnyList, removeFromAll, lists, activeListId, setActiveListId } = useLists() as any;
  const { togglePin, isPinned } = useCompare();
  const genomeCache = useGenomeCache();
  const { push } = useToast();

  const panelRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true); setError('');
    const cached = genomeCache.get(username);
    if (cached) {
      setData(cached); setLoading(false); return;
    }
    fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then(r => { if (!r.ok) throw new Error('Profile fetch failed'); return r.json(); })
      .then(j => { setData(j); genomeCache.put(username, j); })
      .catch(e => setError(e.message))
      .finally(()=> setLoading(false));
  }, [username, genomeCache]);

  // Focus trap & ESC close
  useEffect(() => {
    if (!username) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const el = panelRef.current;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab') {
        if (!el) return;
        const focusables = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const list = Array.from(focusables).filter(f=>!f.hasAttribute('disabled'));
        if (list.length===0) return;
        const first = list[0];
        const last = list[list.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prevActive?.focus(); };
  }, [username, onClose]);

  if (!username) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} ref={panelRef} tabIndex={-1} className="relative w-full max-w-md h-full bg-surface border-l border-border p-6 overflow-y-auto space-y-6 outline-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{username}</h2>
            {data?.person?.name && <div className="text-sm text-muted-subtle">{data.person.name}</div>}
          </div>
          <button onClick={onClose} className="text-xs text-muted-subtle hover:text-foreground">Close</button>
        </div>
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-surfaceAlt rounded w-3/5" />
            <div className="h-3 bg-surfaceAlt rounded w-4/5" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_,i)=>(<div key={i} className="h-5 w-20 bg-surfaceAlt rounded" />))}
            </div>
          </div>
        )}
        {error && <div className="text-error text-xs">{error}</div>}
        {data && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              {data.person?.professionalHeadline && <p className="text-sm leading-relaxed flex-1">{data.person.professionalHeadline}</p>}
              <button className={`text-xs px-3 py-1 rounded border transition-colors ${isPinned(username)?'bg-brand-primary/20 border-brand-primary text-brand-primary':'border-border/60 text-muted-subtle hover:text-foreground'}`} onClick={()=>{ togglePin(username!); push({ title: isPinned(username)?'Unpinned':'Pinned', description: username }); }}>{isPinned(username)?'Pinned':'Pin for Compare'}</button>
            </div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6">
                <OverviewSection data={data} />
              </TabsContent>
              <TabsContent value="strengths" className="space-y-6">
                {data.strengths && data.strengths.length>0 && (
                  <div className="pb-4 border-b border-border/40">
                    <h3 className="text-xs font-medium mb-2">Top Strength Radar</h3>
                    <Radar data={data.strengths
                      .filter(s=>typeof s.weight==='number' && s.weight!>0 && s.name)
                      .sort((a,b)=>(b.weight||0)-(a.weight||0))
                      .slice(0,6)
                      .map(s=>({ label: s.name!.slice(0,10), value: s.weight||0 }))} size={220} />
                  </div>
                )}
                <div className="space-y-4">
                  <StrengthsSection strengths={data.strengths || []} />
                </div>
              </TabsContent>
              <TabsContent value="roles">
                <RolesSection jobs={data.jobs || []} />
              </TabsContent>
              <TabsContent value="education">
                <EduSection education={data.education || []} />
              </TabsContent>
              <TabsContent value="languages">
                <LangSection languages={data.languages || []} />
              </TabsContent>
            </Tabs>
            <div className="flex flex-wrap gap-2 pt-2 items-center">
              {!inAnyList(username) && lists.length>0 && (
                <>
                  <select
                    value={activeListId || ''}
                    onChange={e => {
                      setActiveListId(e.target.value || undefined);
                    }}
                    className="rounded border border-border bg-surfaceAlt px-2 py-1 text-[11px]"
                  >
                    {lists.map((l:any)=>(<option key={l.id} value={l.id}>{l.name}</option>))}
                  </select>
                  {activeListId && <button onClick={()=>{ addToList(activeListId,{ username, name: data?.person?.name || username }); push({ title: 'Added to list', description: username }); }} className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg">Add to List</button>}
                </>
              )}
              {inAnyList(username) && <button onClick={()=>{ removeFromAll(username); push({ title: 'Removed from lists', description: username, variant: 'warning' }); }} className="rounded bg-error px-3 py-1.5 text-xs font-medium text-error-light">Remove</button>}
            </div>
          </div>
        )}
  </motion.div>
    </div>
  );
};

// ===== Sub Sections =====
const proficiencyColor = (p?: string) => {
  const key = (p||'').toLowerCase();
  if (key.includes('master') || key.includes('expert')) return 'bg-brand-primary/20 text-brand-primary border-brand-primary/40';
  if (key.includes('proficient') || key.includes('advanced')) return 'bg-success/20 text-success border-success/40';
  if (key.includes('intermediate')) return 'bg-warning/20 text-warning border-warning/40';
  return 'bg-surfaceAlt text-muted-subtle border-border/50';
};

const StrengthsSection: React.FC<{ strengths: { name?: string; proficiency?: string; weight?: number }[] }> = ({ strengths }) => {
  if (!strengths.length) return <div className="text-[11px] text-muted-subtle">None</div>;
  const maxWeight = Math.max(...strengths.map(s=>s.weight||0), 1);
  return (
    <div className="flex flex-col gap-2">
      {strengths.slice(0,60).map((s,i)=>{
        const pct = (s.weight||0)/maxWeight;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded border text-[10px] capitalize ${proficiencyColor(s.proficiency)}`}>{s.name}<span className="ml-1 opacity-60">{s.proficiency?.toLowerCase()}</span></span>
            <div className="flex-1 h-2 rounded bg-surfaceAlt/60 overflow-hidden flex">
              <div className="h-full bg-brand-primary/70 transition-[width] duration-700 ease-out" style={{ width: `${pct*100}%` }} />
              {pct < 1 && <div className="h-full flex-1 bg-transparent" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RolesSection: React.FC<{ jobs: { name?: string; organizations?: { name?: string }[]; fromYear?: number; toYear?: number }[] }> = ({ jobs }) => {
  if (!jobs.length) return <div className="text-[11px] text-muted-subtle">—</div>;
  return (
    <ul className="space-y-2">
      {jobs.slice(0,12).map((j,i)=>(
        <li key={i} className="relative pl-4 text-[11px] text-muted-subtle">
          <span className="absolute left-0 top-1 h-2 w-2 rounded-full bg-brand-primary" />
          <span className="text-foreground/80">{j.name||'Role'}</span>{j.organizations?.[0]?.name && <> @ {j.organizations[0].name}</>} {j.fromYear && <span className="opacity-60">({j.fromYear}{j.toYear?`–${j.toYear}`:''})</span>}
        </li>
      ))}
    </ul>
  );
};

const EduSection: React.FC<{ education: { name?: string; fromYear?: number; toYear?: number }[] }> = ({ education }) => {
  if (!education.length) return <div className="text-[11px] text-muted-subtle">—</div>;
  return (
    <ul className="space-y-1 text-[11px]">
      {education.slice(0,10).map((e,i)=>(<li key={i} className="text-muted-subtle"><span className="text-foreground/80">{e.name||'Program'}</span> {e.fromYear && <span className="opacity-60">({e.fromYear}{e.toYear?`–${e.toYear}`:''})</span>}</li>))}
    </ul>
  );
};

const LangSection: React.FC<{ languages: { language?: string; fluency?: string }[] }> = ({ languages }) => {
  if (!languages.length) return <div className="text-[11px] text-muted-subtle">—</div>;
  return (
    <div className="flex flex-wrap gap-1 text-[11px]">{languages.slice(0,16).map((l,i)=>(<span key={i} className="rounded bg-surfaceAlt border border-border/60 px-2 py-0.5">{l.language}<span className="ml-1 opacity-60">{l.fluency?.toLowerCase()}</span></span>))}</div>
  );
};

// ===== Overview Redesigned =====
const OverviewSection: React.FC<{ data: any }> = ({ data }) => {
  const loc = data.person?.location;
  const locationStr = loc?.name || [loc?.city, loc?.region, loc?.country].filter(Boolean).join(', ') || '—';
  const strengths = (data.strengths||[]).slice(0,6).sort((a:any,b:any)=>(b.weight||0)-(a.weight||0));
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-lg bg-surfaceAlt border border-border/60 flex items-center justify-center text-sm font-medium overflow-hidden">
          {data.person?.picture ? (<img src={data.person.picture} alt={data.person?.name||''} className="h-full w-full object-cover" />): (data.person?.name||data.person?.username||'?').slice(0,2).toUpperCase() }
        </div>
        <div className="flex-1 space-y-2">
          {data.person?.professionalHeadline && <p className="text-sm leading-relaxed text-foreground/90">{data.person.professionalHeadline}</p>}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-md bg-surfaceAlt border border-border/60">{locationStr}</span>
            <span className="px-2 py-1 rounded-md bg-surfaceAlt border border-border/60">@{data.person?.username}</span>
            {data.jobs?.length>0 && <span className="px-2 py-1 rounded-md bg-surfaceAlt border border-border/60">Roles: {data.jobs.length}</span>}
            {data.education?.length>0 && <span className="px-2 py-1 rounded-md bg-surfaceAlt border border-border/60">Education: {data.education.length}</span>}
            {data.languages?.length>0 && <span className="px-2 py-1 rounded-md bg-surfaceAlt border border-border/60">Languages: {data.languages.length}</span>}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-medium tracking-wide text-muted">Top Strengths</h3>
        {strengths.length ? (
          <div className="flex flex-wrap gap-2">
            {strengths.map((s:any,i:number)=> (
              <span key={i} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded border border-border/60 bg-surfaceAlt">
                {s.name}
                {s.weight && <span className="text-[9px] opacity-60">{Math.round(s.weight)}</span>}
              </span>
            ))}
          </div>
        ) : <div className="text-[11px] text-muted-subtle">No strengths data.</div>}
      </div>
      <div className="grid grid-cols-2 gap-4 text-[11px]">
        <div className="space-y-2">
          <h4 className="font-medium text-[11px] text-muted">Recent Roles</h4>
          <ul className="space-y-1">
            {(data.jobs||[]).slice(0,4).map((j:any,i:number)=>(
              <li key={i} className="truncate text-muted-subtle"><span className="text-foreground/80">{j.name||'Role'}</span>{j.organizations?.[0]?.name && <> @ {j.organizations[0].name}</>} {j.fromYear && <span className="opacity-60">({j.fromYear}{j.toYear?`–${j.toYear}`:''})</span>}</li>
            ))}
            {!(data.jobs||[]).length && <li className="text-muted-subtle">—</li>}
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-[11px] text-muted">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {(data.languages||[]).slice(0,6).map((l:any,i:number)=>(<span key={i} className="px-2 py-0.5 rounded bg-surfaceAlt border border-border/60">{l.language}<span className="ml-1 opacity-60">{l.fluency?.toLowerCase()}</span></span>))}
            {!(data.languages||[]).length && <span className="text-muted-subtle">—</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
