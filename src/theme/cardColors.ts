import type { CardClassification } from "../types/cards";

export interface CardColorTokens {
  primary: string;
  secondary: string;
  accent: string;
}

export const CardClassificationColors: Record<CardClassification, CardColorTokens> = {
  developing: { primary: "#2F80FF", secondary: "#00D1C7", accent: "#D9E2EC" },
  strong: { primary: "#D4AF37", secondary: "#FFB000", accent: "#FFF4D6" },
  exceptional: { primary: "#5B21B6", secondary: "#8B5CF6", accent: "#FFFFFF" },
  chiefApproved: { primary: "#00A86B", secondary: "#D4AF37", accent: "#FFFFFF" },
  historic: { primary: "#050505", secondary: "#D7DCE2", accent: "#FFFFFF" },
} as const;

export function getCardColorTokens(classification: CardClassification): CardColorTokens {
  return CardClassificationColors[classification];
}

/** Placard-safe text colors — Historic uses platinum/white on dark placard, not near-black primary. */
export interface CardTextColors {
  score: string;
  classification: string;
  serial: string;
}

export function getCardTextColors(classification: CardClassification): CardTextColors {
  const tokens = getCardColorTokens(classification);

  if (classification === "historic") {
    return {
      score: tokens.secondary,
      classification: tokens.accent,
      serial: tokens.secondary,
    };
  }

  return {
    score: tokens.primary,
    classification: tokens.primary,
    serial: tokens.secondary,
  };
}

export interface CardAtmosphereTokens extends CardColorTokens {
  gradientStops: [string, string, string];
  haloSecondary: string;
  hairlineAccent: string;
  bloomSecondary: string;
  bloomAccent: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getCardAtmosphereTokens(classification: CardClassification): CardAtmosphereTokens {
  const tokens = getCardColorTokens(classification);
  return {
    ...tokens,
    gradientStops: [tokens.primary, tokens.secondary, tokens.accent],
    haloSecondary: hexToRgba(tokens.secondary, 0.38),
    hairlineAccent: hexToRgba(tokens.accent, 0.55),
    bloomSecondary: hexToRgba(tokens.secondary, 0.28),
    bloomAccent: hexToRgba(tokens.accent, 0.22),
  };
}
