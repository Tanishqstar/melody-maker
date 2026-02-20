import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Disc3, Loader2 } from "lucide-react";
import { useSongs, type Song } from "@/hooks/useSongs";
import CreateSongDialog from "@/components/CreateSongDialog";
import SongCard from "@/components/SongCard";
import SongDetail from "@/components/SongDetail";
import Visualizer3D from "@/components/Visualizer3D";

const Index = () => {
  const { songs, loading, retrySong } = useSongs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  return (
    <div className="min-h-screen bg-background studio-noise">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 relative z-10">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 studio-glow-sm">
              <Disc3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">SoundForge</h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">AI Production Studio</p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 studio-glow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Track
          </button>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row relative z-10" style={{ height: "calc(100vh - 65px)" }}>
        {/* Left: Song list */}
        <div className="w-full lg:w-80 border-r border-border overflow-auto p-4 space-y-3 shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Productions ({songs.length})
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No tracks yet</p>
              <button
                onClick={() => setDialogOpen(true)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Create your first track
              </button>
            </div>
          ) : (
            songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onSelect={setSelectedSong}
                selected={selectedSong?.id === song.id}
                onRetry={retrySong}
              />
            ))
          )}
        </div>

        {/* Center: Detail + Player */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <SongDetail song={selectedSong} />
        </div>

        {/* Right: 3D Visualizer */}
        <div className="hidden xl:flex w-80 shrink-0 flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Visualizer
            </h2>
          </div>
          <div className="flex-1 p-2">
            <Visualizer3D />
          </div>
        </div>
      </div>

      <CreateSongDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default Index;
