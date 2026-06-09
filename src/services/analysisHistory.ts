import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
import type { EthicsScreenResult } from "../types/ethics";
import type { Json } from "../types/database";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  buildNormalizedAnalysisFields,
  fetchProfileProgression,
  runPostAnalysisProgression,
} from "./progression";
import { evaluateMilestonesAfterEligibleAnalysis } from "./milestones";
import type { FairLevel } from "../types/fairLevel";

export async function saveAnalysisHistory(
  session: CaptureSession,
  result: ChiefAnalysisResult,
  source: string,
  ethics?: EthicsScreenResult
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return null;

  if (ethics && !ethics.progressAllowed) return null;

  const profile = await fetchProfileProgression(user.id);
  const fairLevelAtCapture = profile?.current_fair_level ?? "Observer";
  const normalized = buildNormalizedAnalysisFields(result, fairLevelAtCapture);

  const recognitionAllowed = ethics?.recognitionAllowed ?? true;
  const progressContributed = ethics?.progressAllowed ?? true;

  const { data, error } = await supabase.from("analysis_history").insert({
    user_id: user.id,
    analysis_mode: "initial",
    scene_type: result.sceneType,
    story_context: null,
    result: result as unknown as Json,
    source,
    fair_score: normalized.fair_score,
    classification: normalized.classification,
    image_type: normalized.image_type,
    category: normalized.category,
    chief_reaction: normalized.chief_reaction,
    chief_assignment: normalized.chief_assignment,
    detected_strengths: normalized.detected_strengths,
    detected_weaknesses: normalized.detected_weaknesses,
    attention_drivers: normalized.attention_drivers,
    fair_level_at_capture: normalized.fair_level_at_capture,
    safety_tier: ethics?.safetyTier ?? "green",
    ethics_reason_code: ethics?.reasonCode ?? "safe_general",
    recognition_allowed: recognitionAllowed,
    progress_contributed: progressContributed,
  }).select("id").single();

  if (error) {
    console.warn("Failed to save analysis history:", error.message);
    return null;
  }

  if (progressContributed) {
    const newLevel = await runPostAnalysisProgression(user.id, result, {
      cardAllowed: ethics?.cardAllowed ?? true,
    });
    void evaluateMilestonesAfterEligibleAnalysis(
      user.id,
      result,
      (profile?.total_frames_analyzed ?? 0) + 1,
      newLevel as FairLevel,
      ethics?.cardAllowed ?? true
    );
  }

  return data?.id ?? null;
}
