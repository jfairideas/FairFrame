import { buildChiefSystemPrompt, buildChiefUserPrompt } from "./chiefPrompt.ts";
import {
  ethicsRefusalPayload,
  screenImageEthics,
  type EthicsScreenResponse,
} from "./ethicsScreen.ts";
import {
  getAuthenticatedUser,
  getServiceClient,
  isFounderEmail,
  MAX_IMAGE_BASE64_LENGTH,
  parseFounderEmails,
  registerRequestId,
  reserveDailySlot,
} from "./chiefGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  imageBase64: string;
  requestId?: string;
  session?: Record<string, never>;
  mode?: "ethics_screen" | "analyze";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return json(
        { error: "openai_not_configured", message: "OPENAI_API_KEY is not configured" },
        503
      );
    }

    const founders = parseFounderEmails();
    if (founders.size === 0) {
      return json(
        {
          error: "founder_not_configured",
          message: "FOUNDER_EMAILS secret is not set — Live Chief disabled",
        },
        503
      );
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return json(
        {
          error: "auth_required",
          message: "Sign in with your founder account to use Live Chief",
        },
        401
      );
    }

    if (!isFounderEmail(user.email, founders)) {
      return json(
        {
          error: "founder_only",
          message: "Live Chief is founder-only during beta testing",
        },
        403
      );
    }

    const body = (await req.json()) as AnalyzeRequest;
    if (!body?.imageBase64) {
      return json(
        { error: "invalid_request", message: "imageBase64 is required" },
        400
      );
    }

    if (body.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return json(
        { error: "image_too_large", message: "Image payload exceeds maximum allowed size" },
        413
      );
    }

    const admin = getServiceClient();
    const ethics = await screenImageEthics(openaiKey, body.imageBase64);
    await logEthicsScreening(admin, user.id, ethics);

    if (body.mode === "ethics_screen") {
      if (ethics.safety_tier === "red") {
        return json(ethicsRefusalPayload(ethics), 200);
      }
      return json(ethics, 200);
    }

    if (ethics.safety_tier === "red") {
      return json(ethicsRefusalPayload(ethics), 200);
    }

    const dedup = await registerRequestId(admin, user.id, body.requestId);
    if (!dedup.ok) {
      return json({ error: dedup.code, message: dedup.message }, 429);
    }

    const slot = await reserveDailySlot(admin, user.id);
    if (!slot.ok) {
      return json({ error: slot.code, message: slot.message }, 429);
    }

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
              { type: "text", text: buildChiefUserPrompt({}) },
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
      return json({ error: "openai_error", message: `OpenAI error: ${errText}` }, 502);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return json({ error: "empty_response", message: "Empty model response" }, 502);
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;
    return json(
      {
        ...parsed,
        safety_tier: ethics.safety_tier,
        reason_code: ethics.reason_code,
        analysis_allowed: ethics.analysis_allowed,
        recognition_allowed: ethics.recognition_allowed,
        card_allowed: ethics.card_allowed,
        progress_allowed: ethics.progress_allowed,
      },
      200
    );
  } catch (e) {
    return json(
      {
        error: "analysis_failed",
        message: e instanceof Error ? e.message : "Analysis failed",
      },
      500
    );
  }
});

async function logEthicsScreening(
  admin: ReturnType<typeof getServiceClient>,
  userId: string,
  ethics: EthicsScreenResponse
) {
  await admin.from("ethics_screenings").insert({
    user_id: userId,
    safety_tier: ethics.safety_tier,
    reason_code: ethics.reason_code,
    analysis_allowed: ethics.analysis_allowed,
    recognition_allowed: ethics.recognition_allowed,
    card_allowed: ethics.card_allowed,
    progress_allowed: ethics.progress_allowed,
  });
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
