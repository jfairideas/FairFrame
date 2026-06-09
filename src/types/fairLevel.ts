export type FairLevel =
  | "Observer"
  | "Storyteller"
  | "Visual Journalist"
  | "Craftsman"
  | "Master"
  | "Chief Approved"
  | "Fair Circle Member";

export type FairScoreClassification =
  | "Developing"
  | "Average"
  | "Good"
  | "Strong"
  | "Excellent"
  | "Exceptional"
  | "Rare"
  | "Elite"
  | "Historic";

export interface FairLevelRequirement {
  level: FairLevel;
  minFrames: number | null;
  minRollingAverage: number | null;
  description: string;
}

export const FAIR_LEVEL_ORDER: FairLevel[] = [
  "Observer",
  "Storyteller",
  "Visual Journalist",
  "Craftsman",
  "Master",
  "Chief Approved",
  "Fair Circle Member",
];

/**
 * Build 6C provisional thresholds — calibration targets, not permanent law.
 * Volume + rolling average FairScore both required beyond Observer.
 */
export const EARNABLE_FAIR_LEVEL_REQUIREMENTS: FairLevelRequirement[] = [
  { level: "Observer", minFrames: 0, minRollingAverage: null, description: "Starting visual awareness." },
  { level: "Storyteller", minFrames: 50, minRollingAverage: 5.0, description: "Building intent and repetition." },
  { level: "Visual Journalist", minFrames: 150, minRollingAverage: 5.8, description: "Growing visual communication." },
  { level: "Craftsman", minFrames: 400, minRollingAverage: 6.5, description: "Repeatable fundamentals." },
  { level: "Master", minFrames: 1000, minRollingAverage: 7.2, description: "A consistent eye." },
  { level: "Chief Approved", minFrames: 2500, minRollingAverage: 8.5, description: "Elite recognition — special review." },
];

/** Primary public journey path (Build 6C Journey Bar). */
export const JOURNEY_BAR_LEVELS: FairLevel[] = [
  "Observer",
  "Storyteller",
  "Visual Journalist",
  "Craftsman",
  "Master",
  "Chief Approved",
];

export const FAIR_LEVEL_REQUIREMENTS: FairLevelRequirement[] = [
  ...EARNABLE_FAIR_LEVEL_REQUIREMENTS,
  {
    level: "Fair Circle Member",
    minFrames: null,
    minRollingAverage: null,
    description: "Invitation-only circle.",
  },
];

export const CLASSIFICATION_RANK: Record<FairScoreClassification, number> = {
  Developing: 1,
  Average: 2,
  Good: 3,
  Strong: 4,
  Excellent: 5,
  Exceptional: 6,
  Rare: 7,
  Elite: 8,
  Historic: 9,
};
