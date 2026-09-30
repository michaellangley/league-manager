import { useLeague } from '../state/LeagueContext';
import type { Score } from '../domain/types';

export function ScoreForm({ fixtureId }: { fixtureId: string }) {
  const { dispatch } = useLeague();

  const handleSubmit = (score: Score) => {
    dispatch({ type: 'RECORD_SCORE', fixtureId, score });
  };

  // TODO: actual form fields, calling handleSubmit on submit
  return null;
}