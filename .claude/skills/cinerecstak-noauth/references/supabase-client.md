# Supabase Client Reference — CineRecStack

## Table of Contents
1. [Client Setup (no auth)](#client-setup)
2. [Common Query Patterns](#common-query-patterns)
3. [Movie Hooks](#movie-hooks)
4. [Rating Hook](#rating-hook)
5. [Type Generation](#type-generation)

---

## Client Setup

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars — check .env.local')
}

// No auth options needed — fully public
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

That's it. No session management, no auth listeners.

---

## Common Query Patterns

```ts
// ── SELECT all movies, sorted ─────────────────────
const { data, error } = await supabase
  .from('movies')
  .select('*')
  .order('imdb_rating', { ascending: false })
  .limit(20)

// ── SELECT with rating join ───────────────────────
const { data } = await supabase
  .from('movies')
  .select(`
    *,
    ratings (stars)
  `)
  .order('imdb_rating', { ascending: false })

// ── FILTER by genre (array contains) ─────────────
const { data } = await supabase
  .from('movies')
  .select('*')
  .contains('genre', ['Action'])
  .order('imdb_rating', { ascending: false })

// ── SEARCH by title (case-insensitive) ───────────
const { data } = await supabase
  .from('movies')
  .select('*')
  .ilike('title', `%${query}%`)
  .limit(10)

// ── UPSERT movie from OMDB ────────────────────────
const { data } = await supabase
  .from('movies')
  .upsert(movieData, { onConflict: 'imdb_id' })
  .select('id')
  .single()

// ── INSERT anonymous rating ───────────────────────
await supabase.from('ratings').insert({ movie_id, stars })

// ── PAGINATE ──────────────────────────────────────
const PAGE_SIZE = 20
const { data, count } = await supabase
  .from('movies')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('imdb_rating', { ascending: false })

// ── CALL RPC function ─────────────────────────────
const { data } = await supabase
  .rpc('get_similar_movies', { p_imdb_id: 'tt1375666', p_limit: 8 })
```

---

## Movie Hooks

```ts
// src/hooks/useMovies.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Movie } from '@/lib/types'

/** All movies, sorted by IMDB rating */
export function useTopMovies(limit = 20) {
  return useQuery<Movie[]>({
    queryKey: ['movies', 'top', limit],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .not('imdb_rating', 'is', null)
        .order('imdb_rating', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
  })
}

/** Filter by genre */
export function useMoviesByGenre(genre: string | null) {
  return useQuery<Movie[]>({
    queryKey: ['movies', 'genre', genre],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('movies')
        .select('*')
        .order('imdb_rating', { ascending: false })

      if (genre) query = query.contains('genre', [genre])

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

/** Single movie by imdbID */
export function useMovie(imdbId: string) {
  return useQuery<Movie | null>({
    queryKey: ['movie', imdbId],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('imdb_id', imdbId)
        .single()
      return data
    },
  })
}

/** Similar movies via RPC */
export function useSimilarMovies(imdbId: string) {
  return useQuery({
    queryKey: ['similar', imdbId],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_similar_movies', { p_imdb_id: imdbId, p_limit: 8 })
      if (error) throw error
      return data ?? []
    },
  })
}
```

---

## Rating Hook

```ts
// src/hooks/useRating.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function useRating(movieId: string) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const qc = useQueryClient()

  async function submitRating(stars: number) {
    setSubmitting(true)
    const { error } = await supabase
      .from('ratings')
      .insert({ movie_id: movieId, stars })

    if (!error) {
      setSubmitted(true)
      // Refresh the movie data to show updated ratings
      qc.invalidateQueries({ queryKey: ['movies'] })
    }
    setSubmitting(false)
  }

  return { submitRating, submitting, submitted }
}
```

---

## Type Generation

After schema is set up, generate TypeScript types for full autocomplete:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase gen types typescript --linked > src/lib/database.types.ts
```

Then update `supabase.ts`:
```ts
import type { Database } from './database.types'
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```
