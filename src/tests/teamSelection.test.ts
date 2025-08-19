import { selectTeamGreedy } from '../utils/teamSelection';

describe('selectTeamGreedy', () => {
  it('returns empty team when teamSize=0', async () => {
    const res = await selectTeamGreedy(['a'], ['skill1'], 0);
    expect(res.team.length).toBe(0);
    expect(res.coverage.coverageRatio).toBe(0);
  });

  it('handles empty required skill list', async () => {
    const res = await selectTeamGreedy(['a'], [], 2);
    expect(res.coverage.requiredSkillCount).toBe(0);
    expect(res.coverage.coverageRatio).toBe(1);
  });

  it('partial coverage when no candidate covers all', async () => {
    const fakeFetch = async (u: string) => ({
      person: { username: u, name: u },
      strengths: u === 'a' ? [{ name: 'alpha', proficiency: 'expert', weight: 10 }] : [{ name: 'beta', proficiency: 'expert', weight: 8 }]
    });
    const res = await selectTeamGreedy(['a', 'b'], ['alpha', 'beta', 'gamma'], 2, { fetchGenome: fakeFetch });
    expect(res.team.length).toBe(2);
    expect(res.coverage.uncoveredSkills).toContain('gamma');
  });
});
