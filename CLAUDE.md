# CineRec — Claude Code Project Configuration

## Project Overview
CineRec is a full-stack movie recommendation web app (school/college project).

**Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase + OMDB API
**Auth**: None — public access only
**Branch**: `arthur_dev` (development), `main` (production)

## Key Conventions
- Use `@/` path alias for imports from `src/`
- `imdb_id` is the universal join key between Supabase and OMDB
- All env vars for browser must use `VITE_` prefix
- Poster URLs are cached in Supabase `movies.poster_url` from OMDB responses
- No auth/RLS — fully public app

## Skill
The `cinerecstak-noauth` skill is installed at `.claude/skills/cinerecstak-noauth/`.
Read the relevant reference file before writing code:
- Database schema & SQL: `references/database.md`
- OMDB API integration: `references/omdb.md`
- Frontend components & Vite config: `references/frontend.md`
- Supabase client & query patterns: `references/supabase-client.md`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Run tests (vitest)

## Project Structure
```
src/
├── components/    # UI components (shadcn/ui + custom)
├── hooks/         # React hooks (useMovies, useOMDB, etc.)
├── lib/           # Utilities (supabase client, omdb helpers, types)
├── pages/         # Route pages (Home, Movie detail)
└── App.tsx        # Router setup
```
