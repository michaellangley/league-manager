import type { LeagueState } from './actions';
import type { Team, Fixture, FixtureStatus, FixtureOptions } from '../domain/types';

function isTeam(value: unknown): value is Team {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string';
}

function isFixtureStatus(value: unknown): value is FixtureStatus {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  switch (v.kind) {
    case 'scheduled':
      return true;
    case 'played': {
      const score = v.score as Record<string, unknown> | undefined;
      return !!score && typeof score.home === 'number' && typeof score.away === 'number';
    }
    case 'postponed':
      return v.reason === undefined || typeof v.reason === 'string';
    default:
      return false;
  }
}

function isFixture(value: unknown): value is Fixture {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.round === 'number' &&
    typeof v.homeTeamId === 'string' &&
    typeof v.awayTeamId === 'string' &&
    isFixtureStatus(v.status)
  );
}

function isFixtureOptions(value: unknown): value is FixtureOptions {
  if (typeof value !== 'object' || value === null) return false;
  return typeof (value as Record<string, unknown>).doubleRoundRobin === 'boolean';
}

export function isLeagueState(value: unknown): value is LeagueState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.teams) && v.teams.every(isTeam) &&
    Array.isArray(v.fixtures) && v.fixtures.every(isFixture) &&
    isFixtureOptions(v.options)
  );
}