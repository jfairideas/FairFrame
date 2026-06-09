import * as FileSystem from "expo-file-system/legacy";
import type { CaptureSession } from "../types/analysis";
import type { EthicsReasonCode, EthicsScreenResult, SafetyTier } from "../types/ethics";
import { ETHICS_COPY } from "../types/ethics";
import { BUILD_6C_FLAGS } from "../config/build6c";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { trackEvent } from "./analytics";

async function imageUriToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

function buildResult(
  safetyTier: SafetyTier,
  reasonCode: EthicsReasonCode,
  overrides?: Partial<EthicsScreenResult>
): EthicsScreenResult {
  const analysisAllowed = safetyTier !== "red";
  const recognitionAllowed = safetyTier === "green";
  const cardAllowed = safetyTier === "green";
  const progressAllowed = safetyTier !== "red";

  return {
    safetyTier,
    reasonCode,
    analysisAllowed,
    recognitionAllowed,
    cardAllowed,
    progressAllowed,
    userMessage: ETHICS_COPY[safetyTier],
    ...overrides,
  };
}

function parseServerEthics(payload: Record<string, unknown>): EthicsScreenResult | null {
  const tier = payload.safety_tier ?? payload.safetyTier;
  if (tier !== "green" && tier !== "yellow" && tier !== "red") return null;

  const reason = (payload.reason_code ?? payload.reasonCode ?? "safe_general") as EthicsReasonCode;
  return buildResult(tier as SafetyTier, reason, {
    analysisAllowed: Boolean(payload.analysis_allowed ?? payload.analysisAllowed ?? tier !== "red"),
    recognitionAllowed: Boolean(
      payload.recognition_allowed ?? payload.recognitionAllowed ?? tier === "green"
    ),
    cardAllowed: Boolean(payload.card_allowed ?? payload.cardAllowed ?? tier === "green"),
    progressAllowed: Boolean(payload.progress_allowed ?? payload.progressAllowed ?? tier !== "red"),
    userMessage:
      typeof payload.user_message === "string"
        ? payload.user_message
        : typeof payload.userMessage === "string"
          ? payload.userMessage
          : ETHICS_COPY[tier as SafetyTier],
    screeningId:
      typeof payload.screening_id === "string"
        ? payload.screening_id
        : typeof payload.screeningId === "string"
          ? payload.screeningId
          : undefined,
  });
}

/** Offline path: permissive green default when screening unavailable. */
async function screenOffline(): Promise<EthicsScreenResult> {
  return buildResult("green", "screening_unavailable", {
    userMessage: ETHICS_COPY.green,
  });
}

export async function screenEthicsForSession(
  session: CaptureSession,
  requestId: string
): Promise<EthicsScreenResult> {
  if (!BUILD_6C_FLAGS.ENABLE_ETHICS_LAYER) {
    return screenOffline();
  }

  void trackEvent("ethics_screened", { request_id: requestId });

  if (!isSupabaseConfigured) {
    const result = await screenOffline();
    void trackEvent("ethics_result_green", { path: "offline" });
    return result;
  }

  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return screenOffline();
  }

  try {
    const imageBase64 = await imageUriToBase64(session.imageUri);
    const { data, error } = await supabase.functions.invoke("analyze-frame", {
      body: {
        mode: "ethics_screen",
        imageBase64,
        requestId,
      },
      headers: { Authorization: `Bearer ${authSession.access_token}` },
    });

    if (error || !data || typeof data !== "object") {
      return buildResult("yellow", "uncertain_restrict", {
        userMessage: ETHICS_COPY.yellow,
      });
    }

    const payload = data as Record<string, unknown>;
    if (payload.error === "ethics_refused" || payload.safety_tier === "red") {
      const parsed =
        parseServerEthics(payload) ??
        buildResult("red", "uncertain_restrict", { userMessage: ETHICS_COPY.red });
      void trackEvent("ethics_result_red", { reason_code: parsed.reasonCode });
      return parsed;
    }

    const parsed = parseServerEthics(payload);
    if (!parsed) {
      return buildResult("yellow", "uncertain_restrict", { userMessage: ETHICS_COPY.yellow });
    }

    void trackEvent(
      parsed.safetyTier === "green"
        ? "ethics_result_green"
        : parsed.safetyTier === "yellow"
          ? "ethics_result_yellow"
          : "ethics_result_red",
      { reason_code: parsed.reasonCode }
    );
    return parsed;
  } catch {
    return buildResult("yellow", "uncertain_restrict", { userMessage: ETHICS_COPY.yellow });
  }
}

export async function logEthicsScreening(
  userId: string | null,
  result: EthicsScreenResult
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("ethics_screenings")
    .insert({
      user_id: userId,
      safety_tier: result.safetyTier,
      reason_code: result.reasonCode,
      analysis_allowed: result.analysisAllowed,
      recognition_allowed: result.recognitionAllowed,
      card_allowed: result.cardAllowed,
      progress_allowed: result.progressAllowed,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("logEthicsScreening:", error.message);
    return null;
  }
  return data?.id ?? null;
}
