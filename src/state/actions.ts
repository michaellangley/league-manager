import type { Team, Fixture, FixtureOptions, Score } from '../domain/types';

export interface LeagueState {
  teams: Team[];
  fixtures: Fixture[];
  options: FixtureOptions;
}

export const initialState: LeagueState = {
  teams: [],
  fixtures: [],
  options: { doubleRoundRobin: false },
};

export type Action =
  | { type: 'CREATE_LEAGUE'; teams: Team[]; options: FixtureOptions }
  | { type: 'RECORD_SCORE'; fixtureId: string; score: Score }
  | { type: 'RESET_SCORE'; fixtureId: string; }
  | { type: 'POSTPONE_FIXTURE'; fixtureId: string; reason?: string }
  | { type: 'RESET_LEAGUE' };