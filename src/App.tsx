import './App.css'
import { useLeague } from './state/LeagueContext';
import { LeagueSetup } from './components/LeagueSetup';
import { FixtureList } from './components/FixtureList';
import { StandingsTable } from './components/StandingsTable';


function App() {
  const { state } = useLeague();
  const leagueExists = state.teams.length > 0;

  return leagueExists ? (
    <>
      <StandingsTable />
      <FixtureList />
    </>
  ) : (
    <LeagueSetup />
  );
}

export default App;