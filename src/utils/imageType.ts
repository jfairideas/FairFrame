import type { ImageType } from "../types/analysis";

const LABELS: Record<ImageType, string> = {
  selfie: "Selfie",
  portrait: "Portrait",
  landscape: "Landscape",
  news: "News",
  documentary: "Documentary",
  street: "Street",
  sports: "Sports",
  wildlife: "Wildlife",
  architecture: "Architecture",
  product: "Product",
  commercial: "Commercial",
  drone: "Drone",
  other: "Other",
};

const VALID: ImageType[] = Object.keys(LABELS) as ImageType[];

export function normalizeImageType(value: unknown): ImageType {
  if (typeof value === "string" && VALID.includes(value as ImageType)) {
    return value as ImageType;
  }
  return "other";
}

export function imageTypeLabel(type: ImageType): string {
  return LABELS[type];
}
