import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchPoster } from '@/lib/omdb'
import { adaptMovie, type Movie } from '@/data/movies'
import type { DBMovie } from '@/lib/types'

const PAGE_SIZE = 24
const TABLE = 'movies_db'

// ─── Browse: paginated, filterable, searchable ────────────────────────────────
export function useMovies(genre: string | null, search: string) {
  return useQuery<Movie[]>({
    queryKey: ['movies', genre, search],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let q = supabase
        .from(TABLE)
        .select('*')
        .not('imdb_score', 'is', null)
        .not('imdb_id', 'is', null)
        .order('imdb_score', { ascending: false })
        .limit(PAGE_SIZE)

      if (genre && genre !== 'All') {
        // genres column is pipe-separated: "Action|Drama" — ilike handles substring match
        q = q.ilike('genres', `%${genre}%`)
      }
      if (search.trim()) {
        q = q.or(
          `movie_title.ilike.%${search.trim()}%,director_name.ilike.%${search.trim()}%`
        )
      }

      const { data, error } = await q
      console.log('[useMovies] result →', { rowCount: data?.length, error })
      if (error) throw error
      return (data as DBMovie[]).map((db) => adaptMovie(db))
    },
  })
}

// ─── Top 5 by imdb_score — pre-fetches OMDB posters for slideshow ─────────────
export function useTopMovies() {
  return useQuery<Movie[]>({
    queryKey: ['movies', 'top5'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .not('imdb_score', 'is', null)
        .not('imdb_id', 'is', null)
        .order('imdb_score', { ascending: false })
        .limit(5)

      console.log('[useTopMovies] result →', { rowCount: data?.length, error })
      if (error) throw error

      // Fetch all 5 posters in parallel (small, justified for hero slideshow)
      return Promise.all(
        (data as DBMovie[]).map(async (db) => {
          const poster = await fetchPoster(db.imdb_id)
          return adaptMovie(db, poster)
        })
      )
    },
  })
}

// ─── Per-card poster — each MovieCard calls this; React Query deduplicates ────
export function useMoviePoster(imdbId: string) {
  return useQuery<string | null>({
    queryKey: ['poster', imdbId],
    staleTime: 24 * 60 * 60 * 1000, // 24h — posters never change
    queryFn: () => fetchPoster(imdbId),
  })
}
