export type SafetyTier = "green" | "yellow" | "red";

export type EthicsReasonCode =
  | "safe_general"
  | "sensitive_documentary"
  | "sensitive_medical"
  | "sensitive_violence_context"
  | "disallowed_sexual_exploitation"
  | "disallowed_csam"
  | "disallowed_extreme_gore"
  | "disallowed_hate_propaganda"
  | "uncertain_restrict"
  | "screening_unavailable";

export interface EthicsScreenResult {
  safetyTier: SafetyTier;
  reasonCode: EthicsReasonCode;
  analysisAllowed: boolean;
  recognitionAllowed: boolean;
  cardAllowed: boolean;
  progressAllowed: boolean;
  userMessage: string;
  screeningId?: string;
}

export const ETHICS_COPY = {
  green: "Continue to Chief analysis.",
  yellow:
    "This image appears sensitive. FairFrame can analyze visual craft, but recognition and sharing may be limited.",
  red: "FairFrame cannot analyze or score this image because it appears to violate our content eligibility rules.",
} as const;
