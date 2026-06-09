export type CardClassification =
  | "developing"
  | "strong"
  | "exceptional"
  | "chiefApproved"
  | "historic";

export type CardType = "press" | "frame" | "milestone" | "signature";

export interface PressCardViewModel {
  cardType: CardType;
  imageUri?: string;
  fairScore: number;
  fairScoreLabel: string;
  classification: CardClassification;
  classificationLabel: string;
  creatorName: string;
  serial: string;
  fairLevelAtCapture?: string;
  analysisId?: string;
}

/** Handbook 1080×1350 — photograph hero ~81%, ceremony placard ~17% */
export const CARD_LAYOUT = {
  width: 1080,
  height: 1350,
  outerMargin: 24,
  photoY: 24,
  photoHeight: 1094,
  ceremonyBridgeHeight: 6,
  placardGap: 0,
  placardY: 1124,
  placardHeight: 226,
  markWidth: 40,
} as const;
