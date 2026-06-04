import type { PillarKey, PillarRating, PillarScores, WhatChiefSeesItem } from "../types/analysis";

export const PILLAR_KEYS: PillarKey[] = [
  "communication",
  "focus",
  "clarity",
  "context",
  "storytelling",
  "craft",
];

export const PILLAR_LABELS: Record<PillarKey, string> = {
  communication: "Communication",
  focus: "Focus",
  clarity: "Clarity",
  context: "Context",
  storytelling: "Storytelling",
  craft: "Craft",
};

export function scoreToRating(score: number): PillarRating {
  if (score >= 82) return "strong";
  if (score >= 72) return "good";
  if (score >= 58) return "moderate";
  return "weak";
}

export function averagePillars(pillars: PillarScores): number {
  const vals = PILLAR_KEYS.map((k) => pillars[k]);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function buildWhatChiefSeesFromPillars(
  pillars: PillarScores,
  observations: Partial<Record<PillarKey, string>>
): WhatChiefSeesItem[] {
  return PILLAR_KEYS.map((pillar) => ({
    pillar,
    rating: scoreToRating(pillars[pillar]),
    observation:
      observations[pillar]?.trim() ||
      `Chief notes ${PILLAR_LABELS[pillar].toLowerCase()} reads at ${pillars[pillar]} on this frame.`,
  }));
}
