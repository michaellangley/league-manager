import './App.css'
import { Routes, Route, NavLink } from "react-router-dom";
import { useLeague } from './state/LeagueContext';
import { LeagueSetup } from './components/LeagueSetup';
import { FixtureList } from './components/FixtureList';
import { StandingsTable } from './components/StandingsTable';


function App() {
  const { state } = useLeague();
  const leagueExists = state.teams.length > 0;

  return leagueExists ? (
    <>
        <nav className="tab-list">
          <NavLink className="tab-list-item" to="/">
            Table
          </NavLink>
          <NavLink className="tab-list-item" to="/matches">
            Matches
          </NavLink>
        </nav>
      <Routes>
        <Route
          path="/"
          element={<StandingsTable />}></Route>
          <Route
          path="/matches"
          element={<FixtureList />}></Route>
      </Routes>
    </>
  ) : (
    <LeagueSetup />
  );
}

export default App;