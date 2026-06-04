import * as FileSystem from "expo-file-system/legacy";
import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
import { canInvokeLiveChief } from "../lib/liveChiefAccess";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { analyzeWithChief as analyzeMock } from "./mockChief";
import { parseChiefJson } from "./parseChiefResponse";

async function imageUriToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export type ChiefAnalysisSource = "live-chief" | "offline-preview";

export interface ChiefAnalysisResponse {
  result: ChiefAnalysisResult;
  source: ChiefAnalysisSource;
  /** Set when live path failed and mock was used */
  fallbackReason?: string;
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

async function analyzeLive(
  session: CaptureSession,
  requestId: string
): Promise<ChiefAnalysisResult> {
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
  if (payload.error) {
    throw new Error(extractInvokeError(null, payload));
  }

  return parseChiefJson(payload, session);
}

/**
 * Live Chief via Supabase Edge Function + OpenAI (key stays on server).
 * Founder-only during beta; others receive offline preview without OpenAI cost.
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
    };
  }

  const access = await canInvokeLiveChief();
  if (!access.allowed) {
    const result = await analyzeMock(session);
    return {
      result,
      source: "offline-preview",
      fallbackReason: access.reason,
    };
  }

  const requestId = options?.requestId ?? `analysis-${Date.now()}`;

  try {
    const result = await analyzeLive(session, requestId);
    return { result, source: "live-chief" };
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
    };
  }
}
