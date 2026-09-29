import { describe, it, expect } from 'vitest';
import { computeStandings } from './standings';
import type { Team, Fixture, StandingsRow } from './types';

const teams: Team[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
  { id: 'c', name: 'Charlie' },
  { id: 'd', name: 'Delta' },
];

// Fixture builders keep each test short and readable.
const played = (id: string, home: string, away: string, h: number, a: number): Fixture => ({
  id,
  round: 0,
  homeTeamId: home,
  awayTeamId: away,
  status: { kind: 'played', score: { home: h, away: a } },
});

const scheduled = (id: string, home: string, away: string): Fixture => ({
  id,
  round: 0,
  homeTeamId: home,
  awayTeamId: away,
  status: { kind: 'scheduled' },
});

const postponed = (id: string, home: string, away: string): Fixture => ({
  id,
  round: 0,
  homeTeamId: home,
  awayTeamId: away,
  status: { kind: 'postponed', reason: 'weather' },
});

const rowFor = (table: StandingsRow[], teamId: string): StandingsRow | undefined =>
  table.find((r) => r.teamId === teamId);

const order = (table: StandingsRow[]): string[] => table.map((r) => r.teamId);

describe('computeStandings', () => {
  describe('basic results', () => {
    it('gives every team a zeroed row when no fixtures exist', () => {
      const table = computeStandings(teams, []);
      expect(table).toHaveLength(4);
      for (const row of table) {
        expect(row).toMatchObject({
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        });
      }
    });

    it('awards 3 points to a home winner and none to the loser', () => {
      const table = computeStandings(teams, [played('f1', 'a', 'b', 2, 0)]);
      expect(rowFor(table, 'a')).toMatchObject({
        played: 1, won: 1, drawn: 0, lost: 0,
        goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3,
      });
      expect(rowFor(table, 'b')).toMatchObject({
        played: 1, won: 0, drawn: 0, lost: 1,
        goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0,
      });
      expect(rowFor(table, 'c')).toMatchObject({ played: 0, points: 0 });
    });

    it('awards 3 points to an away winner', () => {
      const table = computeStandings(teams, [played('f1', 'a', 'b', 0, 1)]);
      expect(rowFor(table, 'b')).toMatchObject({ won: 1, points: 3 });
      expect(rowFor(table, 'a')).toMatchObject({ lost: 1, points: 0 });
    });

    it('awards 1 point each for a draw', () => {
      const table = computeStandings(teams, [played('f1', 'a', 'b', 1, 1)]);
      for (const id of ['a', 'b']) {
        expect(rowFor(table, id)).toMatchObject({
          played: 1, won: 0, drawn: 1, lost: 0,
          goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1,
        });
      }
    });

    it('accumulates goals and results across several matches', () => {
      const table = computeStandings(teams, [
        played('f1', 'a', 'b', 3, 1),
        played('f2', 'b', 'c', 2, 2),
        played('f3', 'c', 'a', 1, 0),
      ]);
      expect(rowFor(table, 'a')).toMatchObject({
        played: 2, won: 1, drawn: 0, lost: 1,
        goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3,
      });
      expect(rowFor(table, 'b')).toMatchObject({
        played: 2, won: 0, drawn: 1, lost: 1,
        goalsFor: 3, goalsAgainst: 5, goalDifference: -2, points: 1,
      });
      expect(rowFor(table, 'c')).toMatchObject({
        played: 2, won: 1, drawn: 1, lost: 0,
        goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 4,
      });
    });
  });

  describe('fixtures that should not count', () => {
    it('ignores scheduled and postponed fixtures', () => {
      const table = computeStandings(teams, [
        scheduled('f1', 'a', 'b'),
        postponed('f2', 'c', 'd'),
      ]);
      for (const row of table) {
        expect(row).toMatchObject({ played: 0, points: 0 });
      }
    });

    it('ignores a played fixture that references an unknown team', () => {
      const table = computeStandings(teams, [played('f1', 'a', 'zzz', 5, 0)]);
      expect(table).toHaveLength(4);
      expect(rowFor(table, 'a')).toMatchObject({ played: 0, goalsFor: 0, points: 0 });
    });
  });

  describe('ordering', () => {
    it('ranks by points before goal difference', () => {
      // a: one 9-0 win (3 pts, GD +9). b: two 1-0 wins (6 pts, GD +2).
      const table = computeStandings(teams, [
        played('f1', 'a', 'c', 9, 0),
        played('f2', 'b', 'd', 1, 0),
        played('f3', 'b', 'c', 1, 0),
      ]);
      expect(order(table)).toEqual(['b', 'a', 'd', 'c']);
    });

    it('breaks a points tie with goal difference', () => {
      // a and b both have 3 points; a has the better goal difference.
      const table = computeStandings(teams, [
        played('f1', 'a', 'c', 3, 0),
        played('f2', 'b', 'd', 1, 0),
      ]);
      expect(order(table)).toEqual(['a', 'b', 'd', 'c']);
    });

    it('breaks a points and goal-difference tie with goals scored', () => {
      // a and b: 3 points, GD +1. b scored more, so b ranks above a
      // even though Alpha comes first alphabetically.
      const table = computeStandings(teams, [
        played('f1', 'b', 'c', 3, 2),
        played('f2', 'a', 'd', 1, 0),
      ]);
      expect(order(table).slice(0, 2)).toEqual(['b', 'a']);
    });

    it('falls back to team name so the order is deterministic', () => {
      const shuffled = [...teams].reverse();
      const table = computeStandings(shuffled, []);
      expect(order(table)).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('purity and invariants', () => {
    it('does not mutate its inputs', () => {
      const fixtures = [played('f1', 'a', 'b', 2, 1), scheduled('f2', 'c', 'd')];
      const before = structuredClone({ teams, fixtures });
      computeStandings(teams, fixtures);
      expect({ teams, fixtures }).toEqual(before);
    });

    it('keeps every row internally consistent', () => {
      const fixtures = [
        played('f1', 'a', 'b', 3, 1),
        played('f2', 'c', 'd', 0, 0),
        played('f3', 'b', 'c', 2, 4),
        played('f4', 'd', 'a', 1, 1),
        scheduled('f5', 'a', 'c'),
      ];
      const table = computeStandings(teams, fixtures);

      for (const r of table) {
        expect(r.won + r.drawn + r.lost).toBe(r.played);
        expect(r.points).toBe(r.won * 3 + r.drawn);
        expect(r.goalDifference).toBe(r.goalsFor - r.goalsAgainst);
      }

      // Each played match counts for two teams.
      const playedCount = fixtures.filter((f) => f.status.kind === 'played').length;
      const totalPlayed = table.reduce((sum, r) => sum + r.played, 0);
      expect(totalPlayed).toBe(playedCount * 2);
    });
  });
});