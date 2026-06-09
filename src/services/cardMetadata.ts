import type { PressCardViewModel } from "../types/cards";
import type { Json } from "../types/database";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { generateDisplaySerial } from "./cardVerification";

async function fetchExistingPressCardSerial(
  userId: string,
  analysisId: string,
  cardType: PressCardViewModel["cardType"]
): Promise<string | null> {
  const { data, error } = await supabase
    .from("fair_cards")
    .select("display_serial")
    .eq("user_id", userId)
    .eq("analysis_id", analysisId)
    .eq("card_type", cardType)
    .maybeSingle();

  if (error) return null;
  return data?.display_serial ?? null;
}

export async function saveFairCardMetadata(
  viewModel: PressCardViewModel,
  userId: string
): Promise<{ ok: boolean; serial: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, serial: viewModel.serial, error: "Supabase not configured" };
  }

  if (!viewModel.analysisId) {
    return { ok: true, serial: viewModel.serial };
  }

  const existingSerial = await fetchExistingPressCardSerial(
    userId,
    viewModel.analysisId,
    viewModel.cardType
  );
  if (existingSerial) {
    return { ok: true, serial: existingSerial };
  }

  let serial = viewModel.serial;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("fair_cards").insert({
      user_id: userId,
      analysis_id: viewModel.analysisId,
      card_type: viewModel.cardType,
      display_serial: serial,
      fair_score: viewModel.fairScore,
      card_classification: viewModel.classificationLabel,
      fair_level_at_creation: viewModel.fairLevelAtCapture ?? null,
      creator_display_name: viewModel.creatorName,
      source_image_strategy: "session-local",
      card_payload: viewModel as unknown as Json,
    });

    if (!error) return { ok: true, serial };

    if (error.code === "23505") {
      const raced = await fetchExistingPressCardSerial(
        userId,
        viewModel.analysisId,
        viewModel.cardType
      );
      if (raced) return { ok: true, serial: raced };

      serial = generateDisplaySerial();
      continue;
    }

    return { ok: false, serial, error: error.message };
  }

  return { ok: false, serial, error: "Could not allocate unique serial" };
}
