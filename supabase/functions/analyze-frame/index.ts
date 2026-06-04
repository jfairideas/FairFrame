import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildChiefSystemPrompt, buildChiefUserPrompt } from "./chiefPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  imageBase64: string;
  session: {
    phase: "initial" | "enhanced";
    storyContext?: {
      assignmentTitle: string;
      storyBeat: string;
      audience?: string;
    } | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return json({ error: "OPENAI_API_KEY is not configured on the edge function" }, 503);
    }

    const body = (await req.json()) as AnalyzeRequest;
    if (!body?.imageBase64 || !body?.session) {
      return json({ error: "imageBase64 and session are required" }, 400);
    }

    const captureSession = {
      phase: body.session.phase ?? "initial",
      storyContext: body.session.storyContext ?? undefined,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.4,
        max_tokens: 2800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildChiefSystemPrompt() },
          {
            role: "user",
            content: [
              { type: "text", text: buildChiefUserPrompt(captureSession) },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${body.imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return json({ error: `OpenAI error: ${errText}` }, 502);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return json({ error: "Empty model response" }, 502);
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;

    // Optional: verify caller when saving server-side later
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
    }

    return json(parsed, 200);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      500
    );
  }
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
