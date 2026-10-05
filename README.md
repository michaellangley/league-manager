# League Manager

A small league scheduling and standings app, built to practise strict TypeScript in React after years of JavaScript. Create a league of 4–8 teams, generate a round-robin fixture list, record results, and watch a live standings table update.

<!-- Screenshot: setup screen -->
![Setting up a league](./assets/Screenshots/setup.png)

<!-- Screenshot: fixtures / match cards -->
![Fixture list with scores](./assets/Screenshots/matches.png)

<!-- Screenshot: standings table -->
![Standings table](./assets/Screenshots/table.png)

## Why this project

I've spent 13 years building front ends in JavaScript (mostly jQuery and MVC-style apps), and wanted a focused project to properly learn TypeScript rather than bolt it onto something casually. League Manager is deliberately small in scope, but the parts that exist are typed strictly and tested properly, rather than broad and shallow.

## Features

- Create a league with 4–8 teams
- Automatic round-robin fixture generation (single or double round-robin / home and away), including a bye round for odd team counts
- Record, edit, and undo match scores
- Live standings table with points, goal difference, and goals scored, each tiebreaker applied in order
- Data persisted to `localStorage`, so a league survives a page refresh

## Tech stack

- **React** + **TypeScript** (`strict` mode, `noUncheckedIndexedAccess`)
- **Vite** for tooling and dev server
- **Vitest** + **React Testing Library** for unit and component tests
- No backend — all state lives client-side

## Key design decisions

- **A pure domain layer.** Fixture generation (`domain/fixtures.ts`) and standings calculation (`domain/standings.ts`) are plain TypeScript functions with no React dependency. This keeps the core logic easy to read, easy to test in isolation, and reusable if the UI ever changes.
- **Discriminated unions over loose flags.** A fixture's status is modelled as `{ kind: 'scheduled' } | { kind: 'played'; score } | { kind: 'postponed'; reason? }` rather than a boolean plus optional fields. An unplayed fixture can't have a score; TypeScript enforces that invariant at compile time, not with runtime checks.
- **A typed reducer with exhaustive checks.** All state changes go through one reducer with a typed `Action` union. The `switch` statement's `default` branch asserts `never`, so adding a new action type without handling it in the reducer fails the build, not just at runtime.
- **Deterministic ordering.** Standings ties are broken by points, then goal difference, then goals scored, then team name — the last purely to keep the table's order stable and testable, not a sporting rule.

## Getting started

```bash
npm install
npm run dev
```

## Testing

```bash
npm test          # watch mode
npx vitest run     # single run (used in CI)
npm run typecheck  # tsc --noEmit
```

Tests cover:
- Fixture generation: correct match counts and rounds, no team double-booked in a round, every pair meets exactly once (twice for double round-robin), byes handled correctly for odd team counts
- Standings: points, goal difference, and tiebreaker ordering; unplayed fixtures correctly excluded
- The reducer: every action, including that unrelated state is left untouched and inputs are never mutated

## Deployment

Deployed on [Vercel / Netlify / GitHub Pages — pick one]. Every push to `main` runs typecheck, lint, and the test suite via GitHub Actions before deploying.

## What I'd do next

- Head-to-head as a further standings tiebreaker
- A simple knockout-stage generator once the group stage finishes
- Import/export a league as JSON, validated with a schema library
- A more considered home/away balancing algorithm — the current one is a simple heuristic

## Project structure

```
src/
  domain/        # pure TypeScript: types, fixture generation, standings
  state/         # reducer, actions, context
  components/    # LeagueSetup, FixtureList, StandingsTable, ...
```
