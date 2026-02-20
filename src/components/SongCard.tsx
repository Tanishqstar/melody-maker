import { motion } from "framer-motion";
import { Music, Clock, Disc3 } from "lucide-react";
import type { Song } from "@/hooks/useSongs";
import PipelineStatus from "./PipelineStatus";

export default function SongCard({
  song,
  onSelect,
  selected,
}: {
  song: Song;
  onSelect: (song: Song) => void;
  selected: boolean;
}) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(song)}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
        selected
          ? "border-primary/50 bg-primary/5 studio-glow-sm"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {song.status === "completed" ? (
            <Disc3 className="h-6 w-6 text-primary" />
          ) : (
            <Music className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {song.genre}
            </span>
            {song.bpm && (
              <span className="text-xs text-muted-foreground">{song.bpm} BPM</span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(song.duration)}
            </span>
          </div>
        </div>
      </div>
      
      {song.status !== "completed" && (
        <div className="mt-3">
          <PipelineStatus status={song.status} />
        </div>
      )}
    </motion.div>
  );
}
