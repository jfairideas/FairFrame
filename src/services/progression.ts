import type { ChiefAnalysisResult } from "../types/analysis";
import type { FairScoreClassification } from "../types/fairLevel";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  computeFairLevel,
  getFairScoreClassification,
  pickBestClassification,
  rollingAverageFairScore,
} from "./fairLevel";
import { recalculateVisualDNA } from "./visualDNA";

export interface ProfileProgression {
  current_fair_level: string;
  total_frames_analyzed: number;
  rolling_average_fair_score: number;
  highest_fair_score: number;
  best_classification: string | null;
  is_fair_circle_member: boolean;
}

export interface NormalizedAnalysisFields {
  fair_score: number;
  classification: FairScoreClassification;
  image_type: string;
  category: string;
  chief_reaction: string;
  chief_assignment: string;
  detected_strengths: string[];
  detected_weaknesses: string[];
  attention_drivers: string[];
  fair_level_at_capture: string;
}

export function buildNormalizedAnalysisFields(
  result: ChiefAnalysisResult,
  fairLevelAtCapture: string
): NormalizedAnalysisFields {
  const attention_drivers = [
    result.attentionGrabber,
    ...result.visualHierarchy.map((s) => s.element),
  ].filter((s) => typeof s === "string" && s.length > 0);

  return {
    fair_score: result.fairScore,
    classification: getFairScoreClassification(result.fairScore),
    image_type: result.imageType,
    category: result.sceneIdentification || result.imageType,
    chief_reaction: result.chiefsReaction,
    chief_assignment: result.chiefsAssignment,
    detected_strengths: result.whyItWorks.length > 0 ? result.whyItWorks : result.strengths,
    detected_weaknesses: result.improvements,
    attention_drivers,
    fair_level_at_capture: fairLevelAtCapture,
  };
}

export async function fetchProfileProgression(
  userId: string
): Promise<ProfileProgression | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "current_fair_level, total_frames_analyzed, rolling_average_fair_score, highest_fair_score, best_classification, is_fair_circle_member"
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("fetchProfileProgression:", error.message);
    return null;
  }
  if (!data) return null;
  return data as ProfileProgression;
}

async function fetchTotalFrames(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("analysis_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) {
    console.warn("fetchTotalFrames:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function fetchRecentFairScores(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("fair_score")
    .eq("user_id", userId)
    .not("fair_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.warn("fetchRecentFairScores:", error.message);
    return [];
  }
  return (data ?? [])
    .map((r) => r.fair_score)
    .filter((s): s is number => typeof s === "number");
}

/** Lifetime highest FairScore across all scored analyses (not rolling window). */
async function fetchAllTimeHighestFairScore(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("fair_score")
    .eq("user_id", userId)
    .not("fair_score", "is", null)
    .order("fair_score", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("fetchAllTimeHighestFairScore:", error.message);
    return null;
  }
  return typeof data?.fair_score === "number" ? data.fair_score : null;
}

async function fetchBestClassificationFromHistory(
  userId: string
): Promise<FairScoreClassification | null> {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("classification")
    .eq("user_id", userId)
    .not("classification", "is", null);
  if (error) {
    console.warn("fetchBestClassificationFromHistory:", error.message);
    return null;
  }
  let best: FairScoreClassification | null = null;
  for (const row of data ?? []) {
    const c = row.classification;
    if (typeof c !== "string") continue;
    best = pickBestClassification(best, c as FairScoreClassification);
  }
  return best;
}

export async function updateProfileAfterAnalysis(
  userId: string,
  result: ChiefAnalysisResult
): Promise<string> {
  if (!isSupabaseConfigured) return "Observer";

  const profile = await fetchProfileProgression(userId);
  const isFairCircle = profile?.is_fair_circle_member ?? false;

  const [scores, totalFrames, allTimeHighest, historyBest] = await Promise.all([
    fetchRecentFairScores(userId),
    fetchTotalFrames(userId),
    fetchAllTimeHighestFairScore(userId),
    fetchBestClassificationFromHistory(userId),
  ]);
  const rolling = rollingAverageFairScore(scores);
  const highest = Math.max(allTimeHighest ?? 0, result.fairScore);
  const bestFromHighest = getFairScoreClassification(highest);
  let bestClassification = pickBestClassification(
    profile?.best_classification as FairScoreClassification | null,
    bestFromHighest
  );
  if (historyBest) {
    bestClassification = pickBestClassification(bestClassification, historyBest);
  }
  const fairLevel = computeFairLevel(totalFrames, rolling, isFairCircle);

  const { error } = await supabase
    .from("profiles")
    .update({
      current_fair_level: fairLevel,
      total_frames_analyzed: totalFrames,
      rolling_average_fair_score: rolling,
      highest_fair_score: highest,
      best_classification: bestClassification,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) console.warn("updateProfileAfterAnalysis:", error.message);
  return fairLevel;
}

export interface PostAnalysisProgressionOptions {
  cardAllowed?: boolean;
}

/** Post-save progression (profile + visual DNA). Returns new FairLevel. */
export async function runPostAnalysisProgression(
  userId: string,
  result: ChiefAnalysisResult,
  _options?: PostAnalysisProgressionOptions
): Promise<string> {
  try {
    const level = await updateProfileAfterAnalysis(userId, result);
    await recalculateVisualDNA(userId, result);
    return level;
  } catch (e) {
    console.warn("runPostAnalysisProgression:", e);
    return "Observer";
  }
}
