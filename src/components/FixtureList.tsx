import { useState } from 'react';
import { useLeague } from '../state/LeagueContext';
import type { Fixture } from '../domain/types';

export function FixtureList() {
  const { state } = useLeague();
  const rounds = [...new Set(state.fixtures.map((f) => f.round))].sort((a, b) => a - b);

  const [queryRound, setQueryRound] = useState(0);
  const [openRoundFilter, setOpenRoundFilter] = useState(false);

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? 'Unknown team';

  return (
    <div>
      <h1 className="setup__title">Matches</h1>
      <div className='RoundQueryContainer' >
        <button
          className='queryRoundPrev'
          disabled={queryRound == 0}
          onClick={() => setQueryRound(queryRound - 1)}>
          ←
        </button>
        <div
          className='queryRoundFilter'
          onClick={() => setOpenRoundFilter(true)}>
          Round {queryRound + 1}
        </div>
        <button
          className='queryRoundNext'
          disabled={queryRound == rounds.length - 1}
          onClick={() => setQueryRound(queryRound + 1)}>
          →
        </button>
      </div>

      <div className="matchCard-list">
        <div className="matchCard-list-stage-divider">
          Round {queryRound + 1} of {rounds.length}
        </div>
        {state.fixtures
          .filter((f) => f.round === queryRound)
          .map((f) => (
            <FixtureRow key={f.id} fixture={f} teamName={teamName} />
          ))}

      </div>

      {openRoundFilter && (
        <div className="round-filter-overlay">
          <div className="backdrop" onClick={() => setOpenRoundFilter(false)} />
          <div className="round-filter-container" role="dialog" aria-label="Choose round">
            <div className="round-filter-header">
              <h2 className="setup__title">Rounds</h2>
              <button
                type="button"
                className="round-filter-close"
                onClick={() => setOpenRoundFilter(false)}
                aria-label="Close"
              >
                ⛌
              </button>
            </div>
            <div className="round-list-container">
              {rounds.map((round) => (
                <button
                  key={round}
                  type="button"
                  className={`round-list-item ${round === queryRound ? 'round-list-item--active' : ''}`}
                  onClick={() => { setQueryRound(round); setOpenRoundFilter(false); }}
                >
                  Round {round + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FixtureRow({ fixture, teamName, }: { fixture: Fixture; teamName: (id: string) => string; }) {
  const { dispatch } = useLeague();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [editFixture, setEditFixture] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return;

    setEditFixture(false)
    dispatch({ type: 'RECORD_SCORE', fixtureId: fixture.id, score: { home, away } });
  };


  if (editFixture) {
    return (
    <form className={`match-card `} onSubmit={handleSubmit}>
      <div className="match-card-stage">
        {`Round ${fixture.round + 1}`}
        <div style={{display:"flex", gap:"6px"}}>
          {fixture.status.kind === 'played' && <button className='match-card-reset' onClick={() => {dispatch({ type: 'RESET_SCORE', fixtureId: fixture.id }); setEditFixture(false)}}>↻</button>}
          <button type="submit" className='match-card-save'>🖫</button>
          
        </div>
      </div>
      <div className="match-card-details">
        <div className="match-card-teams">
          <div
            className={`match-card-team`}
          >
            <div className="match-card-team-details">
              {teamName(fixture.homeTeamId)}
            </div>

            <div className="match-card-score">
              <input
                id={`home-${fixture.id}`}
                type="number"
                placeholder='0'
                min={0}
                value={fixture.status.kind === 'played' ? fixture.status.score.home : homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
              />
            </div>
          </div>
          <div
            className={`match-card-team`}
          >
            <div className="match-card-team-details">
              {teamName(fixture.awayTeamId)}
            </div>

            <div className="match-card-score">
              <input
                id={`away-${fixture.id}`}
                type="number"
                placeholder='0'
                min={0}
                value={fixture.status.kind === 'played' ? fixture.status.score.away : awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )}

  if (fixture.status.kind === 'played') {
    return (
      <div className={`match-card `} >

        <div className="match-card-stage">
          {`Round ${fixture.round + 1}`}
          <button className='editFixture' onClick={() => setEditFixture(true)}>✎</button>
        </div>
        <div className="match-card-details">
          <div className="match-card-teams">
            <div
              className={`match-card-team`}
            >
              <div className="match-card-team-details">
                {teamName(fixture.homeTeamId)}
              </div>

              <div className="match-card-score">
                {fixture.status.score.home}
              </div>
            </div>
            <div
              className={`match-card-team`}
            >
              <div className="match-card-team-details">
                {teamName(fixture.awayTeamId)}
              </div>

              <div className="match-card-score">
                {fixture.status.score.away}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fixture.status.kind === 'postponed') {
    return (
      <div className="match-card match-card--postponed">
        <div className="match-card-stage">{`Round ${fixture.round + 1}`}</div>
        <div className="match-card-details">
          <div className="match-card-teams">
            <div className="match-card-team">
              <div className="match-card-team-details">{teamName(fixture.homeTeamId)}</div>
            </div>
            <div className="match-card-team">
              <div className="match-card-team-details">{teamName(fixture.awayTeamId)}</div>
            </div>
          </div>
          <div className="match-card-date-time">Postponed</div>
        </div>
      </div>
    );
  }


  return (
          <div className={`match-card `} >

        <div className="match-card-stage">
          {`Round ${fixture.round + 1}`}
          <button className='editFixture' onClick={() => setEditFixture(true)}>✎</button>
        </div>
        <div className="match-card-details">
          <div className="match-card-teams">
            <div
              className={`match-card-team`}
            >
              <div className="match-card-team-details">
                {teamName(fixture.homeTeamId)}
              </div>

              <div className="match-card-score">
                -
              </div>
            </div>
            <div
              className={`match-card-team`}
            >
              <div className="match-card-team-details">
                {teamName(fixture.awayTeamId)}
              </div>

              <div className="match-card-score">
                -
              </div>
            </div>
          </div>
        </div>
      </div>
  )

}