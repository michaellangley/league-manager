import { describe, it, expect } from 'vitest';
import { leagueReducer } from './reducer';
import { initialState } from './actions';
import type { LeagueState, Action } from './actions';
import type { Team, Fixture } from '../domain/types';

const teams: Team[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
  { id: 'c', name: 'Charlie' },
  { id: 'd', name: 'Delta' },
];

const scheduled = (id: string, home: string, away: string): Fixture => ({
  id,
  round: 0,
  homeTeamId: home,
  awayTeamId: away,
  status: { kind: 'scheduled' },
});

const baseState: LeagueState = {
  teams,
  fixtures: [
    scheduled('f1', 'a', 'b'),
    scheduled('f2', 'c', 'd'),
  ],
  options: { doubleRoundRobin: false },
};

describe('leagueReducer', () => {
  describe('CREATE_LEAGUE', () => {
    it('sets teams, options, and generates the fixture list', () => {
      const action: Action = { type: 'CREATE_LEAGUE', teams, options: { doubleRoundRobin: false } };
      const next = leagueReducer(initialState, action);

      expect(next.teams).toEqual(teams);
      expect(next.options).toEqual({ doubleRoundRobin: false });
      expect(next.fixtures).toHaveLength(6); // 4 teams, single round-robin
      for (const f of next.fixtures) {
        expect(f.status).toEqual({ kind: 'scheduled' });
      }
    });

    it('replaces any existing teams and fixtures', () => {
      const action: Action = { type: 'CREATE_LEAGUE', teams: teams.slice(0, 2), options: { doubleRoundRobin: false } };
      const next = leagueReducer(baseState, action);

      expect(next.teams).toHaveLength(2);
      expect(next.fixtures).toHaveLength(1); // 2 teams, single round-robin
    });

    it('does not mutate the previous state', () => {
      const before = structuredClone(baseState);
      const action: Action = { type: 'CREATE_LEAGUE', teams, options: { doubleRoundRobin: true } };
      leagueReducer(baseState, action);
      expect(baseState).toEqual(before);
    });
  });

  describe('RECORD_SCORE', () => {
    it('sets the matching fixture to played with the given score', () => {
      const action: Action = { type: 'RECORD_SCORE', fixtureId: 'f1', score: { home: 2, away: 1 } };
      const next = leagueReducer(baseState, action);

      const updated = next.fixtures.find((f) => f.id === 'f1');
      expect(updated?.status).toEqual({ kind: 'played', score: { home: 2, away: 1 } });
    });

    it('leaves every other fixture unchanged, by reference', () => {
      const action: Action = { type: 'RECORD_SCORE', fixtureId: 'f1', score: { home: 2, away: 1 } };
      const next = leagueReducer(baseState, action);

      const untouched = next.fixtures.find((f) => f.id === 'f2');
      expect(untouched).toBe(baseState.fixtures[1]); // same object reference
    });

    it('returns fixtures unchanged when the fixtureId does not exist', () => {
      const action: Action = { type: 'RECORD_SCORE', fixtureId: 'nope', score: { home: 1, away: 0 } };
      const next = leagueReducer(baseState, action);

      expect(next.fixtures).toEqual(baseState.fixtures);
      expect(next.fixtures[0]).toBe(baseState.fixtures[0]);
      expect(next.fixtures[1]).toBe(baseState.fixtures[1]);
    });

    it('does not mutate the previous state', () => {
      const before = structuredClone(baseState);
      leagueReducer(baseState, { type: 'RECORD_SCORE', fixtureId: 'f1', score: { home: 3, away: 0 } });
      expect(baseState).toEqual(before);
    });
  });

  describe('POSTPONE_FIXTURE', () => {
    it('sets the matching fixture to postponed with the given reason', () => {
      const action: Action = { type: 'POSTPONE_FIXTURE', fixtureId: 'f1', reason: 'weather' };
      const next = leagueReducer(baseState, action);

      const updated = next.fixtures.find((f) => f.id === 'f1');
      expect(updated?.status).toEqual({ kind: 'postponed', reason: 'weather' });
    });

    it('allows postponing without a reason', () => {
      const action: Action = { type: 'POSTPONE_FIXTURE', fixtureId: 'f1' };
      const next = leagueReducer(baseState, action);

      const updated = next.fixtures.find((f) => f.id === 'f1');
      expect(updated?.status).toEqual({ kind: 'postponed', reason: undefined });
    });

    it('leaves every other fixture unchanged, by reference', () => {
      const action: Action = { type: 'POSTPONE_FIXTURE', fixtureId: 'f1', reason: 'weather' };
      const next = leagueReducer(baseState, action);

      const untouched = next.fixtures.find((f) => f.id === 'f2');
      expect(untouched).toBe(baseState.fixtures[1]);
    });

    it('returns fixtures unchanged when the fixtureId does not exist', () => {
      const action: Action = { type: 'POSTPONE_FIXTURE', fixtureId: 'nope' };
      const next = leagueReducer(baseState, action);
      expect(next.fixtures).toEqual(baseState.fixtures);
    });

    it('does not mutate the previous state', () => {
      const before = structuredClone(baseState);
      leagueReducer(baseState, { type: 'POSTPONE_FIXTURE', fixtureId: 'f1', reason: 'rain' });
      expect(baseState).toEqual(before);
    });
  });

  describe('RESET_LEAGUE', () => {
    it('returns the initial state', () => {
      const next = leagueReducer(baseState, { type: 'RESET_LEAGUE' });
      expect(next).toEqual(initialState);
    });

    it('does not mutate the previous state', () => {
      const before = structuredClone(baseState);
      leagueReducer(baseState, { type: 'RESET_LEAGUE' });
      expect(baseState).toEqual(before);
    });
  });
});