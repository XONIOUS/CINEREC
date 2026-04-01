import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, Film, Heart, Users, DollarSign, ExternalLink } from "lucide-react";
import { Movie } from "@/data/movies";
import { useMoviePoster } from "@/hooks/useMovies";

interface MovieModalProps {
  movie: Movie | null;
  isLiked: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
}

const MovieModal = ({ movie, isLiked, onClose, onLike }: MovieModalProps) => {
  // Hook must be called unconditionally — pass empty string when movie is null
  const { data: fetchedPoster } = useMoviePoster(movie?.id ?? '');
  const posterUrl = fetchedPoster ?? movie?.poster ?? '';

  if (!movie) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img
              src={posterUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="relative px-6 pb-6 -mt-16">
            <div className="flex gap-5">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-28 sm:w-32 rounded-lg shadow-[var(--shadow-card)] border-2 border-card flex-shrink-0"
              />
              <div className="pt-16 sm:pt-18 min-w-0">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {movie.title}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Directed by {movie.director}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <Star className="w-4 h-4 fill-primary" />
                    {movie.rating}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {movie.duration}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Film className="w-3.5 h-3.5" />
                    {movie.year}
                  </span>
                  {movie.content_rating && (
                    <span className="px-2 py-0.5 text-xs rounded border border-border text-muted-foreground">
                      {movie.content_rating}
                    </span>
                  )}
                  {movie.num_voted_users != null && (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Users className="w-3 h-3" />
                      {movie.num_voted_users.toLocaleString()} votes
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="mt-4 text-foreground/80 leading-relaxed text-sm sm:text-base">
              {movie.synopsis}
            </p>

            {movie.actors && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/60">Cast: </span>
                {movie.actors}
              </p>
            )}

            {(movie.gross != null || movie.budget != null) && (
              <div className="flex flex-wrap gap-4 mt-3">
                {movie.budget != null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    Budget: ${movie.budget.toLocaleString()}
                  </span>
                )}
                {movie.gross != null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    Gross: ${movie.gross.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => onLike(movie.id)}
              className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                isLiked
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-primary" : ""}`} />
              {isLiked ? "Liked" : "Add to Favorites"}
            </button>
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-secondary border border-border hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              IMDB
            </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;
