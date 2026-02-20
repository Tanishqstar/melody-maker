import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Music, Clock, Disc3, RotateCcw, Zap } from "lucide-react";
import type { Song } from "@/hooks/useSongs";
import PipelineStatus from "./PipelineStatus";
import { Button } from "./ui/button";

const SongCard = forwardRef<
  HTMLDivElement,
  { song: Song; onSelect: (song: Song) => void; selected: boolean; onRetry?: (songId: string) => void; index?: number }
>(({ song, onSelect, selected, onRetry, index = 0 }, ref) => {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isProcessing = !["completed", "failed"].includes(song.status);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect(song)}
      className="group cursor-pointer rounded-2xl border border-border/60 bg-card/60 glass-card p-5 transition-all duration-300 hover:border-primary/30 hover:studio-glow-sm"
    >
      {/* Top row: icon + genre badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
          song.status === "completed"
            ? "bg-primary/15 group-hover:bg-primary/25"
            : isProcessing
            ? "bg-accent/10 animate-pulse-glow"
            : "bg-destructive/10"
        }`}>
          {song.status === "completed" ? (
            <Disc3 className="h-6 w-6 text-primary" />
          ) : isProcessing ? (
            <Zap className="h-6 w-6 text-accent" />
          ) : (
            <Music className="h-6 w-6 text-destructive/70" />
          )}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {song.genre}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-foreground text-lg mb-2 truncate group-hover:text-primary transition-colors">
        {song.title}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {song.bpm && <span>{song.bpm} BPM</span>}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(song.duration)}
        </span>
      </div>

      {/* Status */}
      {song.status === "failed" && onRetry && (
        <div className="mt-4 flex items-center gap-2">
          <PipelineStatus status={song.status} />
          <Button
            size="sm"
            variant="outline"
            className="ml-auto text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onRetry(song.id); }}
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4">
          <PipelineStatus status={song.status} />
        </div>
      )}
    </motion.div>
  );
});

SongCard.displayName = "SongCard";
export default SongCard;
