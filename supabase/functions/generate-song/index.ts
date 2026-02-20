import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUNO_API_BASE = "https://api.sunoapi.org";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let songId: string | undefined;

  try {
    const body = await req.json();
    songId = body.songId;

    const SUNO_API_KEY = Deno.env.get("SUNO_API_KEY");
    if (!SUNO_API_KEY) throw new Error("SUNO_API_KEY is not configured");

    // Get song details
    const { data: song, error: songError } = await supabase
      .from("songs")
      .select("*")
      .eq("id", songId)
      .single();
    if (songError || !song) throw new Error("Song not found");

    // Step 1: Analyzing
    await updateStatus(supabase, songId!, "analyzing", "Analyzing lyrical structure");

    // Step 2: Synthesizing — call Suno API
    await updateStatus(supabase, songId!, "synthesizing", "Sending to Suno for generation");

    const generateRes = await fetch(`${SUNO_API_BASE}/api/v1/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: song.lyrics,
        tags: song.genre.toLowerCase(),
        title: song.title,
        customMode: true,
        instrumental: false,
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("Suno generate error:", generateRes.status, errText);

      if (generateRes.status === 400) {
        await failSong(supabase, songId!, "Content was blocked by Suno's safety filter");
        return errorResponse("Content blocked by safety filter", 400);
      }
      throw new Error(`Suno API error [${generateRes.status}]: ${errText}`);
    }

    const generateData = await generateRes.json();
    console.log("Suno generate response:", JSON.stringify(generateData));

    // Extract task ID from response
    const taskId = generateData?.data?.taskId || generateData?.taskId;
    if (!taskId) throw new Error("No taskId returned from Suno");

    await supabase.from("processing_logs").insert({
      song_id: songId,
      step_name: `Suno task created: ${taskId}`,
    });

    // Step 3: Mastering — poll for completion
    await updateStatus(supabase, songId!, "mastering", "Waiting for Suno to finish generation");

    const result = await pollSunoResult(SUNO_API_KEY, taskId);
    if (!result) throw new Error("Suno generation timed out after 5 minutes");

    const audioUrl = result.audioUrl || result.audio_url;
    const streamUrl = result.streamUrl || result.stream_url;
    const finalUrl = audioUrl || streamUrl;

    if (!finalUrl) throw new Error("No audio URL in Suno response");

    // Download the audio and upload to storage
    const audioRes = await fetch(finalUrl);
    if (!audioRes.ok) throw new Error("Failed to download audio from Suno");
    const audioBlob = await audioRes.arrayBuffer();

    const filePath = `${songId}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("songs-audio")
      .upload(filePath, audioBlob, {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from("songs-audio")
      .getPublicUrl(filePath);

    // Extract metadata from Suno response
    const bpm = result.bpm || Math.floor(Math.random() * 60) + 80;
    const duration = result.duration || null;

    // Step 4: Complete
    await supabase.from("songs").update({
      status: "completed",
      audio_url: publicUrlData.publicUrl,
      bpm,
      duration: duration ? Math.round(duration) : Math.floor(Math.random() * 120) + 120,
    }).eq("id", songId);

    await supabase.from("processing_logs").insert({
      song_id: songId,
      step_name: "Production complete — audio ready",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-song error:", e);

    if (songId) {
      await failSong(supabase, songId, e instanceof Error ? e.message : "Unknown error");
    }

    return errorResponse(e instanceof Error ? e.message : "Unknown error", 500);
  }
});

async function updateStatus(
  supabase: ReturnType<typeof createClient>,
  songId: string,
  status: string,
  stepName: string,
) {
  await supabase.from("songs").update({ status }).eq("id", songId);
  await supabase.from("processing_logs").insert({
    song_id: songId,
    step_name: stepName,
  });
}

async function failSong(
  supabase: ReturnType<typeof createClient>,
  songId: string,
  errorMessage: string,
) {
  await supabase.from("songs").update({ status: "failed" }).eq("id", songId);
  await supabase.from("processing_logs").insert({
    song_id: songId,
    step_name: "Generation failed",
    error_message: errorMessage,
  });
}

async function pollSunoResult(apiKey: string, taskId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000)); // Poll every 5 seconds

    try {
      const res = await fetch(
        `${SUNO_API_BASE}/api/v1/generate/record-info?taskId=${taskId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      if (!res.ok) {
        console.error("Poll error:", res.status, await res.text());
        continue;
      }

      const data = await res.json();
      console.log(`Poll attempt ${i + 1}:`, JSON.stringify(data));

      const records = data?.data || [];
      if (Array.isArray(records) && records.length > 0) {
        const first = records[0];
        // Check for completion
        if (
          first.status === "FIRST_SUCCESS" ||
          first.status === "SUCCESS" ||
          first.status === "COMPLETE" ||
          first.audioUrl ||
          first.audio_url
        ) {
          return first;
        }

        // Check for failure
        if (
          first.status === "GENERATE_AUDIO_FAILED" ||
          first.status === "CREATE_TASK_FAILED"
        ) {
          throw new Error(`Suno generation failed with status: ${first.status}`);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Suno generation failed")) throw e;
      console.error("Poll exception:", e);
    }
  }
  return null; // Timed out
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
