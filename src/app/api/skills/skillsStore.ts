const skillSet = new Set<string>();
const seed = ['javascript','typescript','react','nodejs','leadership','communication','product-management','design','ui-ux','python','data-analysis','project-management','strategy','negotiation','marketing','sales','team-building','problem-solving','innovation'];
seed.forEach(s=>skillSet.add(s));
export function addSkills(skills: string[]) { for (const s of skills) { const k = normalize(s); if (k) skillSet.add(k); } }
export function suggestSkills(q: string, limit=20) {
	const query = normalize(q);
	const all = Array.from(skillSet);
	if (!query) return all.slice(0, limit);
	const res: string[] = [];
	for (let i = 0; i < all.length && res.length < limit; i++) {
		const s = all[i];
		if (s.includes(query)) res.push(s);
	}
	return res;
}
function normalize(s: string){ return s.trim().toLowerCase().replace(/\s+/g,'-'); }
