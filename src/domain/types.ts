export type TeamId = string;
export type FixtureId = string;

export interface Team {
  id: TeamId;
  name: string;
}

export type Score = { home: number; away: number };

export type FixtureStatus =
  | { kind: 'scheduled' }
  | { kind: 'played'; score: Score }
  | { kind: 'postponed'; reason?: string };

export interface Fixture {
  id: FixtureId;
  round: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  status: FixtureStatus;
}

export interface FixtureOptions {
  doubleRoundRobin: boolean;
}

export interface StandingsRow {
  teamId: TeamId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}