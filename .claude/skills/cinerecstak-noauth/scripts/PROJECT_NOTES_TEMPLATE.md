# PROJECT_NOTES.md — CineRecStack
<!-- Read this first every session. Update as you work. Saves tokens. -->

## App Status
- **Phase**: [ ] Setup [ ] Core UI [ ] OMDB Integration [ ] SQL Demo Ready [ ] Deployed
- **Last updated**: YYYY-MM-DD

## Environment
- Supabase project ref: `xxxx`
- Supabase URL: `https://xxxx.supabase.co`
- OMDB API key: in `.env.local` as `VITE_OMDB_API_KEY`
- Deployed at: (Vercel/Netlify URL)

## Database Status
- [ ] movies table created
- [ ] ratings table created
- [ ] genres table + seeded
- [ ] RLS disabled (or permissive policies set)
- [ ] Indexes created
- [ ] Seed movies inserted
- [ ] `get_similar_movies` RPC created
- [ ] `get_genre_stats` RPC created

## Features Status
| Feature | Done | Notes |
|---|---|---|
| OMDB search (debounced) | | |
| Movie grid / browse | | |
| Genre filter | | |
| Movie detail page | | |
| Similar movies | | |
| Anonymous rating | | |
| SQL demo queries working | | |

## Architecture Notes
- No auth — fully public app
- `imdb_id` is the join key between Supabase and OMDB
- Poster URLs cached in `movies.poster_url` from OMDB response
- RLS disabled or set to allow all public access
- TanStack Query handles server state caching

## Known Issues / TODOs
- [ ] 

## SQL Queries Run (copy key ones here for reference)
```sql
-- Schema: YYYY-MM-DD
-- Seed data: YYYY-MM-DD
```
