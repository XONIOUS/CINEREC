# OMDB API Reference — CineRecStack

## Table of Contents
1. [API Overview](#api-overview)
2. [OMDB Data Fields](#omdb-data-fields)
3. [Fetch Helper (src/lib/omdb.ts)](#fetch-helper)
4. [imdbID Sync Pattern](#imdbid-sync-pattern)
5. [Poster URLs](#poster-urls)
6. [React Hook: useOMDB](#react-hook-useomdb)
7. [Caching Strategy](#caching-strategy)

---

## API Overview

**Base URL**: `https://www.omdbapi.com/`  
**Poster URL**: `https://img.omdbapi.com/` (patron tier) or use `Poster` field  
**Auth**: `?apikey=YOUR_KEY`  
**Format**: JSON (default)

| Endpoint pattern | Use case |
|---|---|
| `?i=tt0499549` | Fetch by imdbID (full details) |
| `?t=Inception&y=2010` | Fetch by title + year |
| `?s=batman&type=movie` | Search (returns list, no full details) |
| `?i=tt0499549&plot=full` | Full plot text |

---

## OMDB Data Fields

Full response from `?i=IMDBID`:

```json
{
  "Title": "Avatar",
  "Year": "2009",
  "Rated": "PG-13",
  "Released": "18 Dec 2009",
  "Runtime": "162 min",
  "Genre": "Action, Adventure, Fantasy",
  "Director": "James Cameron",
  "Writer": "James Cameron",
  "Actors": "Sam Worthington, Zoe Saldana, Sigourney Weaver",
  "Plot": "A paraplegic Marine dispatched to the moon Pandora...",
  "Language": "English, Spanish",
  "Country": "United States",
  "Awards": "Won 3 Oscars. 89 wins & 131 nominations total",
  "Poster": "https://m.media-amazon.com/images/M/..._SX300.jpg",
  "Ratings": [
    { "Source": "Internet Movie Database", "Value": "7.9/10" },
    { "Source": "Rotten Tomatoes", "Value": "82%" },
    { "Source": "Metacritic", "Value": "83/100" }
  ],
  "Metascore": "83",
  "imdbRating": "7.9",
  "imdbVotes": "1,328,000",
  "imdbID": "tt0499549",
  "Type": "movie",
  "DVD": "N/A",
  "BoxOffice": "$785,221,649",
  "Response": "True"
}
```

Search result (`?s=...`) fields (limited):
```json
{
  "Search": [
    { "Title": "Avatar", "Year": "2009", "imdbID": "tt0499549", "Type": "movie", "Poster": "..." }
  ],
  "totalResults": "42",
  "Response": "True"
}
```

---

## Fetch Helper

```ts
// src/lib/omdb.ts

const OMDB_BASE = 'https://www.omdbapi.com'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY

export interface OmdbMovie {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string          // comma-separated: "Action, Drama"
  Director: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string         // direct image URL
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Metascore: string
  Type: 'movie' | 'series' | 'episode'
  BoxOffice?: string
  Response: 'True' | 'False'
  Error?: string
}

export interface OmdbSearchResult {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export interface OmdbSearchResponse {
  Search?: OmdbSearchResult[]
  totalResults?: string
  Response: 'True' | 'False'
  Error?: string
}

/** Fetch full movie details by imdbID */
export async function fetchByImdbId(imdbId: string): Promise<OmdbMovie | null> {
  const res = await fetch(
    `${OMDB_BASE}/?apikey=${API_KEY}&i=${imdbId}&plot=full`
  )
  const data: OmdbMovie = await res.json()
  if (data.Response === 'False') return null
  return data
}

/** Fetch by title (optionally year) */
export async function fetchByTitle(
  title: string,
  year?: number
): Promise<OmdbMovie | null> {
  const params = new URLSearchParams({
    apikey: API_KEY,
    t: title,
    plot: 'full',
    ...(year ? { y: String(year) } : {}),
  })
  const res = await fetch(`${OMDB_BASE}/?${params}`)
  const data: OmdbMovie = await res.json()
  if (data.Response === 'False') return null
  return data
}

/** Search for movies by query string */
export async function searchMovies(
  query: string,
  type: 'movie' | 'series' = 'movie',
  page = 1
): Promise<OmdbSearchResponse> {
  const params = new URLSearchParams({
    apikey: API_KEY,
    s: query,
    type,
    page: String(page),
  })
  const res = await fetch(`${OMDB_BASE}/?${params}`)
  return res.json()
}

/** Transform OMDB movie → Supabase movie row shape */
export function omdbToSupabase(movie: OmdbMovie) {
  return {
    imdb_id: movie.imdbID,
    title: movie.Title,
    year: parseInt(movie.Year) || null,
    rated: movie.Rated !== 'N/A' ? movie.Rated : null,
    runtime: movie.Runtime !== 'N/A' ? movie.Runtime : null,
    genre: movie.Genre !== 'N/A'
      ? movie.Genre.split(', ').map(g => g.trim())
      : [],
    director: movie.Director !== 'N/A' ? movie.Director : null,
    actors: movie.Actors !== 'N/A' ? movie.Actors : null,
    plot: movie.Plot !== 'N/A' ? movie.Plot : null,
    language: movie.Language !== 'N/A' ? movie.Language : null,
    country: movie.Country !== 'N/A' ? movie.Country : null,
    awards: movie.Awards !== 'N/A' ? movie.Awards : null,
    poster_url: movie.Poster !== 'N/A' ? movie.Poster : null,
    imdb_rating: parseFloat(movie.imdbRating) || null,
    imdb_votes: parseInt(movie.imdbVotes?.replace(/,/g, '')) || null,
    metascore: parseInt(movie.Metascore) || null,
    type: movie.Type,
  }
}

/** Get poster URL from imdbID (fallback chain) */
export function getPosterUrl(
  imdbId: string,
  cachedPosterUrl?: string | null
): string {
  // Prefer the cached URL from Supabase (already validated)
  if (cachedPosterUrl && cachedPosterUrl !== 'N/A') return cachedPosterUrl
  // Patron Poster API (higher resolution, up to 2000x3000)
  return `https://img.omdbapi.com/?apikey=${API_KEY}&i=${imdbId}`
  // Note: img.omdbapi.com requires patron tier. If not patron, always
  // store poster URL from the OMDB response in Supabase.
}
```

---

## imdbID Sync Pattern

This is the critical bridge between Supabase and OMDB.

```ts
// src/lib/syncMovie.ts — call this whenever a movie is searched/added

import { supabase } from './supabase'
import { fetchByImdbId, omdbToSupabase } from './omdb'

/**
 * Ensure a movie exists in Supabase, synced from OMDB.
 * Returns the Supabase movie UUID.
 */
export async function syncMovieToSupabase(imdbId: string): Promise<string | null> {
  // 1. Check if already in Supabase
  const { data: existing } = await supabase
    .from('movies')
    .select('id')
    .eq('imdb_id', imdbId)
    .single()

  if (existing) return existing.id

  // 2. Fetch from OMDB
  const omdbData = await fetchByImdbId(imdbId)
  if (!omdbData) return null

  // 3. Upsert into Supabase
  const { data, error } = await supabase
    .from('movies')
    .upsert(omdbToSupabase(omdbData), { onConflict: 'imdb_id' })
    .select('id')
    .single()

  if (error) {
    console.error('syncMovieToSupabase error:', error)
    return null
  }

  return data.id
}
```

**Flow diagram**:
```
User searches "Inception"
    ↓
OMDB search API → [{ imdbID: 'tt1375666', Title: 'Inception', Poster: '...' }]
    ↓ (user clicks)
syncMovieToSupabase('tt1375666')
    ↓
Supabase upsert → movies row with imdb_id = 'tt1375666'
    ↓
addToWatchlist(supabaseMovieId, userId)
    ↓
user_movies row created
    ↓
Queries use imdb_id to hydrate poster/metadata from Supabase cache
    (or re-fetch from OMDB if poster_url is null)
```

---

## Poster URLs

Three sources, in priority order:

1. **`movies.poster_url`** (Supabase cache) — fastest, no API cost
2. **OMDB standard API** `Poster` field — free tier, Amazon CDN URLs
3. **OMDB Poster API** `img.omdbapi.com/?i=IMDBID` — patron tier, higher res

```ts
// In MovieCard.tsx
function getPoster(movie: Movie): string {
  if (movie.poster_url && movie.poster_url !== 'N/A') {
    return movie.poster_url
  }
  // Fallback: construct Poster API URL
  return `https://img.omdbapi.com/?apikey=${OMDB_KEY}&i=${movie.imdb_id}`
}
```

**In SQL** — get imdbID ready for frontend poster construction:
```sql
SELECT id, imdb_id, title, year, poster_url,
  -- Frontend uses: poster_url ?? `https://img.omdbapi.com/?apikey=KEY&i=${imdb_id}`
  CASE WHEN poster_url IS NULL THEN 'needs_fetch' ELSE 'cached' END AS poster_status
FROM movies
WHERE poster_url IS NULL
LIMIT 50; -- batch re-sync script
```

---

## React Hook: useOMDB

```ts
// src/hooks/useOMDB.ts
import { useState, useEffect, useRef } from 'react'
import { searchMovies, OmdbSearchResult } from '@/lib/omdb'

export function useMovieSearch(query: string, debounceMs = 400) {
  const [results, setResults] = useState<OmdbSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await searchMovies(query)
        setResults(response.Search ?? [])
        if (response.Response === 'False') setError(response.Error ?? 'No results')
      } catch (e) {
        setError('Search failed')
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [query, debounceMs])

  return { results, loading, error }
}
```

---

## Caching Strategy

| Data | Cache location | TTL |
|---|---|---|
| Movie metadata | Supabase `movies` table | Update on re-fetch |
| Poster URL | Supabase `movies.poster_url` | Permanent |
| Search results | React state (in-memory) | Session |
| User watchlist | Supabase + React Query | Real-time via Supabase channels |

**Batch poster sync** (run as Supabase Edge Function or cron):
```ts
// Fetch and cache posters for movies missing them
const { data: missingPosters } = await supabase
  .from('movies')
  .select('id, imdb_id')
  .is('poster_url', null)
  .limit(50)

for (const movie of missingPosters ?? []) {
  const omdb = await fetchByImdbId(movie.imdb_id)
  if (omdb?.Poster && omdb.Poster !== 'N/A') {
    await supabase
      .from('movies')
      .update({ poster_url: omdb.Poster })
      .eq('id', movie.id)
  }
}
```
