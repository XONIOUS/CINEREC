import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Star, RotateCcw, Clock, Film } from "lucide-react";
import { GENRES, Movie } from "@/data/movies";

interface GenreRecommenderProps {
  movies: Movie[];
}

const GenreRecommender = ({ movies }: GenreRecommenderProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Movie | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const genres = GENRES.filter((g) => g !== "All");

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setRecommendation(null);
  };

  const recommend = () => {
    let pool = movies;
    if (selectedGenres.length > 0) {
      pool = movies.filter((m) =>
        selectedGenres.some((g) => m.genre.includes(g))
      );
    }
    if (pool.length === 0) pool = movies;
    if (pool.length === 0) return; // still loading

    // Pick a random one, avoid repeating the same
    const filtered = recommendation
      ? pool.filter((m) => m.id !== recommendation.id)
      : pool;
    const pick = filtered.length > 0 ? filtered : pool;
    const chosen = pick[Math.floor(Math.random() * pick.length)];

    setIsRevealing(true);
    setRecommendation(null);
    setTimeout(() => {
      setRecommendation(chosen);
      setIsRevealing(false);
    }, 600);
  };

  const reset = () => {
    setSelectedGenres([]);
    setRecommendation(null);
  };

  return (
    <section className="container mb-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            What Should You Watch?
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Pick genres you're in the mood for, or let us surprise you.
          </p>
        </div>

        {/* Genre pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {genres.map((genre) => {
            const active = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={recommend}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:scale-105"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Wand2 className="w-4 h-4" />
            {selectedGenres.length > 0
              ? `Recommend (${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""})`
              : "Surprise Me"}
          </button>
          {(selectedGenres.length > 0 || recommendation) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium text-muted-foreground bg-secondary border border-border hover:text-foreground transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Loading shimmer */}
        <AnimatePresence>
          {isRevealing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10"
            >
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendation result */}
        <AnimatePresence>
          {recommendation && !isRevealing && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl overflow-hidden border border-primary/20 bg-secondary/50"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Poster */}
                <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
                  <img
                    src={recommendation.poster}
                    alt={recommendation.title}
                    className="w-full h-56 sm:h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/50 hidden sm:block" />
                </div>

                {/* Info */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center">
                  <span className="text-primary text-xs font-semibold tracking-wider uppercase mb-2">
                    Our Pick For You
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    {recommendation.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Directed by {recommendation.director}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-primary font-semibold text-sm">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      {recommendation.rating}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {recommendation.duration}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Film className="w-3 h-3" />
                      {recommendation.year}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {recommendation.genre.map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-foreground/70 text-sm leading-relaxed line-clamp-3">
                    {recommendation.synopsis}
                  </p>

                  <button
                    onClick={recommend}
                    className="mt-5 self-start inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground border border-border hover:border-primary hover:text-primary transition-all duration-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Try Another
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GenreRecommender;
