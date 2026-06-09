import type { CardClassification } from "../types/cards";

/** Public 5-tier card classification per Master Handbook v1.1 §6 */
export function getCardClassification(fairScore: number): CardClassification {
  const s = Math.max(0, Math.min(10, fairScore));
  if (s < 5) return "developing";
  if (s < 6.5) return "strong";
  if (s < 8) return "exceptional";
  if (s < 9) return "chiefApproved";
  return "historic";
}

export const CARD_CLASSIFICATION_LABELS: Record<CardClassification, string> = {
  developing: "Developing",
  strong: "Strong",
  exceptional: "Exceptional",
  chiefApproved: "Chief Approved",
  historic: "Historic",
};

export function getCardClassificationLabel(classification: CardClassification): string {
  return CARD_CLASSIFICATION_LABELS[classification];
}
