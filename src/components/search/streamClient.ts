export interface StreamSearchParams {
  query: string;
  identityType: 'person' | 'organization';
  limit?: number;
  location?: string;
  remoteOnly?: boolean;
  minCompensation?: number;
  signal?: AbortSignal;
  onResult: (r: any) => void;
  onEnd?: () => void;
  onError?: (e: Error) => void;
  onStart?: () => void;
}

// Uses existing Next route /api/people with ?stream=true&type=person|organization
export function streamSearch(p: StreamSearchParams) {
  const params = new URLSearchParams({ stream: 'true', q: p.query, type: p.identityType });
  if (p.limit) params.set('limit', String(p.limit));
  if (p.location) params.set('location', p.location);
  if (p.remoteOnly) params.set('remote', 'true');
  if (p.minCompensation) params.set('minComp', String(p.minCompensation));
  const url = `/api/people?${params.toString()}`;
  const es = new EventSource(url);
  let closed = false;
  const close = () => { if (!closed) { es.close(); closed = true; p.onEnd?.(); } };
  p.onStart?.();

  es.onmessage = ev => {
    const data = ev.data?.trim();
    if (!data) return;
    if (data === '[DONE]') { return; }
    if (data === '[LIMIT_REACHED]') { return; }
    try {
      const obj = JSON.parse(data);
      if (obj.error) {
        const msg = obj.message || `${obj.error}${obj.status? ' ('+obj.status+')':''}`;
        p.onError?.(new Error(msg));
        return;
      }
  if (obj.result) p.onResult(obj.result);
    } catch (e:any) { p.onError?.(e); }
  };
  let firstError = true;
  es.onerror = () => {
    if (firstError) {
      firstError = false;
      // Fallback to non-stream fetch once
      fetch(`/api/people?q=${encodeURIComponent(p.query)}&type=${p.identityType}`).then(r=>r.json()).then(data=>{
        if (Array.isArray(data.results)) data.results.forEach((r:any)=>p.onResult(r));
        p.onEnd?.();
      }).catch(e=> p.onError?.(e));
    } else {
      p.onError?.(new Error('stream error'));
    }
    close();
  };
  if (p.signal) {
    if (p.signal.aborted) close(); else p.signal.addEventListener('abort', () => close(), { once: true });
  }
  return () => close();
}
