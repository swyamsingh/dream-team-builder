"use client";
import React, { useState, useRef } from 'react';
import { useLists } from './useLists';

export const ListsPanel: React.FC = () => {
  const { lists, activeListId, setActiveListId, addList, renameList, deleteList, clearList, removeFromList, exportLists, importLists } = useLists();
  const [newName, setNewName] = useState('');
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement|null>(null);

  function createList() {
    if (!newName.trim()) return;
    addList(newName.trim());
    setNewName('');
  }

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  function triggerImport() { fileRef.current?.click(); }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return; const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
  const res = importLists(text, importMode);
      if (!res.ok) setImportError(res.error || 'Import failed'); else setImportError('');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function download() {
  const blob = new Blob([exportLists()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:]/g,'-').split('.')[0];
  a.href = url; a.download = `talent-radar-lists-${stamp}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="lists" className="pt-10 border-t border-border/60 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold">Lists</h2>
        <div className="flex gap-2 text-xs items-center">
          <button onClick={download} className="rounded bg-surfaceAlt px-3 py-1.5 border border-border/60 hover:border-primary/50">Export</button>
          <button onClick={triggerImport} className="rounded bg-surfaceAlt px-3 py-1.5 border border-border/60 hover:border-primary/50">Import</button>
          <select value={importMode} onChange={e=>setImportMode(e.target.value as any)} className="rounded bg-surfaceAlt px-2 py-1 border border-border/60 text-[11px]">
            <option value="merge">Merge</option>
            <option value="replace">Replace</option>
          </select>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
        </div>
      </div>
      {importError && <div className="text-error text-[11px]">{importError}</div>}
      <div className="flex gap-2 text-xs">
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New list name" className="flex-1 rounded-md border border-border bg-surface px-3 py-2" />
        <button onClick={createList} className="rounded bg-primary px-4 py-2 font-medium text-primary-fg disabled:opacity-50" disabled={!newName.trim()}>Add</button>
      </div>
      <ul className="space-y-4 text-xs">
        {lists.map(l => {
          const active = l.id === activeListId;
          return (
            <li key={l.id} className={`rounded-lg border p-4 space-y-3 ${active? 'border-primary/70 bg-surfaceAlt/60':'border-border/60 bg-surfaceAlt/30'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <button onClick={()=>setActiveListId(l.id)} className={`h-3 w-3 rounded-full border ${active? 'bg-primary border-primary':'border-border/60 hover:border-primary/60'}`} aria-label={active? 'Active list':''} />
                  <input value={l.name} onChange={e=>renameList(l.id, e.target.value)} className="bg-transparent text-sm font-medium flex-1 outline-none" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border/50 text-muted-subtle">{l.items.length}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>clearList(l.id)} className="px-2 py-1 rounded bg-surface border border-border/60 hover:border-warning/60">Clear</button>
                  <button onClick={()=>deleteList(l.id)} className="px-2 py-1 rounded bg-error text-error-light border border-error/30 hover:border-error">Del</button>
                </div>
              </div>
              {l.items.length === 0 && <div className="text-muted-subtle text-[11px]">No items</div>}
              {l.items.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {l.items.map(it => (
                    <span key={it.username} className="group inline-flex items-center gap-1 rounded bg-surface px-2 py-1 border border-border/60 text-[11px] hover:border-primary/50">
                      {it.name}
                      <button onClick={()=>removeFromList(l.id, it.username)} className="text-muted-subtle group-hover:text-error" aria-label="Remove">×</button>
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
