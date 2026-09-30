import { useState } from 'react';
import { useLeague } from '../state/LeagueContext';
import type { Team } from '../domain/types';

export function LeagueSetup() {
  const { dispatch } = useLeague();
  const [teams, setTeams] = useState<Team[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [doubleRoundRobin, setDoubleRoundRobin] = useState(false);

  const maxTeamCount = 8;
  const minTeamCount = 4;

  const trimmed = nameInput.trim();
  const isDuplicate = teams.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const canAddTeam = teams.length < maxTeamCount && nameInput.trim().length > 0;
  const canCreateLeague = teams.length >= minTeamCount;

  const handleAddTeam = () => {
    if(isDuplicate || !canAddTeam){
        return
    }
    const newTeam = { id: crypto.randomUUID(), name: trimmed }

    setTeams([...teams, newTeam]); 
    setNameInput('');
  };

  const handleRemoveTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id))
  };

  const handleCreateLeague = () => {
    dispatch({ type: 'CREATE_LEAGUE', teams, options: { doubleRoundRobin } })
  };

  return (
    <div className="setup">
      <h1 className="setup__title">Set up your league</h1>
      <div className='setup__add-row'>
        <label htmlFor="team-name" className='setup__label'>Team name</label>
        <div className="setup__add-controls">
          <input
            id="team-name"
            className='setup__input'
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeam())}
            placeholder="e.g. Riverside FC"
          />
          <button type="button" className='setup__add-button' onClick={handleAddTeam} disabled={!canAddTeam || (isDuplicate && trimmed.length > 0)}>
            Add team
          </button>
        </div>

      </div>
        {isDuplicate && trimmed.length > 0 && (
          <p className="setup__hint setup__hint--error">A team with that name is already in.</p>
        )}

      {teams.length > 0 && (
        <ol className="setup__lineup">
          {teams.map((team,i) => (
           <li key={team.id} className="setup__lineup-row">
              <span className="setup__lineup-number">{i + 1}</span>
              <span className="setup__lineup-name">{team.name}</span>
              <button
                type="button"
                className="setup__remove"
                onClick={() => handleRemoveTeam(team.id)}
                aria-label={`Remove ${team.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}

      <label className="setup__checkbox">
        <input
          type="checkbox"
          className="setup__checkbox-input"
          checked={doubleRoundRobin}
          onChange={(e) => setDoubleRoundRobin(e.target.checked)}
        />
        <span className="setup__checkbox-box" aria-hidden="true" />
        Play home and away
      </label>

      <button
        type="button"
        className="setup__create-button"
        onClick={handleCreateLeague}
        disabled={!canCreateLeague}
      >
        Create league
      </button>

      <div className="setup__count">
        <span className="setup__count-number">{teams.length}</span>
        <span className="setup__count-label">of {maxTeamCount} teams{teams.length < 4 ? ` · ${minTeamCount} needed to start` : ''}</span>
      </div>
    </div>
  );
}