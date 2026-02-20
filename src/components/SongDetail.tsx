import type { Song } from "@/hooks/useSongs";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, VolumeX, AlertCircle, ArrowLeft, Disc3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import PipelineStatus from "./PipelineStatus";

export default function SongDetail({ song, onBack }: { song: Song | null; onBack?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [song?.id]);

  const togglePlay = () => {
    if (!audioRef.current || !song?.audio_url) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!song) return null;

  const isReady = song.status === "completed";
  const hasAudio = !!song.audio_url;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {hasAudio && (
        <audio
          ref={(el) => { audioRef.current = el; if (el) el.volume = volume; }}
          src={song.audio_url!}
          onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
          onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to tracks
        </button>
      )}

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/60 bg-card/60 glass-card overflow-hidden"
      >
        {/* Cover area */}
        <div className="relative p-8 pb-6 studio-gradient">
          <div className="flex items-start gap-6">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${
              isReady ? "bg-primary/15 studio-glow-sm" : "bg-muted"
            }`}>
              <Disc3 className={`h-12 w-12 ${isReady ? "text-primary" : "text-muted-foreground"} ${playing ? "animate-spin" : ""}`} style={playing ? { animationDuration: "3s" } : {}} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {song.genre}
              </span>
              <h2 className="text-3xl font-extrabold text-foreground mt-2 truncate">{song.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {song.bpm && <span>{song.bpm} BPM</span>}
                {song.duration && <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Player section */}
        <div className="p-8 pt-4">
          {!isReady ? (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Production in progress...</p>
              <PipelineStatus status={song.status} />
            </div>
          ) : (
            <div className="space-y-5">
              {!hasAudio && (
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border p-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">Audio generation pending — connect the Suno API to produce playable tracks.</p>
                </div>
              )}

              {/* Waveform / Progress Bar */}
              <div className="space-y-2">
                <div
                  onClick={seek}
                  className="relative h-16 rounded-xl bg-muted/40 overflow-hidden cursor-pointer group"
                >
                  {/* Waveform bars */}
                  <div className="absolute inset-0 flex items-center gap-[1.5px] px-3">
                    {Array.from({ length: 100 }).map((_, i) => {
                      const h = 20 + Math.abs(Math.sin(i * 0.3)) * 60;
                      const isPlayed = (i / 100) * 100 <= progress;
                      return (
                        <div
                          key={i}
                          className={`w-[2px] rounded-full transition-colors duration-150 ${
                            isPlayed ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-muted-foreground/30"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {hasAudio && (
                  <div className="flex justify-between text-[11px] text-muted-foreground px-1 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                )}
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-center gap-5">
                <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors p-2">
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  disabled={!hasAudio}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                    hasAudio
                      ? "bg-primary text-primary-foreground studio-glow-sm hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </motion.button>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Lyrics */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lyrics</h3>
            <pre className="text-sm text-foreground/75 font-mono whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-2xl p-5 border border-border/40">
              {song.lyrics}
            </pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
