import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export async function saveAnalysisHistory(
  session: CaptureSession,
  result: ChiefAnalysisResult,
  source: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return;

  const { error } = await supabase.from("analysis_history").insert({
    user_id: user.id,
    analysis_mode: session.phase,
    scene_type: result.sceneType,
    story_context: session.storyContext ?? null,
    result,
    source,
  });

  if (error) {
    console.warn("Failed to save analysis history:", error.message);
  }
}
