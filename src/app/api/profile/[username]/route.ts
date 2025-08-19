import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;
  if (!username) return json({ error: 'missing username' }, 400);
  try {
    const r = await fetch(`https://torre.ai/api/genome/bios/${encodeURIComponent(username)}`);
    if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
    const data = await r.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' } });
  } catch (e: any) {
    return json({ error: 'fetch-failed', message: e.message }, 500);
  }
}

function json(obj: any, status=200) { return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } }); }
