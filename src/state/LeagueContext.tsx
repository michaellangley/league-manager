import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { leagueReducer } from './reducer';
import { initialState, type LeagueState, type Action } from './actions';

interface LeagueContextValue {
  state: LeagueState;
  dispatch: Dispatch<Action>;
}

const LeagueContext = createContext<LeagueContextValue | undefined>(undefined);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leagueReducer, initialState);

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