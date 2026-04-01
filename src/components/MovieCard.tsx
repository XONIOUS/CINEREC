import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Play } from "lucide-react";
import { Movie } from "@/data/movies";

interface MovieCardProps {
  movie: Movie;
  index: number;
  isLiked: boolean;
  onLike: (id: number) => void;
  onClick: (movie: Movie) => void;
}

const MovieCard = ({ movie, index, isLiked, onLike, onClick }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative cursor-pointer"
      style={{ zIndex: isHovered ? 30 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tucked card wrapper */}
      <div
        className="relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: isHovered
            ? "translateY(-40px) scale(1.15) rotateX(2deg)"
            : "translateY(0) scale(1) rotateX(0deg)",
          transformOrigin: "center bottom",
          perspective: "800px",
        }}
      >
        {/* Stacked shadow cards behind */}
        <div
          className="absolute inset-0 rounded-lg bg-muted/40 border border-border/30 transition-all duration-500"
          style={{
            transform: isHovered
              ? "translateY(12px) scale(0.94) rotate(-2deg)"
              : "translateY(4px) scale(0.97) rotate(-0.5deg)",
          }}
        />
        <div
          className="absolute inset-0 rounded-lg bg-muted/25 border border-border/20 transition-all duration-500"
          style={{
            transform: isHovered
              ? "translateY(24px) scale(0.88) rotate(1.5deg)"
              : "translateY(8px) scale(0.94) rotate(0.5deg)",
          }}
        />

        {/* Main card */}
        <div
          className="relative overflow-hidden rounded-lg aspect-[2/3] shadow-[var(--shadow-card)] transition-shadow duration-500"
          style={{
            boxShadow: isHovered
              ? "0 25px 60px -10px hsl(0 0% 0% / 0.7), 0 0 40px -5px hsl(38 90% 55% / 0.15)"
              : "var(--shadow-card)",
          }}
        >
          {/* Poster (default) */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              opacity: isHovered ? 0 : 1,
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
            loading="lazy"
          />

          {/* Trailer preview (on hover) — uses backdrop as cinematic preview */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <img
              src={movie.backdrop}
              alt=""
              className="w-full h-full object-cover"
              style={{
                animation: isHovered ? "slowZoom 8s ease-in-out forwards" : "none",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

            {/* Play button overlay */}
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </a>
          </div>

          {/* Bottom info */}
          <div
            className="absolute bottom-0 left-0 right-0 p-3 transition-all duration-400"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <h3 className="font-display text-sm sm:text-base font-semibold text-foreground leading-tight truncate">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-xs text-primary font-medium">{movie.rating}</span>
              <span className="text-xs text-muted-foreground">• {movie.year}</span>
            </div>
          </div>

          {/* Like button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(movie.id);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isLiked
                ? "bg-primary/20 text-primary"
                : "bg-background/40 text-foreground/60 hover:text-primary"
            }`}
            style={{ opacity: isLiked || isHovered ? 1 : 0 }}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-primary" : ""}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
