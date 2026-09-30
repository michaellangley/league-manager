import { Fragment, useState } from 'react';
import { useLeague } from '../state/LeagueContext';
import type { Fixture } from '../domain/types';

export function FixtureList() {
  const { state } = useLeague();

  const rounds = [...new Set(state.fixtures.map((f) => f.round))].sort((a, b) => a - b);

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? 'Unknown team';

 return (
    <div className="matchCard-list">
      {rounds.map((round) => (
        <Fragment key={round}>
        <div className="matchCard-list-stage-divider">
                      Round {round + 1}
                    </div>
            {state.fixtures
              .filter((f) => f.round === round)
              .map((f) => (
                <FixtureRow key={f.id} fixture={f} teamName={teamName} />
              ))}
        </Fragment>
      ))}
    </div>
  );
}

function FixtureRow({ fixture, teamName,}: {fixture: Fixture; teamName: (id: string) => string;}) {
  const { dispatch } = useLeague();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return;

    dispatch({ type: 'RECORD_SCORE', fixtureId: fixture.id, score: { home, away } });
  };

  const label = `${teamName(fixture.homeTeamId)} vs ${teamName(fixture.awayTeamId)}`;

  if (fixture.status.kind === 'played') {
    return (
 <div className={`match-card `} >
      <div className="match-card-stage">
        {`Round ${fixture.round + 1}`}
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
                {homeScore}
            </div>
          </div>
          <div
            className={`match-card-team`}
          >
            <div className="match-card-team-details">
              {teamName(fixture.awayTeamId)} 
            </div>

            <div className="match-card-score">
                {awayScore}
            </div>
          </div>
        </div>

      </div>
    </div>
    );
  }

  if (fixture.status.kind === 'postponed') {
    return <li>{label} (postponed)</li>;
  }


  return(
 <form className={`match-card `} onSubmit={handleSubmit}>
      <div className="match-card-stage">
        {`Round ${fixture.round + 1}`}
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
                  min={0}
                  value={homeScore}
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
                  min={0}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                />
            </div>
          </div>
        </div>
           <div className="match-card-date-time">
             <button type="submit">Save score</button>
          </div>
      </div>
    </form>

  )

}