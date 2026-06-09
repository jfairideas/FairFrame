export type SafetyTier = "green" | "yellow" | "red";

export interface EthicsScreenResponse {
  safety_tier: SafetyTier;
  reason_code: string;
  analysis_allowed: boolean;
  recognition_allowed: boolean;
  card_allowed: boolean;
  progress_allowed: boolean;
  user_message: string;
}

const SAFETY_SYSTEM = `You are the FairFrame Ethics Layer. Screen photographs for content eligibility BEFORE photographic critique.

Return ONLY valid JSON:
{
  "safety_tier": "green" | "yellow" | "red",
  "reason_code": "safe_general" | "sensitive_documentary" | "sensitive_medical" | "sensitive_violence_context" | "disallowed_sexual_exploitation" | "disallowed_csam" | "disallowed_extreme_gore" | "disallowed_hate_propaganda" | "uncertain_restrict",
  "confidence": 0.0-1.0
}

Rules:
- green: normal eligible photography (portraits, sports, street, nature, architecture, normal documentary)
- yellow: sensitive but potentially legitimate (disaster, medical, war/reporting, crime aftermath without exploitation)
- red: disallowed (sexual exploitation, CSAM, non-consensual nudity, torture, extreme gore, hate propaganda, animal torture, abusive/exploitative content)
- When uncertain between yellow and red, choose yellow with uncertain_restrict
- Never score or critique the image`;

const USER_MESSAGE: Record<SafetyTier, string> = {
  green: "Continue to Chief analysis.",
  yellow:
    "This image appears sensitive. FairFrame can analyze visual craft, but recognition and sharing may be limited.",
  red: "FairFrame cannot analyze or score this image because it appears to violate our content eligibility rules.",
};

export async function screenImageEthics(
  openaiKey: string,
  imageBase64: string
): Promise<EthicsScreenResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SAFETY_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Screen this photograph for FairFrame content eligibility." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return failClosedYellow();
  }

  const completion = await response.json();
  const content = completion?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return failClosedYellow();
  }

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const tier = parsed.safety_tier;
    if (tier !== "green" && tier !== "yellow" && tier !== "red") {
      return failClosedYellow();
    }

    const reason =
      typeof parsed.reason_code === "string" ? parsed.reason_code : "uncertain_restrict";

    return toEthicsResponse(tier, reason);
  } catch {
    return failClosedYellow();
  }
}

function toEthicsResponse(tier: SafetyTier, reasonCode: string): EthicsScreenResponse {
  const analysisAllowed = tier !== "red";
  const recognitionAllowed = tier === "green";
  const cardAllowed = tier === "green";
  const progressAllowed = tier !== "red";

  return {
    safety_tier: tier,
    reason_code: reasonCode,
    analysis_allowed: analysisAllowed,
    recognition_allowed: recognitionAllowed,
    card_allowed: cardAllowed,
    progress_allowed: progressAllowed,
    user_message: USER_MESSAGE[tier],
  };
}

function failClosedYellow(): EthicsScreenResponse {
  return toEthicsResponse(
    "yellow",
    "uncertain_restrict"
  );
}

export function ethicsRefusalPayload(screen: EthicsScreenResponse) {
  return {
    error: "ethics_refused",
    ...screen,
  };
}
