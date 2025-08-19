// Team selection API removed in Talent Radar refactor. Endpoint deprecated.
export const runtime = 'edge';
export async function POST() {
  return new Response(JSON.stringify({ error: 'deprecated_endpoint' }), { status: 410, headers: { 'content-type': 'application/json' } });
}
