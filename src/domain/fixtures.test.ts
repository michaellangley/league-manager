import { describe, it, expect } from 'vitest';
import { generateFixtures } from './fixtures';
import type { Team } from './types';

// helper: build n teams so each test stays short
const makeTeams = (n: number): Team[] =>
  Array.from({ length: n }, (_, i) => ({ id: `t${i + 1}`, name: `Team ${i + 1}` }));

describe('generateFixtures (single round-robin)', () => {
  const single = { doubleRoundRobin: false };

  // it.each runs the same test with different inputs: [teams, fixtures, rounds]
  it.each([
    [4, 6, 3],
    [6, 15, 5],
    [5, 10, 5], // odd number: a bye each round
  ])('%i teams gives %i fixtures over %i rounds', (n, fixtureCount, roundCount) => {
    const fixtures = generateFixtures(makeTeams(n), single);
    expect(fixtures).toHaveLength(fixtureCount);
    expect(new Set(fixtures.map((f) => f.round)).size).toBe(roundCount);
  });

  it('never has a team playing twice in the same round', () => {
    const fixtures = generateFixtures(makeTeams(6), single);
    const rounds = new Set(fixtures.map((f) => f.round));
    for (const round of rounds) {
      const ids = fixtures
        .filter((f) => f.round === round)
        .flatMap((f) => [f.homeTeamId, f.awayTeamId]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('has every pair of teams meet exactly once', () => {
    const fixtures = generateFixtures(makeTeams(6), single);
    const pairs = fixtures.map((f) => [f.homeTeamId, f.awayTeamId].sort().join('-'));
    expect(new Set(pairs).size).toBe(pairs.length); // no duplicates
    expect(pairs).toHaveLength((6 * 5) / 2);         // no missing pairs
  });

  it('starts every fixture as scheduled', () => {
    const fixtures = generateFixtures(makeTeams(4), single);
    for (const f of fixtures) expect(f.status).toEqual({ kind: 'scheduled' });
  });
});