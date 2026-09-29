import { afterEach } from 'vitest';
import type { Team, TeamId,Fixture, StandingsRow } from './types';

const points = {
    "win" : 3,
    "draw": 1,
    "loss":0
}

export function computeStandings(teams: Team[], fixtures: Fixture[]): StandingsRow[]{
    const rows = new Map<TeamId, StandingsRow>();
    const names = new Map<TeamId, string>(teams.map((t) => [t.id, t.name]));
    teams.forEach(team => {      
        rows.set(team.id, {
            teamId: team.id,
            played: 0, won: 0, drawn: 0, lost: 0,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        });
    });

    for (const fixture of fixtures) {
        if (fixture.status.kind !== 'played') continue;   // narrows fixture.status
        const { score } = fixture.status;                 // now allowed

        const home = rows.get(fixture.homeTeamId);
        const away = rows.get(fixture.awayTeamId);
        if (!home || !away) continue;

        home.played += 1;
        away.played += 1;
        home.goalsFor += score.home;
        home.goalsAgainst += score.away;
        away.goalsFor += score.away;
        away.goalsAgainst += score.home;
        home.goalDifference += score.home - score.away;
        away.goalDifference += score.away - score.home;
        if(score.home > score.away){
            home.won += 1
            home.points += points.win;
            away.lost += 1
            away.points += points.loss;
        }else if(score.away > score.home){
            home.lost += 1;
            home.points += points.loss;
            away.won += 1;
            away.points += points.win;
        }else{
            home.drawn += 1;
            home.points += points.draw;
            away.drawn += 1;
            away.points += points.draw;
        }
    }
    const table = [...rows.values()] as StandingsRow[]; 
    return table.sort((a: StandingsRow, b: StandingsRow) => {
        return (
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor ||
            (names.get(a.teamId) ?? '').localeCompare(names.get(b.teamId) ?? '')
        );
    });
}

// export interface Fixture {
//   id: FixtureId;
//   round: number;
//   homeTeamId: TeamId;
//   awayTeamId: TeamId;
//   status: FixtureStatus;
// }

// export interface StandingsRow {
//   teamId: TeamId;
//   played: number;
//   won: number;
//   drawn: number;
//   lost: number;
//   goalsFor: number;
//   goalsAgainst: number;
//   goalDifference: number;
//   points: number;
// }