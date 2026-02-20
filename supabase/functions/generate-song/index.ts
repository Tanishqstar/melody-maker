import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { songId } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const steps: Array<{ status: string; step: string; delayMs: number }> = [
      { status: "analyzing", step: "Analyzing lyrical structure & emotional cadence", delayMs: 2000 },
      { status: "synthesizing", step: "Synthesizing vocal layers & instrumental tracks", delayMs: 3000 },
      { status: "mastering", step: "Mastering final mix & applying studio effects", delayMs: 2500 },
      { status: "completed", step: "Production complete", delayMs: 0 },
    ];

    for (const s of steps) {
      await supabase.from("songs").update({ status: s.status }).eq("id", songId);
      await supabase.from("processing_logs").insert({
        song_id: songId,
        step_name: s.step,
      });
      if (s.delayMs > 0) {
        await new Promise((r) => setTimeout(r, s.delayMs));
      }
    }

    // Simulate final metadata
    await supabase.from("songs").update({
      bpm: Math.floor(Math.random() * 60) + 80,
      duration: Math.floor(Math.random() * 120) + 120,
    }).eq("id", songId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-song error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
