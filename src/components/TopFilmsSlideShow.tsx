import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, TrendingUp } from "lucide-react";
import { Movie } from "@/data/movies";

interface TopFilmsSlideShowProps {
  movies: Movie[];
}

const TopFilmsSlideShow = ({ movies }: TopFilmsSlideShowProps) => {
  const topFilms = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 5);

  // ALL hooks must be declared before any conditional returns (Rules of Hooks)
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + topFilms.length) % topFilms.length);
    },
    [topFilms.length]
  );

  useEffect(() => {
    const timer = setInterval(() => go(1), 5000);
    return () => clearInterval(timer);
  }, [go]);

  // Safe to early-return AFTER all hooks are declared
  if (topFilms.length === 0) {
    return (
      <section className="container mb-14">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Top Films This Month
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card aspect-[21/9] sm:aspect-[3/1] animate-pulse" />
      </section>
    );
  }

  const film = topFilms[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -400 : 400, opacity: 0, scale: 0.95 }),
  };

  return (
    <section className="container mb-14">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Top Films This Month
        </h2>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-border bg-card aspect-[21/9] sm:aspect-[3/1]">
        {/* Backdrop */}
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={film.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={film.backdrop}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content overlay */}
        <div className="relative z-10 flex items-end h-full p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="max-w-lg"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-3 backdrop-blur-sm border border-primary/20">
                #{current + 1} Trending
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-foreground leading-tight">
                {film.title}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <Star className="w-4 h-4 fill-primary" />
                  {film.rating}
                </span>
                <span className="text-muted-foreground text-sm">{film.year}</span>
                <span className="text-muted-foreground text-sm">{film.duration}</span>
                <span className="text-muted-foreground text-sm">• {film.director}</span>
              </div>
              <p className="mt-3 text-foreground/70 text-sm sm:text-base line-clamp-2 leading-relaxed">
                {film.synopsis}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground/80 hover:bg-background/70 hover:text-foreground transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground/80 hover:bg-background/70 hover:text-foreground transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {topFilms.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopFilmsSlideShow;
