import { NextRequest } from 'next/server';
import { suggestSkills } from '../../skills/skillsStore';
export async function GET(req: NextRequest) { const { searchParams } = new URL(req.url); const q = searchParams.get('q') || ''; const list = suggestSkills(q,25); return new Response(JSON.stringify({ q, suggestions: list }), { headers: { 'content-type': 'application/json' } }); }
