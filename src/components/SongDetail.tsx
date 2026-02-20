import type { Song } from "@/hooks/useSongs";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";
import PipelineStatus from "./PipelineStatus";

export default function SongDetail({ song }: { song: Song | null }) {
  const [playing, setPlaying] = useState(false);

  if (!song) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a track to view details</p>
      </div>
    );
  }

  const isReady = song.status === "completed";

  return (
    <motion.div
      key={song.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground">{song.title}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {song.genre}
          </span>
          {song.bpm && <span className="text-xs text-muted-foreground">{song.bpm} BPM</span>}
          {song.duration && (
            <span className="text-xs text-muted-foreground">
              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {/* Pipeline / Player */}
      <div className="p-5 flex-1 overflow-auto">
        {!isReady ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Production in progress...</p>
            <PipelineStatus status={song.status} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fake waveform */}
            <div className="h-20 rounded-lg bg-muted/50 flex items-center justify-center gap-[2px] px-4 overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => {
                const h = Math.random() * 60 + 10;
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary/60"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>

            {/* Transport */}
            <div className="flex items-center justify-center gap-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Volume2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground studio-glow-sm hover:bg-primary/90 transition-all"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Lyrics */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Lyrics</h3>
          <pre className="text-sm text-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-4">
            {song.lyrics}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
