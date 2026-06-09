import type { CardClassification } from "../types/cards";
import { getCardAtmosphereTokens, getCardColorTokens } from "./cardColors";

export type CeremonyPersonality =
  | "potential"
  | "recognition"
  | "prestige"
  | "endorsement"
  | "legacy";

export type CornerCeremonyStyle =
  | "ascent"
  | "balanced"
  | "radiant"
  | "seal"
  | "archival";

export interface AtmosphereRecipe {
  personality: CeremonyPersonality;
  emotion: string;
  borderWidth: number;
  shadowRadius: number;
  shadowOpacity: number;
  gradientStart: { x: number; y: number };
  gradientEnd: { x: number; y: number };
  cornerStyle: CornerCeremonyStyle;
  bridgeHeight: number;
  frameRadius: number;
  /** Optional fourth gradient stop for endorsement/prestige tiers */
  gradientStops?: [string, string, string, string];
}

/** Tier-specific atmosphere recipes — not color swaps; distinct recognition ceremonies. */
export const ATMOSPHERE_RECIPES: Record<CardClassification, AtmosphereRecipe> = {
  developing: {
    personality: "potential",
    emotion: "Potential",
    borderWidth: 2,
    shadowRadius: 22,
    shadowOpacity: 0.32,
    gradientStart: { x: 0.5, y: 1 },
    gradientEnd: { x: 0.5, y: 0 },
    cornerStyle: "ascent",
    bridgeHeight: 3,
    frameRadius: 6,
  },
  strong: {
    personality: "recognition",
    emotion: "Recognition",
    borderWidth: 3,
    shadowRadius: 14,
    shadowOpacity: 0.44,
    gradientStart: { x: 0, y: 0.5 },
    gradientEnd: { x: 1, y: 0.5 },
    cornerStyle: "balanced",
    bridgeHeight: 4,
    frameRadius: 4,
  },
  exceptional: {
    personality: "prestige",
    emotion: "Prestige",
    borderWidth: 4,
    shadowRadius: 24,
    shadowOpacity: 0.56,
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
    cornerStyle: "radiant",
    bridgeHeight: 5,
    frameRadius: 4,
  },
  chiefApproved: {
    personality: "endorsement",
    emotion: "Endorsement",
    borderWidth: 3,
    shadowRadius: 16,
    shadowOpacity: 0.48,
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 0.35 },
    cornerStyle: "seal",
    bridgeHeight: 4,
    frameRadius: 3,
  },
  historic: {
    personality: "legacy",
    emotion: "Legacy",
    borderWidth: 1.5,
    shadowRadius: 8,
    shadowOpacity: 0.22,
    gradientStart: { x: 0, y: 0.5 },
    gradientEnd: { x: 1, y: 0.5 },
    cornerStyle: "archival",
    bridgeHeight: 2,
    frameRadius: 2,
  },
};

export interface CeremonyTypography {
  awardTitleSize: number;
  awardTitleTracking: number;
  scoreSize: number;
  scoreLabelSize: number;
  creatorSize: number;
  serialSize: number;
}

export const CEREMONY_TYPOGRAPHY: Record<CardClassification, CeremonyTypography> = {
  developing: { awardTitleSize: 40, awardTitleTracking: 1.2, scoreSize: 44, scoreLabelSize: 8, creatorSize: 14, serialSize: 10 },
  strong: { awardTitleSize: 42, awardTitleTracking: 1, scoreSize: 46, scoreLabelSize: 8, creatorSize: 14, serialSize: 10 },
  exceptional: { awardTitleSize: 44, awardTitleTracking: 1.4, scoreSize: 48, scoreLabelSize: 9, creatorSize: 14, serialSize: 10 },
  chiefApproved: { awardTitleSize: 42, awardTitleTracking: 1.1, scoreSize: 46, scoreLabelSize: 8, creatorSize: 14, serialSize: 10 },
  historic: { awardTitleSize: 40, awardTitleTracking: 2, scoreSize: 44, scoreLabelSize: 8, creatorSize: 14, serialSize: 10 },
};

export function getAtmosphereRecipe(classification: CardClassification): AtmosphereRecipe {
  return ATMOSPHERE_RECIPES[classification];
}

export function getCeremonyTypography(classification: CardClassification): CeremonyTypography {
  return CEREMONY_TYPOGRAPHY[classification];
}

export function getCeremonyGradientColors(
  classification: CardClassification
): readonly [string, string, ...string[]] {
  const tokens = getCardAtmosphereTokens(classification);
  const recipe = getAtmosphereRecipe(classification);

  if (classification === "chiefApproved") {
    const colors = getCardColorTokens(classification);
    return [colors.primary, colors.secondary, colors.accent, colors.primary];
  }

  if (classification === "exceptional") {
    return [tokens.primary, tokens.secondary, tokens.accent, tokens.secondary];
  }

  return tokens.gradientStops;
}
