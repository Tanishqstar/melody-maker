import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Disc3, Loader2, Headphones, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background ambient-bg">
      {/* Floating Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 studio-glow-sm">
                <Disc3 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">SoundForge</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">AI Studio</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground studio-glow-sm transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Track
          </motion.button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedSong ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SongDetail song={selectedSong} onBack={() => setSelectedSong(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero section when empty */}
              {!loading && songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                  <div className="w-48 h-48 mb-8 rounded-full bg-primary/5 flex items-center justify-center studio-glow">
                    <Headphones className="h-20 w-20 text-primary/40" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
                    Create Something <span className="text-gradient-primary">Incredible</span>
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                    Transform your lyrics into full-production tracks with AI-powered music generation.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground studio-glow transition-all hover:brightness-110"
                  >
                    <Sparkles className="h-5 w-5" />
                    Create Your First Track
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Tracks</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{songs.length} production{songs.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Song Grid */}
                  {loading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {songs.map((song, i) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onSelect={setSelectedSong}
                          selected={selectedSong?.id === song.id}
                          onRetry={retrySong}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient 3D visualizer at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none opacity-30 z-0">
        <Visualizer3D />
      </div>

      <CreateSongDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default Index;
