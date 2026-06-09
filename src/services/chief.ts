import * as FileSystem from "expo-file-system/legacy";
import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
import type { EthicsScreenResult } from "../types/ethics";
import { ETHICS_COPY } from "../types/ethics";
import { canInvokeLiveChief } from "../lib/liveChiefAccess";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { analyzeWithChief as analyzeMock } from "./mockChief";
import { parseChiefJson } from "./parseChiefResponse";

async function imageUriToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export type ChiefAnalysisSource = "live-chief" | "offline-preview";

export interface ChiefAnalysisResponse {
  result?: ChiefAnalysisResult;
  source: ChiefAnalysisSource;
  fallbackReason?: string;
  ethics?: EthicsScreenResult;
  ethicsRefused?: boolean;
}

function extractInvokeError(error: unknown, data: unknown): string {
  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    if (typeof payload.message === "string") return payload.message;
    if (payload.error === "founder_only") {
      return "Live Chief is founder-only during beta testing";
    }
    if (typeof payload.error === "string") return payload.error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "Unknown error calling analyze-frame";
}

function parseEthicsFromPayload(payload: Record<string, unknown>): EthicsScreenResult | null {
  const tier = payload.safety_tier;
  if (tier !== "green" && tier !== "yellow" && tier !== "red") return null;

  return {
    safetyTier: tier,
    reasonCode: (payload.reason_code as EthicsScreenResult["reasonCode"]) ?? "uncertain_restrict",
    analysisAllowed: Boolean(payload.analysis_allowed ?? tier !== "red"),
    recognitionAllowed: Boolean(payload.recognition_allowed ?? tier === "green"),
    cardAllowed: Boolean(payload.card_allowed ?? tier === "green"),
    progressAllowed: Boolean(payload.progress_allowed ?? tier !== "red"),
    userMessage:
      typeof payload.user_message === "string" ? payload.user_message : ETHICS_COPY[tier],
  };
}

async function analyzeLive(
  session: CaptureSession,
  requestId: string
): Promise<ChiefAnalysisResponse> {
  const imageBase64 = await imageUriToBase64(session.imageUri);
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    throw new Error("Sign in required for Live Chief");
  }

  const { data, error } = await supabase.functions.invoke("analyze-frame", {
    body: {
      imageBase64,
      requestId,
      session: {},
      mode: "analyze",
    },
    headers: { Authorization: `Bearer ${authSession.access_token}` },
  });

  if (error) {
    throw new Error(extractInvokeError(error, data));
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response from analyze-frame");
  }

  const payload = data as Record<string, unknown>;

  if (payload.error === "ethics_refused" || payload.safety_tier === "red") {
    const ethics =
      parseEthicsFromPayload(payload) ?? {
        safetyTier: "red" as const,
        reasonCode: "uncertain_restrict" as const,
        analysisAllowed: false,
        recognitionAllowed: false,
        cardAllowed: false,
        progressAllowed: false,
        userMessage: ETHICS_COPY.red,
      };
    return { source: "live-chief", ethics, ethicsRefused: true };
  }

  if (payload.error) {
    throw new Error(extractInvokeError(null, payload));
  }

  const ethics = parseEthicsFromPayload(payload) ?? undefined;
  const result = parseChiefJson(payload, session);
  return { result, source: "live-chief", ethics };
}

/**
 * Live Chief via Supabase Edge Function + OpenAI (key stays on server).
 * Ethics screening runs server-side before Chief.
 */
export async function analyzeWithChief(
  session: CaptureSession,
  options?: { requestId?: string }
): Promise<ChiefAnalysisResponse> {
  if (!isSupabaseConfigured) {
    const result = await analyzeMock(session);
    return {
      result,
      source: "offline-preview",
      fallbackReason: "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env",
      ethics: {
        safetyTier: "green",
        reasonCode: "screening_unavailable",
        analysisAllowed: true,
        recognitionAllowed: true,
        cardAllowed: true,
        progressAllowed: true,
        userMessage: ETHICS_COPY.green,
      },
    };
  }

  const access = await canInvokeLiveChief();
  if (!access.allowed) {
    const result = await analyzeMock(session);
    return {
      result,
      source: "offline-preview",
      fallbackReason: access.reason,
      ethics: {
        safetyTier: "green",
        reasonCode: "screening_unavailable",
        analysisAllowed: true,
        recognitionAllowed: true,
        cardAllowed: true,
        progressAllowed: true,
        userMessage: ETHICS_COPY.green,
      },
    };
  }

  const requestId = options?.requestId ?? `analysis-${Date.now()}`;

  try {
    return await analyzeLive(session, requestId);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Live Chief unavailable";
    if (__DEV__) {
      console.warn("[Chief] Live analysis failed, using offline preview:", reason);
    }
    const result = await analyzeMock(session);
    return {
      result,
      source: "offline-preview",
      fallbackReason: reason,
      ethics: {
        safetyTier: "green",
        reasonCode: "screening_unavailable",
        analysisAllowed: true,
        recognitionAllowed: true,
        cardAllowed: true,
        progressAllowed: true,
        userMessage: ETHICS_COPY.green,
      },
    };
  }
}
