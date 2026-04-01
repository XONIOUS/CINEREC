# Database Reference — CineRecStack

## Table of Contents
1. [Schema Setup](#schema-setup)
2. [Disable RLS (public project)](#disable-rls)
3. [Indexes](#indexes)
4. [Seed Data](#seed-data)
5. [Demo SQL Queries](#demo-sql-queries)
6. [Supabase RPC Functions](#supabase-rpc-functions)
7. [TypeScript Types](#typescript-types)

---

## Schema Setup

Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- ─────────────────────────────────────────
-- MOVIES TABLE (canonical, keyed by imdb_id)
-- ─────────────────────────────────────────
CREATE TABLE public.movies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imdb_id     TEXT UNIQUE NOT NULL,     -- e.g. 'tt0499549' — links to OMDB
  title       TEXT NOT NULL,
  year        INTEGER,
  rated       TEXT,                     -- 'PG-13', 'R', 'G', etc.
  runtime     TEXT,                     -- '162 min'
  genre       TEXT[],                   -- ['Action', 'Drama']
  director    TEXT,
  actors      TEXT,
  plot        TEXT,
  language    TEXT,
  country     TEXT,
  awards      TEXT,
  poster_url  TEXT,                     -- cached from OMDB 'Poster' field
  imdb_rating NUMERIC(3,1),             -- e.g. 8.3
  imdb_votes  INTEGER,
  metascore   INTEGER,
  box_office  TEXT,
  type        TEXT DEFAULT 'movie',     -- 'movie' | 'series'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RATINGS (anonymous — no user tracking)
-- ─────────────────────────────────────────
CREATE TABLE public.ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id    UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  stars       NUMERIC(2,1) NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- GENRES lookup (for filter UI)
-- ─────────────────────────────────────────
CREATE TABLE public.genres (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL
);

INSERT INTO public.genres (name) VALUES
  ('Action'), ('Adventure'), ('Animation'), ('Biography'),
  ('Comedy'), ('Crime'), ('Documentary'), ('Drama'),
  ('Fantasy'), ('Horror'), ('Mystery'), ('Romance'),
  ('Sci-Fi'), ('Thriller'), ('Western');
```

---

## Disable RLS

No auth = no user context = RLS should be off or fully permissive:

```sql
-- Option A: Disable RLS entirely (simplest for a school project)
ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings DISABLE ROW LEVEL SECURITY;

-- Option B: Keep RLS on but allow full public access
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "public_insert_movies" ON public.movies FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_movies" ON public.movies FOR UPDATE USING (true);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_ratings" ON public.ratings FOR ALL USING (true) WITH CHECK (true);
```

---

## Indexes

```sql
-- Fast lookup by imdb_id (used constantly for OMDB sync)
CREATE INDEX idx_movies_imdb_id ON public.movies (imdb_id);

-- Genre array search (used by filter UI)
CREATE INDEX idx_movies_genre ON public.movies USING GIN (genre);

-- Sort by rating (home page default sort)
CREATE INDEX idx_movies_rating ON public.movies (imdb_rating DESC NULLS LAST);

-- Rating aggregation joins
CREATE INDEX idx_ratings_movie_id ON public.ratings (movie_id);
```

---

## Seed Data

Manually insert a few movies to populate the app before search is built:

```sql
INSERT INTO public.movies (imdb_id, title, year, genre, director, imdb_rating, poster_url) VALUES
  ('tt1375666', 'Inception', 2010, ARRAY['Action','Sci-Fi','Thriller'],
   'Christopher Nolan', 8.8,
   'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg'),

  ('tt0816692', 'Interstellar', 2014, ARRAY['Adventure','Drama','Sci-Fi'],
   'Christopher Nolan', 8.7,
   'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg'),

  ('tt0468569', 'The Dark Knight', 2008, ARRAY['Action','Crime','Drama'],
   'Christopher Nolan', 9.0,
   'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'),

  ('tt0133093', 'The Matrix', 1999, ARRAY['Action','Sci-Fi'],
   'The Wachowskis', 8.7,
   'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTM5YTUtZWU4M2ZlMmUyNWJiXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg'),

  ('tt0110912', 'Pulp Fiction', 1994, ARRAY['Crime','Drama'],
   'Quentin Tarantino', 8.9,
   'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg');
```

---

## Demo SQL Queries

These are production-quality queries to show in the Supabase SQL Editor.

### 1. Top-Rated Movies with Community Votes
```sql
SELECT
  m.title,
  m.imdb_id,
  m.year,
  m.genre,
  m.imdb_rating,
  m.director,
  COUNT(r.id)                               AS community_votes,
  ROUND(AVG(r.stars), 1)                    AS community_stars,
  m.poster_url
FROM public.movies m
LEFT JOIN public.ratings r ON r.movie_id = m.id
GROUP BY m.id
ORDER BY m.imdb_rating DESC NULLS LAST
LIMIT 20;
```

### 2. Movies by Genre
```sql
SELECT
  m.title,
  m.year,
  m.imdb_rating,
  m.imdb_id,
  m.genre
FROM public.movies m
WHERE m.genre @> ARRAY['Action']    -- change genre here
ORDER BY m.imdb_rating DESC NULLS LAST;
```

### 3. Genre Breakdown of the Catalogue
```sql
SELECT
  UNNEST(genre)   AS genre_name,
  COUNT(*)        AS total_movies,
  ROUND(AVG(imdb_rating), 2) AS avg_imdb_rating,
  MAX(imdb_rating) AS best_rated
FROM public.movies
GROUP BY genre_name
ORDER BY total_movies DESC;
```

### 4. Most Voted Movies (Community Engagement)
```sql
SELECT
  m.title,
  m.year,
  m.imdb_id,
  COUNT(r.id)            AS vote_count,
  ROUND(AVG(r.stars), 2) AS avg_stars,
  MIN(r.stars)           AS lowest,
  MAX(r.stars)           AS highest
FROM public.movies m
JOIN public.ratings r ON r.movie_id = m.id
GROUP BY m.id
ORDER BY vote_count DESC
LIMIT 10;
```

### 5. Recently Added Movies
```sql
SELECT
  title, imdb_id, year, genre, imdb_rating, created_at
FROM public.movies
ORDER BY created_at DESC
LIMIT 10;
```

### 6. Recommendations — "Similar Genre" Query
```sql
-- Given a movie, find others in the same genre(s)
-- Replace 'tt1375666' with any imdbID
WITH target AS (
  SELECT genre FROM public.movies WHERE imdb_id = 'tt1375666'
)
SELECT
  m.title,
  m.imdb_id,
  m.year,
  m.genre,
  m.imdb_rating,
  m.poster_url,
  -- Count how many genres overlap with the target movie
  ARRAY_LENGTH(
    ARRAY(SELECT UNNEST(m.genre) INTERSECT SELECT UNNEST(t.genre)),
    1
  ) AS genre_overlap
FROM public.movies m, target t
WHERE m.imdb_id != 'tt1375666'
  AND m.genre && t.genre   -- any genre overlap
ORDER BY genre_overlap DESC, m.imdb_rating DESC NULLS LAST
LIMIT 8;
```

### 7. Full-Text Search on Title + Plot
```sql
SELECT title, year, imdb_id, imdb_rating, genre
FROM public.movies
WHERE
  title ILIKE '%space%'
  OR plot ILIKE '%space%'
ORDER BY imdb_rating DESC NULLS LAST
LIMIT 10;
```

---

## Supabase RPC Functions

### get_similar_movies(p_imdb_id, p_limit)
```sql
CREATE OR REPLACE FUNCTION public.get_similar_movies(
  p_imdb_id TEXT,
  p_limit   INT DEFAULT 8
)
RETURNS TABLE (
  id UUID, imdb_id TEXT, title TEXT, year INT,
  genre TEXT[], imdb_rating NUMERIC, poster_url TEXT,
  genre_overlap INT
)
LANGUAGE sql AS $$
  WITH target AS (
    SELECT genre FROM public.movies WHERE imdb_id = p_imdb_id
  )
  SELECT
    m.id, m.imdb_id, m.title, m.year,
    m.genre, m.imdb_rating, m.poster_url,
    ARRAY_LENGTH(
      ARRAY(SELECT UNNEST(m.genre) INTERSECT SELECT UNNEST(t.genre)),
      1
    ) AS genre_overlap
  FROM public.movies m, target t
  WHERE m.imdb_id != p_imdb_id
    AND m.genre && t.genre
  ORDER BY genre_overlap DESC, m.imdb_rating DESC NULLS LAST
  LIMIT p_limit;
$$;
```

Call from JS: `supabase.rpc('get_similar_movies', { p_imdb_id: 'tt1375666' })`

### get_genre_stats()
```sql
CREATE OR REPLACE FUNCTION public.get_genre_stats()
RETURNS TABLE (genre_name TEXT, movie_count BIGINT, avg_rating NUMERIC)
LANGUAGE sql AS $$
  SELECT
    UNNEST(genre) AS genre_name,
    COUNT(*)      AS movie_count,
    ROUND(AVG(imdb_rating), 2) AS avg_rating
  FROM public.movies
  GROUP BY genre_name
  ORDER BY movie_count DESC;
$$;
```

---

## TypeScript Types

```ts
// src/lib/types.ts
export interface Movie {
  id: string
  imdb_id: string         // 'tt0499549' — universal join key with OMDB
  title: string
  year: number | null
  rated: string | null
  runtime: string | null
  genre: string[]
  director: string | null
  actors: string | null
  plot: string | null
  language: string | null
  country: string | null
  awards: string | null
  poster_url: string | null
  imdb_rating: number | null
  imdb_votes: number | null
  metascore: number | null
  box_office: string | null
  type: 'movie' | 'series'
  created_at: string
}

export interface Rating {
  id: string
  movie_id: string
  stars: number           // 1.0 – 5.0
  created_at: string
}

export interface MovieWithRating extends Movie {
  community_votes: number
  community_stars: number | null
}
```
