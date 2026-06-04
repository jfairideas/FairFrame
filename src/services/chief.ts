import * as FileSystem from "expo-file-system/legacy";
import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
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
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  if (data && typeof data === "object" && "error" in data) {
    return String((data as { error: unknown }).error);
  }
  return "Unknown error calling analyze-frame";
}

async function analyzeLive(session: CaptureSession): Promise<ChiefAnalysisResult> {
  const imageBase64 = await imageUriToBase64(session.imageUri);
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke("analyze-frame", {
    body: {
      imageBase64,
      session: {
        phase: session.phase,
        storyContext: session.storyContext ?? null,
      },
    },
    headers: authSession?.access_token
      ? { Authorization: `Bearer ${authSession.access_token}` }
      : undefined,
  });

  if (error) {
    throw new Error(extractInvokeError(error, data));
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response from analyze-frame");
  }

  const payload = data as Record<string, unknown>;
  if (payload.error) {
    throw new Error(String(payload.error));
  }

  return parseChiefJson(payload, session);
}

/**
 * Live Chief via Supabase Edge Function + OpenAI (key stays on server).
 * Falls back to offline preview mock only when live request fails.
 */
export async function analyzeWithChief(
  session: CaptureSession
): Promise<ChiefAnalysisResponse> {
  if (!isSupabaseConfigured) {
    const result = await analyzeMock(session);
    return {
      result,
      source: "offline-preview",
      fallbackReason: "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env",
    };
  }

  try {
    const result = await analyzeLive(session);
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
