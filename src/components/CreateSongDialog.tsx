import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSongs } from "@/hooks/useSongs";
import { toast } from "sonner";

const GENRES = [
  "Pop", "R&B", "Hip-Hop", "Rock", "Electronic",
  "Jazz", "Classical", "Country", "Indie", "Lo-Fi",
];

const Overlay = forwardRef<HTMLDivElement, { onClose: () => void; children: React.ReactNode }>(
  ({ onClose, children }, ref) => (
    <motion.div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={onClose} />
      {children}
    </motion.div>
  )
);
Overlay.displayName = "Overlay";

export default function CreateSongDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { createSong } = useSongs();

  const handleSubmit = async () => {
    if (!title.trim() || !lyrics.trim() || !genre) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await createSong(title, lyrics, genre);
      toast.success("Song queued for production!");
      setTitle("");
      setLyrics("");
      setGenre("");
      onClose();
    } catch {
      toast.error("Failed to create song");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Overlay onClose={onClose}>
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-3xl border border-border/60 bg-card/80 glass-card p-7 shadow-2xl"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 studio-glow-sm">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">New Production</h2>
                  <p className="text-xs text-muted-foreground">Create an AI-generated track</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Track Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Midnight Dreams"
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Genre / Style</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGenre(g)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        genre === g
                          ? "bg-primary text-primary-foreground studio-glow-sm"
                          : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Lyrics</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder={"[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\n..."}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground font-mono text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 resize-none transition-all"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:brightness-110 studio-glow-sm font-bold text-sm"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {submitting ? "Queuing..." : "Start Production"}
              </Button>
            </div>
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
