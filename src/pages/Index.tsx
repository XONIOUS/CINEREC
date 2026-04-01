import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { GENRES, getRecommendations } from "@/data/movies";
import type { Movie } from "@/data/movies";
import { useMovies, useTopMovies } from "@/hooks/useMovies";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import HeroSection from "@/components/HeroSection";
import TopFilmsSlideShow from "@/components/TopFilmsSlideShow";
import GenreRecommender from "@/components/GenreRecommender";

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showRecs, setShowRecs] = useState(false);

  // Live data from Supabase — search/filter handled server-side
  const { data: movies = [], isLoading, isError, error } = useMovies(
    activeGenre !== "All" ? activeGenre : null,
    search
  );
  const { data: topMovies = [] } = useTopMovies();

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const recommendations = useMemo(
    () => getRecommendations(likedIds, movies),
    [likedIds, movies]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center justify-between h-16">
          <h2 className="font-display text-xl font-bold text-gradient-gold tracking-wide">
            CineRec
          </h2>
          <div className="relative w-64 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies or directors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </nav>

      <HeroSection
        likedCount={likedIds.length}
        onGetRecs={() => setShowRecs(true)}
      />

      <TopFilmsSlideShow movies={topMovies} />

      {/* Recommendations overlay */}
      <AnimatePresence>
        {showRecs && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="container mb-12"
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Recommended For You
                  </h2>
                </div>
                <button
                  onClick={() => setShowRecs(false)}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map((movie, i) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={i}
                    isLiked={likedIds.includes(movie.id)}
                    onLike={toggleLike}
                    onClick={setSelectedMovie}
                  />
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <GenreRecommender movies={movies} />

      {/* Genre tabs */}
      <div className="container mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeGenre === genre
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movie grid */}
      <section className="container pb-20">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-destructive font-medium">Supabase query failed</p>
            <p className="text-muted-foreground text-sm font-mono">
              {(error as Error)?.message ?? 'Unknown error — check browser console'}
            </p>
            <p className="text-muted-foreground text-xs mt-3">
              Most likely fix: disable RLS on <code>public.movies_db</code> in Supabase Dashboard → Table Editor → RLS
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 pt-6 pb-8">
              {movies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={i}
                  isLiked={likedIds.includes(movie.id)}
                  onLike={toggleLike}
                  onClick={setSelectedMovie}
                />
              ))}
            </div>
            {movies.length === 0 && !isLoading && (
              <div className="py-20 text-center space-y-2">
                <p className="text-muted-foreground text-lg">No movies returned from Supabase.</p>
                <p className="text-muted-foreground text-sm">
                  Check: 1) RLS is disabled on <code>movies_db</code> &nbsp;
                  2) Table has rows with non-null <code>imdb_score</code> &nbsp;
                  3) Open browser console (F12) and look for <code>[useMovies]</code> log
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Movie detail modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isLiked={likedIds.includes(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onLike={toggleLike}
        />
      )}
    </div>
  );
};

export default Index;
