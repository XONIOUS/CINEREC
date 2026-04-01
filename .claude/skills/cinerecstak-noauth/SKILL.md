---
name: cinerecstak
description: >
  Full-stack movie recommendation web app skill using Vite 6 + React 19 + TypeScript (frontend),
  Supabase (backend/database — no auth required), and OMDB API (movie data + poster images).
  Use this skill whenever the user is building, modifying, debugging, or extending their movie
  recommendation website — including UI components, Supabase schema, SQL queries, OMDB API
  integration, imdbID syncing, genre filtering, ratings display, or deployment.
  Trigger for ANY request involving: movie app, CineRec, Supabase movies table, OMDB poster
  fetching, movie detail pages, recommendation logic, genre filters, search, or any full-stack
  feature for this project. Also trigger for "add a feature", "fix my query", "show me the SQL",
  "set up the database", "build the UI", or anything referencing this codebase.
---

# CineRecStack — Movie Recommendation App (School/College Project)

**Stack**: Vite 6 · React 19 · TypeScript · Tailwind CSS v4 · Supabase v2 · OMDB API  
**Auth**: ❌ Not needed — public access only  
**Goal**: Movie discovery + recommendations with clean SQL backend to demo

---

## 🗂 Project Navigation

Read the relevant reference file before writing code:

| Topic | File |
|---|---|
| Database schema, SQL queries | `references/database.md` |
| OMDB API integration & imdbID syncing | `references/omdb.md` |
| Vite config, folder structure, components | `references/frontend.md` |
| Supabase client, query patterns | `references/supabase-client.md` |

**Token-saving rule**: Maintain `PROJECT_NOTES.md` at project root. Write architecture decisions, feature status, and resolved issues there. Read it at the start of every session.

---

## ⚡ Quick Start

```bash
npm create vite@latest cinerecstak -- --template react-ts
cd cinerecstak
npm install @supabase/supabase-js @tanstack/react-query react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

**`vite.config.ts`**:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

**`.env.local`**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OMDB_API_KEY=your_omdb_key
```

---

## 🏗 Architecture Overview

```
Browser
  │
  ├─ Vite/React Frontend (src/)
  │     ├─ Movie Search  → OMDB API (by title)
  │     ├─ Movie Detail  → OMDB API (by imdbID)
  │     ├─ Browse/Filter → Supabase movies table
  │     └─ Recommendations → Supabase SQL query
  │
  ├─ Supabase (Postgres — no auth)
  │     ├─ public.movies      (all movie data, keyed by imdb_id)
  │     ├─ public.genres      (lookup/filter table)
  │     └─ public.ratings     (community ratings, no user tracking)
  │
  └─ OMDB API
        ├─ Search by title → get imdbID + basic info
        ├─ Fetch by imdbID → full details + poster URL
        └─ Poster field: direct image URL (cache in Supabase)
```

**Key principle**: `imdb_id` (e.g. `tt0499549`) is the join key between Supabase and OMDB.
Store it in every movie row; use it to fetch posters and full metadata on demand.

---

## 🔑 imdbID Sync Pattern

```
User searches "Inception"
    ↓
OMDB ?s=inception → [{ imdbID: 'tt1375666', Title, Poster, Year }]
    ↓ (user clicks movie)
fetchByImdbId('tt1375666') → full details
    ↓
upsert into Supabase movies (imdb_id = 'tt1375666', poster_url = Poster field)
    ↓
Browse page reads from Supabase → poster_url already cached
```

See `references/omdb.md` for full code.

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── MovieCard.tsx       # poster + title + genre tags + rating
│   ├── MovieGrid.tsx       # responsive grid with skeletons
│   ├── SearchBar.tsx       # debounced OMDB search
│   └── GenreFilter.tsx     # filter buttons
├── hooks/
│   ├── useMovies.ts        # Supabase movie queries
│   └── useOMDB.ts          # OMDB fetch + debounced search
├── lib/
│   ├── supabase.ts         # createClient singleton (no auth)
│   ├── omdb.ts             # OMDB helpers + types
│   └── types.ts            # shared TypeScript types
├── pages/
│   ├── Home.tsx            # browse + filter + recommendations
│   └── Movie.tsx           # detail page (/movie/:imdbId)
└── App.tsx
```

---

## 🗃 Database Quick Reference

Full schema + SQL in `references/database.md`. Key tables:

| Table | Purpose |
|---|---|
| `movies` | All movies, keyed by `imdb_id` |
| `ratings` | Aggregate star ratings (no user tracking) |

**Demo SQL** (for showing the backend):
```sql
SELECT title, imdb_id, year, genre, imdb_rating,
       COUNT(r.id) AS vote_count,
       ROUND(AVG(r.stars), 1) AS community_stars
FROM movies m
LEFT JOIN ratings r ON r.movie_id = m.id
GROUP BY m.id
ORDER BY imdb_rating DESC NULLS LAST
LIMIT 20;
```

---

## 🚨 Common Pitfalls

- **`VITE_` prefix required** for all env vars accessed in browser code
- **OMDB free tier**: 1,000 requests/day — cache poster URLs in Supabase to avoid re-fetching
- **OMDB Poster API** (`img.omdbapi.com`) requires patron key — use `Poster` field from response (free)
- **imdbID format**: always `tt` + 7–8 digits (e.g. `tt0499549`)
- **Supabase RLS**: disable it or set permissive `FOR SELECT USING (true)` policies — no auth = no user context to enforce
- **Supabase anon key in bundle is expected** — fine for a school project with public data
