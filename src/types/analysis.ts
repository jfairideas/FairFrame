export type SceneType = "subject-present" | "location-scout";

export type ReportPhase = "initial" | "enhanced";

export type ShotGrade = "A" | "B" | "C" | "D" | "F";

export type PillarKey =
  | "communication"
  | "focus"
  | "clarity"
  | "context"
  | "storytelling"
  | "craft";

export type PillarRating = "strong" | "good" | "moderate" | "weak";

export interface StoryContext {
  assignmentTitle: string;
  storyBeat: string;
  audience?: string;
}

export interface PillarScores {
  communication: number;
  focus: number;
  clarity: number;
  context: number;
  storytelling: number;
  craft: number;
}

export interface WhatChiefSeesItem {
  pillar: PillarKey;
  rating: PillarRating;
  observation: string;
}

/** Sprint 3: where the eye travels, with visible anchors */
export interface VisualHierarchyStep {
  rank: 1 | 2 | 3;
  element: string;
  why: string;
}

export interface CaptureSession {
  imageUri: string;
  phase: ReportPhase;
  storyContext?: StoryContext;
}

export interface ChiefAnalysisResult {
  /** Sprint 3 — before any scores */
  firstImpression: string;
  sceneIdentification: string;
  visibleObjects: string[];
  visualHierarchy: VisualHierarchyStep[];
  hasPrimarySubject: boolean;

  assessment: string;
  phase: ReportPhase;
  sceneType: SceneType;
  pillars: PillarScores;
  visualStorytellingScore: number;
  shotGrade: ShotGrade;
  currentScore: number;
  potentialScore: number;
  strengths: string[];
  improvements: string[];
  whatChiefSees: WhatChiefSeesItem[];
  recommendations: string[];
}
