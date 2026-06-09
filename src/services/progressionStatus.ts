import type { ProfileProgression } from "./progression";
import {
  computeFairLevel,
  nextFairLevel,
  progressToNextLevel,
} from "./fairLevel";
import { EARNABLE_FAIR_LEVEL_REQUIREMENTS } from "../types/fairLevel";
import type { FairLevel } from "../types/fairLevel";
import type { ProgressionStatus } from "../types/progressionStatus";

export function buildProgressionStatus(
  profile: ProfileProgression | null
): ProgressionStatus {
  const totalFrames = profile?.total_frames_analyzed ?? 0;
  const rollingAverage = profile?.rolling_average_fair_score ?? 0;
  const currentLevel = (profile?.current_fair_level ?? "Observer") as FairLevel;
  const next = nextFairLevel(currentLevel);
  const progress = progressToNextLevel(currentLevel, totalFrames, rollingAverage);
  const nextReq = next
    ? EARNABLE_FAIR_LEVEL_REQUIREMENTS.find((r) => r.level === next)
    : null;

  const framesRequirementMet =
    nextReq?.minFrames == null || totalFrames >= nextReq.minFrames;
  const avgRequirementMet =
    nextReq?.minRollingAverage == null || rollingAverage >= nextReq.minRollingAverage;

  return {
    currentLevel,
    nextLevel: next,
    totalFrames,
    rollingAverage,
    framesUntilNext: progress.framesNeeded,
    avgUntilNext: progress.avgNeeded,
    framesRequirementMet,
    avgRequirementMet,
    nextLevelDescription: nextReq?.description ?? null,
  };
}

export function formatNextLevelLabel(status: ProgressionStatus): string | null {
  if (!status.nextLevel) return null;
  const parts: string[] = [];
  if (status.framesUntilNext !== null && status.framesUntilNext > 0) {
    parts.push(`${status.framesUntilNext} until ${status.nextLevel}`);
  } else if (status.framesUntilNext === 0) {
    parts.push(`Frame count met for ${status.nextLevel}`);
  }
  if (status.avgUntilNext !== null && status.avgUntilNext > 0) {
    parts.push(`raise rolling avg by ${status.avgUntilNext.toFixed(1)}`);
  }
  return parts.length > 0 ? parts.join(" · ") : `Requirements met for ${status.nextLevel}`;
}

/** Recompute level with Build 6C weighted thresholds. */
export function resolveFairLevel(
  totalFrames: number,
  rollingAverage: number,
  isFairCircleMember: boolean
): FairLevel {
  return computeFairLevel(totalFrames, rollingAverage, isFairCircleMember);
}
