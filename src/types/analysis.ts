export type ImageType =
  | "selfie"
  | "portrait"
  | "landscape"
  | "news"
  | "documentary"
  | "street"
  | "sports"
  | "wildlife"
  | "architecture"
  | "product"
  | "commercial"
  | "drone"
  | "other";

/** @deprecated Sprint 4 — kept for DB/history compatibility */
export type SceneType = "subject-present" | "location-scout";

export type ShotGrade = "A" | "B" | "C" | "D" | "F";

export type PillarKey =
  | "communication"
  | "focus"
  | "clarity"
  | "context"
  | "storytelling"
  | "craft";

export type PillarRating = "strong" | "good" | "moderate" | "weak";

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

export interface VisualHierarchyStep {
  rank: 1 | 2 | 3;
  element: string;
  why: string;
}

export interface CaptureSession {
  imageUri: string;
}

export interface ChiefAnalysisResult {
  /** Sprint 4 — primary surface */
  chiefsReaction: string;
  whatISaw: string[];
  fairScore: number;
  imageType: ImageType;
  whyItWorks: string[];
  chiefsAssignment: string;

  /** Expandable full analysis */
  sceneIdentification: string;
  visibleObjects: string[];
  visualHierarchy: VisualHierarchyStep[];
  attentionGrabber: string;
  valueAssessment: string;
  pillars: PillarScores;
  whatChiefSees: WhatChiefSeesItem[];
  assessment: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  shotGrade: ShotGrade;

  /** Legacy fields for history / parsers */
  firstImpression: string;
  hasPrimarySubject: boolean;
  sceneType: SceneType;
  visualStorytellingScore: number;
  currentScore: number;
  potentialScore: number;
}
