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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
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
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl studio-glow"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">New Production</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Track Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Song"
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Genre / Style</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        genre === g
                          ? "bg-primary text-primary-foreground studio-glow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Lyrics</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder={"[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\n..."}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 studio-glow-sm font-semibold"
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
