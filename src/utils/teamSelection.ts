/**
 * Greedy team selection to maximize required skill coverage.
 *
 * Inputs:
 *  - candidates: array of candidate usernames (Torre usernames) or objects with pre-fetched strengths
 *  - requiredSkills: list of skill names (case-insensitive) we want covered at least once
 *  - teamSize: maximum number of members to pick
 *  - options: { concurrency, fetchGenome }
 *
 * Output:
 *  {
 *    team: [ { username, name, skillsUsed: [...], contributionScore } ],
 *    coverage: {
 *       requiredSkillCount,
 *       coveredSkills: [ { skill, proficiency, weight, by: username } ],
 *       uncoveredSkills: string[],
 *       coverageRatio,
 *       totalContributionScore
 *    }
 *  }
 */

export interface RequiredSkillCoverageEntry {
  skill: string;
  proficiency: string;
  weight: number;
  by: string; // username
}

export interface SelectedMember {
  username: string;
  name: string;
  skillsUsed: RequiredSkillCoverageEntry[];
  contributionScore: number;
}

export interface TeamSelectionResult {
  team: SelectedMember[];
  coverage: {
    requiredSkillCount: number;
    coveredSkills: RequiredSkillCoverageEntry[];
    uncoveredSkills: string[];
    coverageRatio: number; // covered / required
    totalContributionScore: number;
  };
}

interface GenomeStrength {
  name: string;
  proficiency?: string; // textual proficiency label
  weight?: number; // numeric weight (optional)
}

interface GenomeResponse {
  person?: { name?: string; username?: string };
  strengths?: GenomeStrength[];
}

export interface CandidateInput {
  username: string;
  genome?: GenomeResponse; // allow pre-fetched
}

export interface TeamSelectionOptions {
  concurrency?: number; // parallel fetches
  fetchGenome?: (username: string) => Promise<GenomeResponse>;
  proficiencyWeights?: Record<string, number>; // override mapping
  signal?: AbortSignal;
}

const DEFAULT_PROFICIENCY_WEIGHTS: Record<string, number> = {
  novice: 1,
  beginner: 1,
  basic: 1,
  intermediate: 2,
  proficient: 3,
  advanced: 4,
  expert: 5,
  master: 6,
};

const GENOME_CACHE = new Map<string, { ts: number; data: GenomeResponse }>();
const GENOME_TTL_MS = 10 * 60 * 1000; // 10 minutes
async function defaultFetchGenome(username: string): Promise<GenomeResponse> {
  const now = Date.now();
  const cached = GENOME_CACHE.get(username);
  if (cached && now - cached.ts < GENOME_TTL_MS) return cached.data;
  const r = await fetch(`https://torre.ai/api/genome/bios/${encodeURIComponent(username)}`);
  if (!r.ok) throw new Error(`Genome fetch failed for ${username}: ${r.status}`);
  const json = await r.json();
  GENOME_CACHE.set(username, { ts: now, data: json });
  return json;
}

/**
 * Main greedy algorithm.
 */
export async function selectTeamGreedy(
  candidates: (string | CandidateInput)[],
  requiredSkills: string[],
  teamSize: number,
  options: TeamSelectionOptions = {}
): Promise<TeamSelectionResult> {
  if (teamSize <= 0) {
    return {
      team: [],
      coverage: {
        requiredSkillCount: requiredSkills.length,
        coveredSkills: [],
        uncoveredSkills: dedupeLower(requiredSkills),
        coverageRatio: 0,
        totalContributionScore: 0,
      },
    };
  }

  const fetchGenome = options.fetchGenome || defaultFetchGenome;
  const proficiencyWeights = { ...DEFAULT_PROFICIENCY_WEIGHTS, ...(options.proficiencyWeights || {}) };
  const targetSkills = dedupeLower(requiredSkills);
  const uncovered = new Set(targetSkills);
  const covered: RequiredSkillCoverageEntry[] = [];
  const team: SelectedMember[] = [];

  // Normalize candidate list to objects
  const candidateObjs: CandidateInput[] = candidates.map((c) =>
    typeof c === 'string' ? { username: c } : c
  );

  // Fetch all genomes with limited concurrency
  await fetchAllGenomes(candidateObjs, fetchGenome, options.concurrency || 4, options.signal);

  // Preprocess candidate strengths into map for quicker scoring
  const candidateStrengths = new Map<string, GenomeStrength[]>();
  const candidateNames = new Map<string, string>();
  for (const c of candidateObjs) {
    const strengths = c.genome?.strengths || [];
    candidateStrengths.set(c.username, strengths);
    candidateNames.set(c.username, c.genome?.person?.name || c.username);
  }

  for (let i = 0; i < teamSize && uncovered.size > 0; i++) {
    let bestUser: string | null = null;
    let bestScore = 0;
    let bestCovered: RequiredSkillCoverageEntry[] = [];

    for (const c of candidateObjs) {
      if (team.find((m) => m.username === c.username)) continue; // already selected
      const contribution: RequiredSkillCoverageEntry[] = [];
      let score = 0;
      const strengths = candidateStrengths.get(c.username) || [];
      for (const s of strengths) {
        if (!s.name) continue;
        const skillKey = s.name.toLowerCase();
        if (!uncovered.has(skillKey)) continue; // already covered
        const prof = (s.proficiency || '').toLowerCase();
        const weight = s.weight || proficiencyWeights[prof] || 1;
        score += weight;
        contribution.push({
          skill: skillKey,
          proficiency: s.proficiency || 'unknown',
          weight,
          by: c.username,
        });
      }
      if (score > bestScore) {
        bestScore = score;
        bestUser = c.username;
        bestCovered = contribution;
      }
    }

    if (!bestUser || bestScore === 0) {
      // No additional coverage can be added.
      break;
    }

    // Commit selection
    for (const entry of bestCovered) {
      uncovered.delete(entry.skill);
      covered.push(entry);
    }
    team.push({
      username: bestUser,
      name: candidateNames.get(bestUser) || bestUser,
      skillsUsed: bestCovered,
      contributionScore: bestScore,
    });
  }

  const uncoveredSkills = Array.from(uncovered.values());
  const totalContributionScore = team.reduce((acc, m) => acc + m.contributionScore, 0);
  return {
    team,
    coverage: {
      requiredSkillCount: targetSkills.length,
      coveredSkills: covered,
      uncoveredSkills,
      coverageRatio: targetSkills.length === 0 ? 1 : (targetSkills.length - uncoveredSkills.length) / targetSkills.length,
      totalContributionScore,
    },
  };
}

// --- Helpers ---

function dedupeLower(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

async function fetchAllGenomes(
  candidates: CandidateInput[],
  fetchGenome: (u: string) => Promise<GenomeResponse>,
  concurrency: number,
  signal?: AbortSignal
) {
  const queue = [...candidates];
  const workers: Promise<void>[] = [];
  let aborted = false;
  signal?.addEventListener('abort', () => (aborted = true));
  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (queue.length && !aborted) {
          const c = queue.shift()!;
            if (c.genome) continue; // already present
          try {
            c.genome = await fetchGenome(c.username);
          } catch (e) {
            // Fail soft: leave genome undefined
            // eslint-disable-next-line no-console
            console.warn('Genome fetch failed', c.username, (e as Error).message);
          }
        }
      })()
    );
  }
  await Promise.all(workers);
}

// Example usage (remove or adapt in integration):
// (async () => {
//   const res = await selectTeamGreedy(['torrenegra'], ['javascript', 'leadership'], 1);
//   console.log(JSON.stringify(res, null, 2));
// })();
