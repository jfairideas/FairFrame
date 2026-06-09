import type { ChiefAnalysisResult } from "../types/analysis";
import type { FairLevel } from "../types/fairLevel";
import type { Json } from "../types/database";
import { getCardClassification } from "./cardClassification";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { trackEvent } from "./analytics";

export type MilestoneKey =
  | "first_analysis"
  | "ten_analyses"
  | "first_exceptional_card"
  | "first_score_above_8"
  | "storyteller_reached";

async function recordMilestone(
  userId: string,
  key: MilestoneKey,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from("milestones").insert({
    user_id: userId,
    milestone_key: key,
    metadata: metadata as Json,
  });

  if (error) {
    if (error.code === "23505") return;
    console.warn("recordMilestone:", key, error.message);
    return;
  }

  void trackEvent("milestone_achieved", { milestone_key: key, ...metadata });
}

export async function evaluateMilestonesAfterEligibleAnalysis(
  userId: string,
  result: ChiefAnalysisResult,
  totalFrames: number,
  newLevel: FairLevel,
  cardAllowed: boolean
): Promise<void> {
  if (totalFrames === 1) {
    await recordMilestone(userId, "first_analysis");
  }
  if (totalFrames >= 10) {
    await recordMilestone(userId, "ten_analyses", { total_frames: totalFrames });
  }
  if (result.fairScore >= 8.0) {
    await recordMilestone(userId, "first_score_above_8", { fair_score: result.fairScore });
  }

  const cardClass = getCardClassification(result.fairScore);
  if (
    cardAllowed &&
    (cardClass === "exceptional" || cardClass === "chiefApproved" || cardClass === "historic")
  ) {
    await recordMilestone(userId, "first_exceptional_card", {
      classification: cardClass,
      fair_score: result.fairScore,
    });
  }

  if (newLevel === "Storyteller") {
    await recordMilestone(userId, "storyteller_reached");
  }
}
