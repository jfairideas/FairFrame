import type { SceneType } from "../types/analysis";

export function sceneTypeLabel(scene: SceneType): string {
  return scene === "subject-present" ? "Subject present" : "Location";
}
