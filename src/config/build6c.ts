/** Build 6C feature flags — simple rollback without formal flag service. */
export const BUILD_6C_FLAGS = {
  ENABLE_PROGRESS_WIDGET: true,
  ENABLE_JOURNEY_BAR: true,
  ENABLE_ANALYSIS_REMAINING: true,
  ENABLE_ETHICS_LAYER: true,
  ENABLE_WEIGHTED_LEVELS: true,
  ENABLE_MILESTONE_SCAFFOLD: true,
} as const;

/** Display daily analysis cap (founder beta may have higher server limit). */
export const DAILY_ANALYSIS_DISPLAY_LIMIT = 15;
