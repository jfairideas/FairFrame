import type { CardClassification, PressCardViewModel } from "../types/cards";
import {
  getCardClassification,
  getCardClassificationLabel,
} from "./cardClassification";
import { generateDisplaySerial } from "./cardVerification";

/** Representative scores for the five-tier founder visual audit matrix. */
export const CEREMONY_AUDIT_SCORES: Record<CardClassification, number> = {
  developing: 4.0,
  strong: 6.0,
  exceptional: 7.5,
  chiefApproved: 8.5,
  historic: 9.5,
};

export const CEREMONY_AUDIT_ORDER: CardClassification[] = [
  "developing",
  "strong",
  "exceptional",
  "chiefApproved",
  "historic",
];

export function buildCeremonyAuditCard(
  classification: CardClassification,
  imageUri: string,
  creatorName = "Creator"
): PressCardViewModel {
  const fairScore = CEREMONY_AUDIT_SCORES[classification];
  return {
    cardType: "press",
    imageUri,
    fairScore,
    fairScoreLabel: "FAIRSCORE",
    classification,
    classificationLabel: getCardClassificationLabel(classification),
    creatorName,
    serial: generateDisplaySerial(),
  };
}

export function buildCeremonyAuditMatrix(
  imageUri: string,
  creatorName = "Creator"
): PressCardViewModel[] {
  return CEREMONY_AUDIT_ORDER.map((classification) =>
    buildCeremonyAuditCard(classification, imageUri, creatorName)
  );
}

export function scoreToAuditClassification(score: number): CardClassification {
  return getCardClassification(score);
}
