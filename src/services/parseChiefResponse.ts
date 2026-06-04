import type {
  CaptureSession,
  ChiefAnalysisResult,
  PillarKey,
  PillarRating,
  PillarScores,
  SceneType,
  ShotGrade,
  VisualHierarchyStep,
  WhatChiefSeesItem,
} from "../types/analysis";
import {
  averagePillars,
  buildWhatChiefSeesFromPillars,
  PILLAR_KEYS,
  scoreToRating,
} from "../utils/pillars";

const GRADES: ShotGrade[] = ["A", "B", "C", "D", "F"];
const SCENES: SceneType[] = ["subject-present", "location-scout"];
const RATINGS: PillarRating[] = ["strong", "good", "moderate", "weak"];

/** Normalize API / OpenAI field name variants into one shape */
export function normalizeChiefPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const pillars =
    raw.pillars ??
    raw.pillarScores ??
    (raw.pillar_scores as Record<string, unknown> | undefined);

  return {
    ...raw,
    firstImpression:
      raw.firstImpression ??
      raw.chiefsFirstImpression ??
      raw.chiefFirstImpression,
    sceneIdentification: raw.sceneIdentification ?? raw.scene,
    pillars,
    visibleObjects: raw.visibleObjects ?? raw.visible_objects,
    visualHierarchy: raw.visualHierarchy ?? raw.visual_hierarchy,
    whatChiefSees: raw.whatChiefSees ?? raw.what_chief_sees,
  };
}

function normalizeGrade(grade: unknown): ShotGrade {
  if (typeof grade === "string" && GRADES.includes(grade as ShotGrade)) {
    return grade as ShotGrade;
  }
  return "C";
}

function normalizeScene(scene: unknown): SceneType {
  if (typeof scene === "string" && SCENES.includes(scene as SceneType)) {
    return scene as SceneType;
  }
  return "subject-present";
}

function normalizeRating(rating: unknown, score: number): PillarRating {
  if (typeof rating === "string" && RATINGS.includes(rating as PillarRating)) {
    return rating as PillarRating;
  }
  return scoreToRating(score);
}

function clampScore(value: unknown, fallback = 70): number {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

function parsePillars(raw: unknown, fallback: number): PillarScores {
  const p = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    communication: clampScore(p.communication, fallback),
    focus: clampScore(p.focus, fallback),
    clarity: clampScore(p.clarity, fallback),
    context: clampScore(p.context, fallback),
    storytelling: clampScore(p.storytelling, fallback),
    craft: clampScore(p.craft, fallback),
  };
}

function parseWhatChiefSees(raw: unknown, pillars: PillarScores): WhatChiefSeesItem[] {
  if (!Array.isArray(raw)) {
    return buildWhatChiefSeesFromPillars(pillars, {});
  }

  const parsed: WhatChiefSeesItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const pillar = row.pillar;
    if (typeof pillar !== "string" || !PILLAR_KEYS.includes(pillar as PillarKey)) continue;
    const key = pillar as PillarKey;
    const score = pillars[key];
    parsed.push({
      pillar: key,
      rating: normalizeRating(row.rating, score),
      observation:
        typeof row.observation === "string" && row.observation.length > 0
          ? row.observation
          : `Chief notes ${key} at ${score} on this frame.`,
    });
  }

  if (parsed.length === PILLAR_KEYS.length) return parsed;

  const byPillar = Object.fromEntries(parsed.map((p) => [p.pillar, p.observation]));
  return buildWhatChiefSeesFromPillars(pillars, byPillar);
}

function parseVisualHierarchy(raw: unknown): VisualHierarchyStep[] {
  if (!Array.isArray(raw)) return [];
  const steps: VisualHierarchyStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rank = Number(row.rank);
    if (rank !== 1 && rank !== 2 && rank !== 3) continue;
    if (typeof row.element !== "string" || typeof row.why !== "string") continue;
    steps.push({ rank, element: row.element, why: row.why });
  }
  return steps.sort((a, b) => a.rank - b.rank).slice(0, 3);
}

export function parseChiefJson(
  raw: Record<string, unknown>,
  session: CaptureSession
): ChiefAnalysisResult {
  const normalized = normalizeChiefPayload(raw);
  const pillars = parsePillars(normalized.pillars, 70);
  const avg = averagePillars(pillars);
  const currentScore = clampScore(normalized.currentScore, avg);
  const potentialScore = Math.max(
    currentScore,
    clampScore(normalized.potentialScore, currentScore + 8)
  );
  const visualStorytellingScore = clampScore(normalized.visualStorytellingScore, avg);

  const hasPrimarySubject = normalized.hasPrimarySubject === true;
  const sceneType = normalizeScene(
    normalized.sceneType ?? (hasPrimarySubject ? "subject-present" : "location-scout")
  );

  const legacyRecs = [
    ...normalizeStrings(normalized.storytellingRecommendations),
    ...normalizeStrings(normalized.technicalRecommendations),
  ];

  const firstImpression =
    typeof normalized.firstImpression === "string"
      ? normalized.firstImpression
      : typeof normalized.assessment === "string"
        ? normalized.assessment
        : "Chief is reading your frame…";

  return {
    firstImpression,
    sceneIdentification:
      typeof normalized.sceneIdentification === "string"
        ? normalized.sceneIdentification
        : "Scene under review",
    visibleObjects: normalizeStrings(normalized.visibleObjects),
    visualHierarchy: parseVisualHierarchy(normalized.visualHierarchy),
    hasPrimarySubject,
    assessment:
      typeof normalized.assessment === "string"
        ? normalized.assessment
        : "Chief completed your frame review.",
    phase: session.phase,
    sceneType,
    pillars,
    visualStorytellingScore,
    shotGrade: normalizeGrade(normalized.shotGrade),
    currentScore,
    potentialScore,
    strengths: normalizeStrings(normalized.strengths),
    improvements: normalizeStrings(normalized.improvements),
    whatChiefSees: parseWhatChiefSees(normalized.whatChiefSees, pillars),
    recommendations:
      normalizeStrings(normalized.recommendations).length > 0
        ? normalizeStrings(normalized.recommendations)
        : legacyRecs,
  };
}
