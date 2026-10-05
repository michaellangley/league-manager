import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { leagueReducer } from './reducer';
import { initialState, type LeagueState, type Action } from './actions';
import { isLeagueState } from './validation';

const STORAGE_KEY = 'league-manager:state';

function loadState(): LeagueState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    const parsed: unknown = JSON.parse(raw);
    if (!isLeagueState(parsed)) return initialState; // malformed data: start fresh

    return parsed;
  } catch {
    return initialState;
  }
}

interface LeagueContextValue {
  state: LeagueState;
  dispatch: Dispatch<Action>;
}

const LeagueContext = createContext<LeagueContextValue | undefined>(undefined);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leagueReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <LeagueContext.Provider value={{ state, dispatch }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague(): LeagueContextValue {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}

interface LeagueContextValue {
  state: LeagueState;
  dispatch: Dispatch<Action>;
}

