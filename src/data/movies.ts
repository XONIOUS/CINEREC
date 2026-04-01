import type { DBMovie } from '@/lib/types'

// ─── UI Movie type (all components use this) ──────────────────────────────────
export interface Movie {
  id: string            // imdb_id
  title: string         // movie_title
  year: number          // title_year
  rating: number        // imdb_score
  genre: string[]       // genres split by '|'
  director: string      // director_name
  synopsis: string      // plot_keywords joined with ' · '
  poster: string        // OMDB poster URL (lazy-loaded per card) or placeholder
  backdrop: string      // same as poster (used for slideshow bg)
  duration: string      // formatted "2h 14m"
  trailerUrl: string    // movie_imdb_link
  // Extended fields shown in modal
  actors: string
  country: string | null
  language: string | null
  content_rating: string | null
  gross: number | null
  budget: number | null
  num_voted_users: number | null
}

// ─── Genre filter list ─────────────────────────────────────────────────────────
export const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western',
] as const

// ─── DB → UI adapter ──────────────────────────────────────────────────────────
export function adaptMovie(db: DBMovie, posterUrl?: string | null): Movie {
  const genres = db.genres
    ? db.genres.split('|').map((g) => g.trim()).filter(Boolean)
    : []

  const synopsis = db.plot_keywords
    ? db.plot_keywords.split('|').map((k) => k.trim()).join(' · ')
    : 'No synopsis available.'

  const durationMin = db.duration ?? 0
  const hours = Math.floor(durationMin / 60)
  const mins = durationMin % 60
  const durationStr = durationMin ? `${hours}h ${mins}m` : 'N/A'

  const actors = [db.actor_1_name, db.actor_2_name, db.actor_3_name]
    .filter(Boolean)
    .join(', ')

  const placeholder = `https://placehold.co/300x450/1a1a24/e2e8f0?text=${encodeURIComponent(
    (db.movie_title ?? 'Movie').slice(0, 18)
  )}`
  const poster = posterUrl ?? placeholder

  return {
    id: db.imdb_id,
    title: db.movie_title ?? 'Unknown',
    year: db.title_year ?? 0,
    rating: db.imdb_score ?? 0,
    genre: genres,
    director: db.director_name ?? 'Unknown',
    synopsis,
    poster,
    backdrop: poster,
    duration: durationStr,
    trailerUrl: db.movie_imdb_link ?? `https://www.imdb.com/title/${db.imdb_id}/`,
    actors,
    country: db.country,
    language: db.language,
    content_rating: db.content_rating,
    gross: db.gross,
    budget: db.budget,
    num_voted_users: db.num_voted_users,
  }
}

// ─── Recommendation scorer (pure — runs on already-loaded movies) ──────────────
export function getRecommendations(likedIds: string[], allMovies: Movie[]): Movie[] {
  if (likedIds.length === 0) return allMovies.slice(0, 6)

  const liked = allMovies.filter((m) => likedIds.includes(m.id))
  const genreCount: Record<string, number> = {}
  const directorCount: Record<string, number> = {}

  liked.forEach((m) => {
    m.genre.forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1))
    directorCount[m.director] = (directorCount[m.director] || 0) + 1
  })

  return allMovies
    .filter((m) => !likedIds.includes(m.id))
    .map((m) => ({
      movie: m,
      score:
        m.genre.reduce((s, g) => s + (genreCount[g] || 0) * 2, 0) +
        (directorCount[m.director] || 0) * 3 +
        m.rating * 0.5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.movie)
}
