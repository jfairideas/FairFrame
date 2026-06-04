/** FairScore is 0.0–10.0 (one decimal) for display */
export function formatFairScore(score: number): string {
  const clamped = Math.max(0, Math.min(10, score));
  return clamped.toFixed(1);
}

export function fairScoreFromLegacy(visualStorytellingScore: number): number {
  return Math.round((visualStorytellingScore / 10) * 10) / 10;
}

export function legacyScoreFromFairScore(fairScore: number): number {
  return Math.round(fairScore * 10);
}
