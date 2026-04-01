# Frontend Reference — CineRecStack

## Table of Contents
1. [Vite 6 Config](#vite-6-config)
2. [Tailwind CSS v4 Setup](#tailwind-css-v4-setup)
3. [TypeScript Config](#typescript-config)
4. [Key Components](#key-components)
5. [Routing](#routing)
6. [State Management Pattern](#state-management-pattern)
7. [Performance Tips](#performance-tips)

---

## Vite 6 Config

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),           // Fast Refresh + JSX transform
    tailwindcss(),     // Tailwind v4 via Vite plugin (no postcss.config needed)
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  // Prevent Supabase URL/key from being visible in error overlays
  define: {
    'process.env': {},
  },
})
```

**Install commands**:
```bash
npm create vite@latest cinerecstak -- --template react-ts
cd cinerecstak
npm install react-router-dom @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite
```

---

## Tailwind CSS v4 Setup

Tailwind v4 uses the Vite plugin — no `postcss.config.js` or `tailwind.config.js` needed.

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* CineRec brand tokens */
  --color-cine-bg: #0f0f13;
  --color-cine-surface: #1a1a24;
  --color-cine-border: #2a2a38;
  --color-cine-accent: #e63946;
  --color-cine-gold: #f4a261;
  --color-cine-text: #e2e8f0;
  --color-cine-muted: #94a3b8;

  --font-display: 'Inter', system-ui, sans-serif;
  --radius-card: 12px;
}
```

Usage in components: `className="bg-[--color-cine-surface] text-[--color-cine-text]"`

---

## TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": { "@/*": ["./src/*"] },
    "skipLibCheck": true
  }
}
```

---

## Key Components

### MovieCard.tsx
```tsx
// src/components/MovieCard.tsx
import { Movie } from '@/lib/types'
import { getPosterUrl } from '@/lib/omdb'

interface Props {
  movie: Movie
  onAddToWatchlist?: (movieId: string) => void
  rating?: number | null
  inWatchlist?: boolean
}

export function MovieCard({ movie, onAddToWatchlist, rating, inWatchlist }: Props) {
  const poster = getPosterUrl(movie.imdb_id, movie.poster_url)

  return (
    <div className="group relative rounded-[--radius-card] overflow-hidden
                    bg-[--color-cine-surface] border border-[--color-cine-border]
                    hover:border-[--color-cine-accent] transition-all duration-200">
      <div className="aspect-[2/3] relative">
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback placeholder
            (e.target as HTMLImageElement).src = '/placeholder-poster.svg'
          }}
        />
        {inWatchlist && (
          <div className="absolute top-2 right-2 bg-[--color-cine-accent]
                          text-white text-xs px-2 py-0.5 rounded-full">
            Saved
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[--color-cine-text] truncate text-sm">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[--color-cine-muted] text-xs">{movie.year}</span>
          {movie.imdb_rating && (
            <span className="text-[--color-cine-gold] text-xs font-medium">
              ⭐ {movie.imdb_rating}
            </span>
          )}
        </div>
        {movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genre.slice(0, 2).map(g => (
              <span key={g}
                className="text-[10px] px-1.5 py-0.5 rounded
                           bg-[--color-cine-border] text-[--color-cine-muted]">
                {g}
              </span>
            ))}
          </div>
        )}
        {onAddToWatchlist && !inWatchlist && (
          <button
            onClick={() => onAddToWatchlist(movie.id)}
            className="mt-2 w-full text-xs py-1.5 rounded
                       bg-[--color-cine-accent] text-white
                       hover:opacity-90 transition-opacity"
          >
            + Watchlist
          </button>
        )}
      </div>
    </div>
  )
}
```

### SearchBar.tsx
```tsx
// src/components/SearchBar.tsx
import { useState } from 'react'
import { useMovieSearch } from '@/hooks/useOMDB'
import { syncMovieToSupabase } from '@/lib/syncMovie'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const { results, loading, error } = useMovieSearch(query)

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search movies..."
        className="w-full px-4 py-3 rounded-xl
                   bg-[--color-cine-surface] border border-[--color-cine-border]
                   text-[--color-cine-text] placeholder:text-[--color-cine-muted]
                   focus:outline-none focus:border-[--color-cine-accent]"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-cine-muted]">
          ⟳
        </div>
      )}
      {results.length > 0 && query && (
        <div className="absolute top-full mt-1 w-full z-50
                        bg-[--color-cine-surface] border border-[--color-cine-border]
                        rounded-xl overflow-hidden shadow-xl max-h-80 overflow-y-auto">
          {results.map(r => (
            <button
              key={r.imdbID}
              onClick={async () => {
                await syncMovieToSupabase(r.imdbID)
                setQuery('')
              }}
              className="flex items-center gap-3 w-full p-3
                         hover:bg-[--color-cine-border] transition-colors text-left"
            >
              <img src={r.Poster !== 'N/A' ? r.Poster : '/placeholder-poster.svg'}
                   alt={r.Title} className="w-8 h-12 object-cover rounded" />
              <div>
                <p className="text-[--color-cine-text] text-sm font-medium">{r.Title}</p>
                <p className="text-[--color-cine-muted] text-xs">{r.Year} · {r.imdbID}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### MovieGrid.tsx
```tsx
// src/components/MovieGrid.tsx
import { Movie } from '@/lib/types'
import { MovieCard } from './MovieCard'

interface Props {
  movies: Movie[]
  loading?: boolean
  onAddToWatchlist?: (movieId: string) => void
  watchlistIds?: Set<string>
}

export function MovieGrid({ movies, loading, onAddToWatchlist, watchlistIds }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-[--radius-card]
                                   bg-[--color-cine-surface] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onAddToWatchlist={onAddToWatchlist}
          inWatchlist={watchlistIds?.has(movie.id)}
        />
      ))}
    </div>
  )
}
```

---

## Routing

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Home from '@/pages/Home'
import Movie from '@/pages/Movie'
import Watchlist from '@/pages/Watchlist'
import Auth from '@/pages/Auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[--color-cine-bg]" />
  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:imdbId" element={<Movie />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/watchlist" element={
          <ProtectedRoute><Watchlist /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
```

Note: Movie detail page uses `imdbId` as the URL param — this lets you deep-link directly to OMDB data without a Supabase lookup first.

---

## State Management Pattern

No Redux/Zustand needed for this app. Use:
- **Supabase real-time** for watchlist sync across tabs
- **React Query (TanStack Query)** for server state caching
- **React context** for auth state only

```bash
npm install @tanstack/react-query
```

```tsx
// src/hooks/useWatchlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useWatchlist(userId: string | undefined) {
  const qc = useQueryClient()

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_movies')
        .select('*, movie:movies(*)')
        .eq('user_id', userId!)
        .order('added_at', { ascending: false })
      return data ?? []
    },
  })

  const addToWatchlist = useMutation({
    mutationFn: async (movieId: string) => {
      await supabase.from('user_movies').upsert({
        user_id: userId!,
        movie_id: movieId,
        status: 'watchlist',
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist', userId] }),
  })

  return { watchlist, isLoading, addToWatchlist }
}
```

---

## Performance Tips

1. **Lazy load images**: Use `loading="lazy"` on all poster `<img>` tags
2. **Code splitting**: Route-level lazy loading with `React.lazy()`
3. **Debounce search**: 400ms debounce on OMDB search calls
4. **Skeleton screens**: Show aspect-ratio placeholders while loading
5. **Poster sizing**: OMDB returns `_SX300.jpg` suffix — for larger cards, change to `_SX500.jpg`
6. **React Query stale time**: Set `staleTime: 5 * 60 * 1000` for movie details (they rarely change)
