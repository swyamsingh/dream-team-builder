// People search proxy to Torre API.
// Runtime: edge-compatible (no Node-specific APIs used)
export const runtime = 'edge';
// Supports two modes:
//  1) Aggregate JSON (default) -> { results: [...] }
//  2) Streaming NDJSON (?stream=true) -> each line: { result: { ...person } }

interface TorreEntityRaw {
  ardaId: number;
  name: string;
  username: string;
  professionalHeadline?: string;
  imageUrl?: string | null;
  [k: string]: any;
}

function sanitizeQuery(q: string | null): string { return (q || '').trim().slice(0, 80); }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = sanitizeQuery(searchParams.get('q'));
  if (!q) {
    return json({ results: [] });
  }
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 25) : 10;
  const stream = searchParams.get('stream') === 'true';
  const identityType = (searchParams.get('type') || 'person').toLowerCase() === 'organization' ? 'organization' : 'person';
  const location = sanitizeQuery(searchParams.get('location')) || undefined;
  const remoteOnly = searchParams.get('remote') === 'true';
  const minComp = parseInt(searchParams.get('minComp') || '', 10);
  const minCompensation = Number.isFinite(minComp) && minComp > 0 ? minComp : undefined;

  // Allow override (build-time) else fallback to known working domain.
  const BASE = (process.env.TORRE_BASE || 'https://arda.torre.co').replace(/\/$/, '');
  const filters: Record<string, any> = {};
  if (location) filters.location = location;
  if (remoteOnly) filters.remote = true;
  if (minCompensation) filters.compensationMin = minCompensation;

  if (!stream) {
    // Non streaming simple fetch
    const up = await fetch(`${BASE}/entities/_search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json', 'user-agent': 'talent-radar-demo/1.0' },
  body: JSON.stringify({ query: q, identityType, limit, ...(Object.keys(filters).length? { filters }: {}) })
    });
    if (!up.ok) {
      const bodyText = await safeText(up);
      return json({ error: 'upstream_error', status: up.status, body: bodyText.slice(0,400) }, 502);
    }
    const data = await up.json();
    return json(data);
  }

  // Streaming mode (Server-Sent Events)
  let up: Response;
  try {
    up = await fetch(`${BASE}/entities/_searchStream`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'text/event-stream, application/json', 'user-agent': 'talent-radar-demo/1.0' },
      body: JSON.stringify({ query: q, identityType, limit, ...(Object.keys(filters).length? { filters }: {}) })
    });
  } catch (e:any) {
    // Return an SSE stream with a single error event so client can surface a friendly message
  const errStream = new ReadableStream({ start(controller) { controller.enqueue(encodeSSE(JSON.stringify({ error: 'network_failure', message: e?.message || 'fetch failed' }))); controller.enqueue(encodeSSE('[DONE]')); controller.close(); } });
    return new Response(errStream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });
  }
  if (!up.ok || !up.body) {
  const status = up.status;
  let bodyText = '';
  try { bodyText = (await up.text()).slice(0,400); } catch {}
  const errStream = new ReadableStream({ start(controller) { controller.enqueue(encodeSSE(JSON.stringify({ error: 'upstream_error', status, body: bodyText, message: `upstream_error (status ${status})` }))); controller.enqueue(encodeSSE('[DONE]')); controller.close(); } });
    return new Response(errStream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });
  }
  const reader = up.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sent = 0;
  const out = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        buffer = buffer.trim();
        if (buffer) processChunk(buffer, controller);
        controller.enqueue(encodeSSE('[DONE]'));
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      buffer = processChunk(buffer, controller);
      if (sent >= limit) {
        controller.enqueue(encodeSSE('[LIMIT_REACHED]'));
        controller.close();
        reader.cancel();
      }
    }
  });

  function processChunk(chunk: string, controller: ReadableStreamDefaultController) {
    const normalized = chunk.replace(/}\s*{/g, '}\n{');
    const lines = normalized.split(/\n+/);
    let remainder = lines.pop() || '';
    for (const l of lines) {
      if (sent >= limit) break;
      const line = l.trim();
      if (!line) continue;
      try {
        const raw: TorreEntityRaw = JSON.parse(line);
  const mapped = mapEntity(raw);
  controller.enqueue(encodeSSE(JSON.stringify({ result: mapped })));
        sent++;
      } catch {
        remainder += line;
      }
    }
    return remainder;
  }

  function mapEntity(e: TorreEntityRaw) {
    return {
      ardaId: e.ardaId,
      name: e.name,
      username: e.username,
      professionalHeadline: e.professionalHeadline,
      imageUrl: e.imageUrl
    };
  }

  return new Response(out, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

async function safeText(r: Response) { try { return await r.text(); } catch { return ''; } }

function encodeNDJSON(obj: any) { return new TextEncoder().encode(JSON.stringify(obj) + '\n'); }
function encodeSSE(data: string) { return new TextEncoder().encode(`data: ${data}\n\n`); }
