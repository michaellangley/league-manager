import type { Team, Fixture, FixtureOptions } from './types';

export function generateFixtures(teams: Team[], options: FixtureOptions): Fixture[] {
  if (teams.length < 2) return [];

  // Work on a copy so the caller's array is never mutated.
  // A null entry is the "bye" placeholder used when the team count is odd.
  const list: (Team | null)[] = [...teams];
  if (list.length % 2 !== 0) list.push(null);

  const size = list.length;
  const roundsPerLeg = size - 1;
  const legs = options.doubleRoundRobin ? 2 : 1;
  const fixtures: Fixture[] = [];

  for (let leg = 0; leg < legs; leg++) {
    for (let x = 0; x < roundsPerLeg; x++) {
      const round = leg * roundsPerLeg + x;

      for (let i = 0; i < size / 2; i++) {
        const team1 = list[i];
        const team2 = list[size - 1 - i];
        if (!team1 || !team2) continue; // bye: nobody to play

        // Position 0 alternates by round; other positions alternate by slot.
        // The second leg reverses everything so each pair swaps home and away.
        const team1IsHome = (i === 0 ? x % 2 === 0 : i % 2 === 0) === (leg === 0);

        fixtures.push({
          id: `r${round}-m${i}`,
          round,
          homeTeamId: team1IsHome ? team1.id : team2.id,
          awayTeamId: team1IsHome ? team2.id : team1.id,
          status: { kind: 'scheduled' },
        });
      }

      // Rotate: list[0] stays fixed, the last team moves to position 1.
      const last = list.pop();
      if (last !== undefined) list.splice(1, 0, last);
    }
  }

  return fixtures;
}