import type { ChiefAnalysisResult, ImageType } from "../types/analysis";
import type { VisualDNA } from "../types/visualDNA";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const ARCHETYPES = [
  "The Observer",
  "The Story Hunter",
  "The Light Chaser",
  "The Humanist",
  "The Explorer",
  "The Minimalist",
  "The Moment Collector",
  "The Atmosphere Builder",
] as const;

const IMAGE_TYPE_ARCHETYPE: Partial<Record<ImageType, string>> = {
  selfie: "The Humanist",
  portrait: "The Humanist",
  street: "The Story Hunter",
  documentary: "The Story Hunter",
  news: "The Story Hunter",
  landscape: "The Explorer",
  wildlife: "The Explorer",
  drone: "The Explorer",
  architecture: "The Minimalist",
  product: "The Minimalist",
  commercial: "The Minimalist",
  sports: "The Moment Collector",
  other: "The Observer",
};

function bumpCounter(map: Record<string, number>, key: string, amount = 1): Record<string, number> {
  const k = key.trim();
  if (!k) return map;
  return { ...map, [k]: (map[k] ?? 0) + amount };
}

function topKeys(map: Record<string, number>, limit: number): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function dominantArchetype(subjectPrefs: Record<string, number>, imageType: ImageType): string {
  const fromType = IMAGE_TYPE_ARCHETYPE[imageType] ?? "The Observer";
  const topSubject = topKeys(subjectPrefs, 1)[0];
  if (!topSubject) return fromType;

  const subjectLower = topSubject.toLowerCase();
  if (subjectLower.includes("light") || subjectLower.includes("sun")) return "The Light Chaser";
  if (subjectLower.includes("people") || subjectLower.includes("face")) return "The Humanist";
  if (subjectLower.includes("sky") || subjectLower.includes("weather")) return "The Atmosphere Builder";

  return fromType;
}

function mergeStringList(existing: string[], incoming: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const s of [...existing, ...incoming]) {
    const t = s.trim();
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

export function mergeVisualDNAFromAnalysis(
  existing: VisualDNA | null,
  result: ChiefAnalysisResult
): Omit<VisualDNA, "user_id" | "created_at"> {
  const subject_preferences = bumpCounter(
    existing?.subject_preferences ?? {},
    result.imageType,
    2
  );
  for (const item of result.whatISaw.slice(0, 5)) {
    Object.assign(subject_preferences, bumpCounter(subject_preferences, item));
  }

  let composition_preferences = { ...(existing?.composition_preferences ?? {}) };
  for (const step of result.visualHierarchy) {
    composition_preferences = bumpCounter(composition_preferences, step.element);
  }

  let light_preferences = { ...(existing?.light_preferences ?? {}) };
  for (const item of result.whatISaw) {
    const lower = item.toLowerCase();
    if (lower.includes("light") || lower.includes("shadow") || lower.includes("sun")) {
      light_preferences = bumpCounter(light_preferences, item);
    }
  }

  let attention_drivers = { ...(existing?.attention_drivers ?? {}) };
  if (result.attentionGrabber) {
    attention_drivers = bumpCounter(attention_drivers, result.attentionGrabber, 2);
  }
  for (const step of result.visualHierarchy) {
    attention_drivers = bumpCounter(attention_drivers, step.element);
  }

  const dominant_archetype = dominantArchetype(subject_preferences, result.imageType);
  const trait_badges = mergeStringList(
    existing?.trait_badges ?? [],
    result.whyItWorks.slice(0, 2),
    6
  );

  const top_strengths = mergeStringList(
    existing?.top_strengths ?? [],
    result.whyItWorks,
    8
  );
  const growth_areas = mergeStringList(
    existing?.growth_areas ?? [],
    result.improvements,
    8
  );

  const archetypeValid = ARCHETYPES.includes(
    dominant_archetype as (typeof ARCHETYPES)[number]
  );

  return {
    dominant_archetype: archetypeValid ? dominant_archetype : "The Observer",
    trait_badges,
    subject_preferences,
    composition_preferences,
    light_preferences,
    attention_drivers,
    top_strengths,
    growth_areas,
    fair_score_trend: existing?.fair_score_trend ?? null,
    last_recalculated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function fetchVisualDNA(userId: string): Promise<VisualDNA | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("visual_dna")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("fetchVisualDNA:", error.message);
    return null;
  }
  return data as VisualDNA | null;
}

export async function upsertVisualDNA(
  userId: string,
  patch: Omit<VisualDNA, "user_id" | "created_at">
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("visual_dna").upsert(
    {
      user_id: userId,
      ...patch,
    },
    { onConflict: "user_id" }
  );
  if (error) console.warn("upsertVisualDNA:", error.message);
}

export async function recalculateVisualDNA(
  userId: string,
  result: ChiefAnalysisResult
): Promise<void> {
  const existing = await fetchVisualDNA(userId);
  const merged = mergeVisualDNAFromAnalysis(existing, result);
  await upsertVisualDNA(userId, merged);
}
