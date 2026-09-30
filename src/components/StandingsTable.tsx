import { useLeague } from '../state/LeagueContext';
import { computeStandings } from '../domain/standings';

export function StandingsTable() {
  const { state } = useLeague();
  const standings = computeStandings(state.teams, state.fixtures);

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? 'Unknown team';

  return (
  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          <th className="table-team-header">Team</th><th className="small">P</th><th className="small">W</th><th className="small">D</th><th className="small">L</th>
          <th className="small">GF</th><th className="small">GA</th><th className="small">GD</th><th className="small"><b>Pts</b></th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row,index) => (
          <tr key={row.teamId}>
            <td>
              <div className="team-cell">
                  <div className="team-cell-position">{index + 1}.</div>
                  <div className="team-cell-team-details">
                    {teamName(row.teamId)}
                  </div>
              </div>
            </td>
            <td>{row.played}</td>
            <td>{row.won}</td>
            <td>{row.drawn}</td>
            <td>{row.lost}</td>
            <td>{row.goalsFor}</td>
            <td>{row.goalsAgainst}</td>
            <td>{row.goalDifference}</td>
            <td><b>{row.points}</b></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}