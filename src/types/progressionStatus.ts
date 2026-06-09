import type { FairLevel } from "./fairLevel";

export interface ProgressionStatus {
  currentLevel: FairLevel;
  nextLevel: FairLevel | null;
  totalFrames: number;
  rollingAverage: number;
  framesUntilNext: number | null;
  avgUntilNext: number | null;
  framesRequirementMet: boolean;
  avgRequirementMet: boolean;
  nextLevelDescription: string | null;
}
