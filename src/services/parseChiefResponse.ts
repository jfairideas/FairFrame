import type {
  CaptureSession,
  ChiefAnalysisResult,
  ImageType,
  PillarKey,
  PillarRating,
  PillarScores,
  SceneType,
  ShotGrade,
  VisualHierarchyStep,
  WhatChiefSeesItem,
} from "../types/analysis";
import { fairScoreFromLegacy, legacyScoreFromFairScore } from "../utils/fairScore";
import { normalizeImageType } from "../utils/imageType";
import {
  averagePillars,
  buildWhatChiefSeesFromPillars,
  PILLAR_KEYS,
  scoreToRating,
} from "../utils/pillars";

const GRADES: ShotGrade[] = ["A", "B", "C", "D", "F"];
const SCENES: SceneType[] = ["subject-present", "location-scout"];
const RATINGS: PillarRating[] = ["strong", "good", "moderate", "weak"];

export function normalizeChiefPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const pillars =
    raw.pillars ??
    raw.pillarScores ??
    (raw.pillar_scores as Record<string, unknown> | undefined);

  return {
    ...raw,
    chiefsReaction:
      raw.chiefsReaction ??
      raw.chiefReaction ??
      raw.firstImpression ??
      raw.chiefsFirstImpression,
    whatISaw: raw.whatISaw ?? raw.what_i_saw ?? raw.visibleObjects ?? raw.visible_objects,
    fairScore: raw.fairScore ?? raw.fair_score,
    imageType: raw.imageType ?? raw.image_type,
    whyItWorks: raw.whyItWorks ?? raw.why_it_works ?? raw.strengths,
    chiefsAssignment:
      raw.chiefsAssignment ?? raw.chiefAssignment ?? raw.chiefs_assignment,
    firstImpression:
      raw.firstImpression ?? raw.chiefsFirstImpression ?? raw.chiefsReaction,
    sceneIdentification: raw.sceneIdentification ?? raw.scene,
    pillars,
    visibleObjects: raw.visibleObjects ?? raw.visible_objects,
    visualHierarchy: raw.visualHierarchy ?? raw.visual_hierarchy,
    whatChiefSees: raw.whatChiefSees ?? raw.what_chief_sees,
    attentionGrabber: raw.attentionGrabber ?? raw.attention_grabber,
    valueAssessment: raw.valueAssessment ?? raw.value_assessment,
  };
}

function normalizeGrade(grade: unknown, fairScore: number): ShotGrade {
  if (typeof grade === "string" && GRADES.includes(grade as ShotGrade)) {
    return grade as ShotGrade;
  }
  if (fairScore >= 9) return "A";
  if (fairScore >= 8) return "B";
  if (fairScore >= 7) return "C";
  if (fairScore >= 6) return "D";
  return "F";
}

function normalizeScene(scene: unknown, hasPrimarySubject: boolean): SceneType {
  if (typeof scene === "string" && SCENES.includes(scene as SceneType)) {
    return scene as SceneType;
  }
  return hasPrimarySubject ? "subject-present" : "location-scout";
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

function parseFairScore(raw: Record<string, unknown>, pillarAvg: number): number {
  const v = raw.fairScore ?? raw.fair_score;
  if (typeof v === "number" && !Number.isNaN(v)) {
    return Math.round(Math.max(0, Math.min(10, v)) * 10) / 10;
  }
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (!Number.isNaN(n)) return Math.round(Math.max(0, Math.min(10, n)) * 10) / 10;
  }
  const legacy = raw.visualStorytellingScore ?? raw.visual_storytelling_score;
  if (legacy !== undefined) {
    return fairScoreFromLegacy(clampScore(legacy, pillarAvg));
  }
  return fairScoreFromLegacy(pillarAvg);
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
    parsed.push({
      pillar: key,
      rating: normalizeRating(row.rating, pillars[key]),
      observation:
        typeof row.observation === "string" && row.observation.length > 0
          ? row.observation
          : `Chief notes ${key} on this frame.`,
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
  _session: CaptureSession
): ChiefAnalysisResult {
  const normalized = normalizeChiefPayload(raw);
  const pillars = parsePillars(normalized.pillars, 70);
  const avg = averagePillars(pillars);
  const fairScore = parseFairScore(normalized, avg);
  const visualStorytellingScore = legacyScoreFromFairScore(fairScore);
  const currentScore = visualStorytellingScore;
  const potentialScore = Math.min(
    100,
    clampScore(normalized.potentialScore, currentScore + 8)
  );

  const hasPrimarySubject = normalized.hasPrimarySubject === true;
  const sceneType = normalizeScene(normalized.sceneType, hasPrimarySubject);
  const imageType = normalizeImageType(normalized.imageType);

  const chiefsReaction =
    typeof normalized.chiefsReaction === "string"
      ? normalized.chiefsReaction
      : typeof normalized.firstImpression === "string"
        ? normalized.firstImpression
        : "Chief is reading your frame…";

  const whatISaw = normalizeStrings(normalized.whatISaw);
  const visibleObjects =
    whatISaw.length > 0 ? whatISaw : normalizeStrings(normalized.visibleObjects);

  const whyItWorks = normalizeStrings(normalized.whyItWorks);
  const strengths =
    whyItWorks.length > 0 ? whyItWorks : normalizeStrings(normalized.strengths);

  const chiefsAssignment =
    typeof normalized.chiefsAssignment === "string"
      ? normalized.chiefsAssignment
      : normalizeStrings(normalized.recommendations)[0] ??
        "Reshoot one frame with a single clear visual priority — then bring it back to Chief.";

  return {
    chiefsReaction,
    whatISaw: visibleObjects,
    fairScore,
    imageType,
    whyItWorks: strengths.slice(0, 5),
    chiefsAssignment,
    sceneIdentification:
      typeof normalized.sceneIdentification === "string"
        ? normalized.sceneIdentification
        : imageType,
    visibleObjects,
    visualHierarchy: parseVisualHierarchy(normalized.visualHierarchy),
    attentionGrabber:
      typeof normalized.attentionGrabber === "string"
        ? normalized.attentionGrabber
        : "",
    valueAssessment:
      typeof normalized.valueAssessment === "string"
        ? normalized.valueAssessment
        : "",
    pillars,
    whatChiefSees: parseWhatChiefSees(normalized.whatChiefSees, pillars),
    assessment:
      typeof normalized.assessment === "string"
        ? normalized.assessment
        : chiefsReaction,
    strengths,
    improvements: normalizeStrings(normalized.improvements),
    recommendations: normalizeStrings(normalized.recommendations),
    shotGrade: normalizeGrade(normalized.shotGrade, fairScore),
    firstImpression: chiefsReaction,
    hasPrimarySubject,
    sceneType,
    visualStorytellingScore,
    currentScore,
    potentialScore,
  };
}
