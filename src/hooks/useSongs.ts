import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Song = {
  id: string;
  user_id: string | null;
  title: string;
  lyrics: string;
  genre: string;
  audio_url: string | null;
  status: "queued" | "analyzing" | "synthesizing" | "mastering" | "completed" | "failed";
  cover_art_url: string | null;
  bpm: number | null;
  duration: number | null;
  created_at: string;
  updated_at: string;
};

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setSongs(data as Song[]);
      setLoading(false);
    };
    fetchSongs();

    // Realtime subscription
    const channel = supabase
      .channel("songs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "songs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSongs((prev) => [payload.new as Song, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSongs((prev) =>
              prev.map((s) => (s.id === (payload.new as Song).id ? (payload.new as Song) : s))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createSong = async (title: string, lyrics: string, genre: string) => {
    const { data, error } = await supabase
      .from("songs")
      .insert({ title, lyrics, genre })
      .select()
      .single();
    
    if (error) throw error;
    
    // Trigger generation
    supabase.functions.invoke("generate-song", {
      body: { songId: data.id },
    });

    return data;
  };

  return { songs, loading, createSong };
}
