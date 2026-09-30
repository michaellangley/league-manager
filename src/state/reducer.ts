import { type LeagueState, type Action } from './actions';
import { initialState } from './actions';
import { generateFixtures } from '../domain/fixtures';

export function leagueReducer(state: LeagueState, action: Action): LeagueState {
  switch (action.type) {
    case 'CREATE_LEAGUE': {
      const fixtures = generateFixtures(action.teams, action.options);
      return {
            ...state,
            teams: action.teams,
            options: action.options,
            fixtures,
        };
    }
    case 'RECORD_SCORE': {
        return {
            ...state,
            fixtures: state.fixtures.map((f) =>
            f.id === action.fixtureId
                ? { ...f, status: { kind: 'played', score: action.score } }
                : f
            ),
        };
    }
    case 'POSTPONE_FIXTURE': {
              return {
            ...state,
            fixtures: state.fixtures.map((f) =>
            f.id === action.fixtureId
                ? { ...f, status: { kind: 'postponed', reason: action.reason } }
                : f
            ),
        };
    }
    case 'RESET_LEAGUE':
      return initialState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}