// state/validation.test.ts
import { describe, it, expect } from 'vitest';
import { isLeagueState } from './validation';

describe('isLeagueState', () => {
  it('accepts a well-formed state', () => {
    expect(isLeagueState({
      teams: [{ id: 'a', name: 'Alpha' }],
      fixtures: [],
      options: { doubleRoundRobin: false },
    })).toBe(true);
  });

  it('rejects null, arrays-in-place-of-objects, and missing fields', () => {
    expect(isLeagueState(null)).toBe(false);
    expect(isLeagueState([])).toBe(false);
    expect(isLeagueState({ teams: [] })).toBe(false);
  });

  it('rejects a fixture with a malformed status', () => {
    expect(isLeagueState({
      teams: [],
      fixtures: [{ id: 'f1', round: 0, homeTeamId: 'a', awayTeamId: 'b', status: { kind: 'played' } }], // missing score
      options: { doubleRoundRobin: false },
    })).toBe(false);
  });
});