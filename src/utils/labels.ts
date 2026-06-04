import type { ReportPhase, SceneType } from "../types/analysis";

export function reportPhaseLabel(phase: ReportPhase): string {
  return phase === "enhanced" ? "Enhanced Report" : "Chief Report";
}

export function sceneTypeLabel(scene: SceneType): string {
  return scene === "subject-present" ? "Subject Present" : "Location Scout";
}
