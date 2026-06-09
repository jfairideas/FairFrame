import type { ChiefAnalysisResult } from "../types/analysis";
import type { PressCardViewModel } from "../types/cards";
import {
  getCardClassification,
  getCardClassificationLabel,
} from "./cardClassification";
import { generateDisplaySerial } from "./cardVerification";

export interface BuildPressCardInput {
  result: ChiefAnalysisResult;
  imageUri?: string;
  creatorName: string;
  fairLevelAtCapture?: string;
  analysisId?: string;
  serial?: string;
}

export function buildPressCardViewModel(input: BuildPressCardInput): PressCardViewModel {
  const classification = getCardClassification(input.result.fairScore);
  return {
    cardType: "press",
    imageUri: input.imageUri,
    fairScore: input.result.fairScore,
    fairScoreLabel: "FAIRSCORE",
    classification,
    classificationLabel: getCardClassificationLabel(classification),
    creatorName: input.creatorName,
    serial: input.serial ?? generateDisplaySerial(),
    fairLevelAtCapture: input.fairLevelAtCapture,
    analysisId: input.analysisId,
  };
}
