import type {
  FairLevel,
  FairScoreClassification,
} from "../types/fairLevel";
import {
  CLASSIFICATION_RANK,
  FAIR_LEVEL_ORDER,
  FAIR_LEVEL_REQUIREMENTS,
} from "../types/fairLevel";

const ROLLING_WINDOW = 100;

export function getFairScoreClassification(score: number): FairScoreClassification {
  const s = Math.max(0, Math.min(10, score));
  if (s < 4) return "Developing";
  if (s < 5) return "Average";
  if (s < 6) return "Good";
  if (s < 7) return "Strong";
  if (s < 8) return "Excellent";
  if (s < 8.5) return "Exceptional";
  if (s < 9) return "Rare";
  if (s < 9.5) return "Elite";
  return "Historic";
}

export function rollingAverageFairScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const window = scores.slice(0, ROLLING_WINDOW);
  const sum = window.reduce((a, b) => a + b, 0);
  return Math.round((sum / window.length) * 100) / 100;
}

export function computeFairLevel(
  totalFrames: number,
  rollingAverage: number,
  isFairCircleMember: boolean
): FairLevel {
  if (isFairCircleMember) return "Fair Circle Member";

  let level: FairLevel = "Observer";
  for (const req of FAIR_LEVEL_REQUIREMENTS) {
    if (req.level === "Fair Circle Member") continue;
    const framesOk = req.minFrames === null || totalFrames >= req.minFrames;
    const avgOk =
      req.minRollingAverage === null || rollingAverage >= req.minRollingAverage;
    if (framesOk && avgOk) {
      level = req.level;
    }
  }
  return level;
}

export function fairLevelIndex(level: FairLevel): number {
  return FAIR_LEVEL_ORDER.indexOf(level);
}

export function nextFairLevel(level: FairLevel): FairLevel | null {
  const idx = fairLevelIndex(level);
  if (idx < 0 || idx >= FAIR_LEVEL_ORDER.length - 2) return null;
  return FAIR_LEVEL_ORDER[idx + 1];
}

export function progressToNextLevel(
  level: FairLevel,
  totalFrames: number,
  rollingAverage: number
): { framesNeeded: number | null; avgNeeded: number | null } {
  const next = nextFairLevel(level);
  if (!next) return { framesNeeded: null, avgNeeded: null };
  const req = FAIR_LEVEL_REQUIREMENTS.find((r) => r.level === next);
  if (!req) return { framesNeeded: null, avgNeeded: null };
  return {
    framesNeeded:
      req.minFrames !== null ? Math.max(0, req.minFrames - totalFrames) : null,
    avgNeeded:
      req.minRollingAverage !== null
        ? Math.max(0, Math.round((req.minRollingAverage - rollingAverage) * 100) / 100)
        : null,
  };
}

export function pickBestClassification(
  current: FairScoreClassification | null | undefined,
  candidate: FairScoreClassification
): FairScoreClassification {
  if (!current) return candidate;
  return CLASSIFICATION_RANK[candidate] > CLASSIFICATION_RANK[current] ? candidate : current;
}
