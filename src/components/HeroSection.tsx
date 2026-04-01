import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  likedCount: number;
  onGetRecs: () => void;
}

const HeroSection = ({ likedCount, onGetRecs }: HeroSectionProps) => {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(38_90%_55%/0.06),transparent_60%)]" />
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Discover Your Next{" "}
            <span className="text-gradient-gold">Favorite Film</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Like movies you love, and we'll curate personalized recommendations
            just for you.
          </p>
        </motion.div>

        {likedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <button
              onClick={onGetRecs}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:scale-105"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Sparkles className="w-5 h-5" />
              Get Recommendations ({likedCount} liked)
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
