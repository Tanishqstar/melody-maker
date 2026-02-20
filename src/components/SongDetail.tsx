import type { Song } from "@/hooks/useSongs";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import PipelineStatus from "./PipelineStatus";

export default function SongDetail({ song }: { song: Song | null }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset playback state when song changes
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
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
    setMuted(!muted);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!song) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a track to view details</p>
      </div>
    );
  }

  const isReady = song.status === "completed";
  const hasAudio = !!song.audio_url;

  return (
    <motion.div
      key={song.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full"
    >
      {/* Hidden audio element */}
      {hasAudio && (
        <audio
          ref={(el) => {
            audioRef.current = el;
            if (el) el.volume = volume;
          }}
          src={song.audio_url!}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setPlaying(false)}
        />
      )}

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
            {!hasAudio && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border p-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Audio generation is simulated — no audio file was produced. Connect a real music API to generate playable tracks.
                </p>
              </div>
            )}

            {/* Waveform placeholder */}
            <div className="h-20 rounded-lg bg-muted/50 flex items-center justify-center gap-[2px] px-4 overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => {
                const h = 20 + Math.abs(Math.sin(i * 0.3)) * 60;
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary/60"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>

            {/* Time display */}
            {hasAudio && (
              <div className="flex justify-between text-[10px] text-muted-foreground px-1 -mt-4">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}

            {/* Transport */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                onClick={togglePlay}
                disabled={!hasAudio}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  hasAudio
                    ? "bg-primary text-primary-foreground studio-glow-sm hover:bg-primary/90 cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
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
