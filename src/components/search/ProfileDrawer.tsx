"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useLists } from '../shortlists/useLists';

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

  const panelRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true); setError(''); setData(null);
    fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then(r => { if (!r.ok) throw new Error('Profile fetch failed'); return r.json(); })
      .then(j => setData(j))
      .catch(e => setError(e.message))
      .finally(()=> setLoading(false));
  }, [username]);

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
      <div ref={panelRef} tabIndex={-1} className="relative w-full max-w-md h-full bg-surface border-l border-border p-6 overflow-y-auto space-y-6 outline-none">
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
            {data.person?.professionalHeadline && <p className="text-sm leading-relaxed">{data.person.professionalHeadline}</p>}
            <section>
              <h3 className="text-xs font-semibold mb-1 uppercase tracking-wide">Strengths</h3>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {data.strengths?.slice(0, 40).map((s,i)=>(<span key={i} className="rounded bg-surfaceAlt border border-border/60 px-2 py-0.5 capitalize">{s.name}<span className="opacity-60 ml-1 text-[10px]">{s.proficiency?.toLowerCase()}</span></span>))}
                {!data.strengths?.length && <span className="text-muted-subtle text-[11px]">None</span>}
              </div>
            </section>
            <section>
              <h3 className="text-xs font-semibold mb-1 uppercase tracking-wide mt-4">Recent Roles</h3>
              <ul className="space-y-1 text-[11px]">
                {data.jobs?.slice(0,5).map((j,i)=>(<li key={i} className="text-muted-subtle"><span className="text-foreground/80">{j.name || 'Role'}</span>{j.organizations?.[0]?.name && <> @ {j.organizations[0].name}</>} {j.fromYear && <span className="opacity-60">({j.fromYear}{j.toYear?`–${j.toYear}`:''})</span>}</li>))}
                {!data.jobs?.length && <li className="text-muted-subtle">—</li>}
              </ul>
            </section>
            <section>
              <h3 className="text-xs font-semibold mb-1 uppercase tracking-wide mt-4">Education</h3>
              <ul className="space-y-1 text-[11px]">
                {data.education?.slice(0,4).map((e,i)=>(<li key={i} className="text-muted-subtle"><span className="text-foreground/80">{e.name || 'Program'}</span> {e.fromYear && <span className="opacity-60">({e.fromYear}{e.toYear?`–${e.toYear}`:''})</span>}</li>))}
                {!data.education?.length && <li className="text-muted-subtle">—</li>}
              </ul>
            </section>
            <section>
              <h3 className="text-xs font-semibold mb-1 uppercase tracking-wide mt-4">Languages</h3>
              <div className="flex flex-wrap gap-1 text-[11px]">{data.languages?.length ? data.languages.slice(0,8).map((l,i)=>(<span key={i} className="rounded bg-surfaceAlt border border-border/60 px-2 py-0.5">{l.language}<span className="ml-1 opacity-60">{l.fluency?.toLowerCase()}</span></span>)) : <span className="text-muted-subtle">—</span>}</div>
            </section>
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
                  {activeListId && <button onClick={()=>addToList(activeListId,{ username, name: data?.person?.name || username })} className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg">Add to List</button>}
                </>
              )}
              {inAnyList(username) && <button onClick={()=>removeFromAll(username)} className="rounded bg-error px-3 py-1.5 text-xs font-medium text-error-light">Remove</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
