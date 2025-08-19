"use client";
// File uses JSX; ensure TSX parsing.
import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';

export interface ListItem { username: string; name: string }
export interface List { id: string; name: string; items: ListItem[] }
export interface ListsDocumentV1 { version: 1; lists: List[]; exportedAt?: string }

const STORAGE_KEY = 'talentRadar:lists';
const ACTIVE_KEY = 'talentRadar:activeList';

function load(): List[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed; // legacy format
  if (parsed && typeof parsed === 'object' && parsed.version === 1 && Array.isArray(parsed.lists)) return parsed.lists as List[];
  return [];
  } catch { return []; }
}

interface ListsContextValue {
  lists: List[];
  activeListId?: string;
  setActiveListId: (id: string | undefined) => void;
  addList: (name: string) => void;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  clearList: (id: string) => void;
  addToList: (id: string, item: ListItem) => void;
  removeFromList: (id: string, username: string) => void;
  removeFromAll: (username: string) => void;
  inAnyList: (username: string) => boolean;
  exportLists: () => string;
  importLists: (json: string, mode?: 'merge' | 'replace') => { ok: boolean; error?: string };
}

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  // Synchronous init to avoid flicker / perceived loss on refresh
  const initialLists = load();
  const [lists, setLists] = useState<List[]>(initialLists.length ? initialLists : [{ id: 'auto-default', name: 'Talent', items: [] }]);
  const [activeListId, setActiveListId] = useState<string | undefined>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_KEY);
      if (stored && initialLists.find(l=>l.id===stored)) return stored;
    } catch {}
    return initialLists[0]?.id || 'auto-default';
  });
  // In case load returned empty AND we created auto-default, persist it.
  useEffect(()=>{
    if (initialLists.length === 0) {
      try { const doc: ListsDocumentV1 = { version: 1, lists }; localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)); } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const doc: ListsDocumentV1 = { version: 1, lists };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {}
    // Ensure active list remains valid
    setActiveListId(prev => {
      if (!prev || !lists.find(l=>l.id===prev)) return lists[0]?.id;
      return prev;
    });
  }, [lists]);

  useEffect(()=>{ if (activeListId) { try { localStorage.setItem(ACTIVE_KEY, activeListId); } catch {} } }, [activeListId]);

  const ensureDefault = useCallback((ls: List[]) => ls, []);

  const addList = useCallback((name: string) => {
    const id = (typeof crypto!=='undefined' && (crypto as any).randomUUID)? (crypto as any).randomUUID(): Math.random().toString(36).slice(2);
    const finalName = name.trim() || 'List';
    setLists(ls => [...ls, { id, name: finalName, items: [] }]);
    setActiveListId(id);
  }, []);

  const renameList = useCallback((id: string, name: string) => {
    setLists(ls => ls.map(l => l.id === id ? { ...l, name } : l));
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists(ls => ensureDefault(ls.filter(l => l.id !== id)));
    setActiveListId(prev => prev === id ? undefined : prev);
  }, [ensureDefault]);

  const clearList = useCallback((id: string) => {
    setLists(ls => ls.map(l => l.id === id ? { ...l, items: [] } : l));
  }, []);

  const addToList = useCallback((id: string, item: ListItem) => {
    setLists(ls => ls.map(l => l.id === id ? ({ ...l, items: l.items.find(i=>i.username===item.username)? l.items : [...l.items, item] }) : l));
  }, []);

  const removeFromAll = useCallback((username: string) => {
    setLists(ls => ls.map(l => ({ ...l, items: l.items.filter(i=>i.username!==username) })));
  }, []);

  const removeFromList = useCallback((id: string, username: string) => {
    setLists(ls => ls.map(l => l.id === id ? { ...l, items: l.items.filter(i=>i.username!==username) } : l));
  }, []);

  const inAnyList = useCallback((username: string) => lists.some(l => l.items.some(i=>i.username===username)), [lists]);

  const exportLists = useCallback(() => {
    const doc: ListsDocumentV1 = { version: 1, lists, exportedAt: new Date().toISOString() };
    return JSON.stringify(doc, null, 2);
  }, [lists]);

  const importLists = useCallback((json: string, mode: 'merge' | 'replace' = 'merge') => {
    try {
      const parsed = JSON.parse(json);
      let imported: any = parsed;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.version === 1) imported = parsed.lists;
      if (!Array.isArray(imported)) throw new Error('Invalid lists JSON');
      const cleaned: List[] = imported.map((l: any) => ({ id: String(l.id || ((typeof crypto!=='undefined' && (crypto as any).randomUUID)? (crypto as any).randomUUID(): Math.random().toString(36).slice(2))), name: String(l.name || 'List'), items: Array.isArray(l.items) ? l.items.filter((i: any)=> i && i.username && i.name).map((i:any)=>({ username: String(i.username), name: String(i.name) })) : [] }));
      setLists(prev => mode === 'replace' ? cleaned : mergeLists(prev, cleaned));
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }, [ensureDefault]);

  function mergeLists(existing: List[], incoming: List[]): List[] {
    const nameSet = new Set(existing.map(l=>l.name.toLowerCase()));
    const merged = [...existing];
    for (const inc of incoming) {
      if (nameSet.has(inc.name.toLowerCase())) {
        // merge items into existing list with same name
        const idx = merged.findIndex(l=>l.name.toLowerCase()===inc.name.toLowerCase());
        if (idx>=0) {
          const existingItems = merged[idx].items;
          const existingUsernames = new Set(existingItems.map(i=>i.username));
            const extra = inc.items.filter(i=>!existingUsernames.has(i.username));
          merged[idx] = { ...merged[idx], items: [...existingItems, ...extra] };
        }
      } else {
        merged.push(inc);
        nameSet.add(inc.name.toLowerCase());
      }
    }
    return merged;
  }

  const value: ListsContextValue = { lists, activeListId, setActiveListId, addList, renameList, deleteList, clearList, addToList, removeFromList, removeFromAll, inAnyList, exportLists, importLists };
  return React.createElement(ListsContext.Provider, { value }, children as any);
}

export function useLists(): ListsContextValue {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error('useLists must be used within ListsProvider');
  return ctx;
}
