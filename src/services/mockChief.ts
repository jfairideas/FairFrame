import type {
  CaptureSession,
  ChiefAnalysisResult,
  PillarScores,
  SceneType,
  VisualHierarchyStep,
  WhatChiefSeesItem,
} from "../types/analysis";
import {
  averagePillars,
  buildWhatChiefSeesFromPillars,
  scoreToRating,
} from "../utils/pillars";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function gradeFromScore(score: number): ChiefAnalysisResult["shotGrade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function mockPillars(base: number, enhanced: boolean): PillarScores {
  const jitter = () => Math.floor(Math.random() * 10) - 4;
  return {
    communication: Math.min(95, base + jitter()),
    focus: Math.min(95, base + jitter()),
    clarity: Math.min(95, base + jitter()),
    context: Math.min(95, base + jitter()),
    storytelling: Math.min(95, base + jitter() + (enhanced ? 6 : 0)),
    craft: Math.min(95, base + jitter()),
  };
}

type MockTemplate = Omit<
  ChiefAnalysisResult,
  | "phase"
  | "pillars"
  | "visualStorytellingScore"
  | "shotGrade"
  | "currentScore"
  | "potentialScore"
  | "whatChiefSees"
  | "assessment"
>;

const KITCHEN_TEMPLATE: MockTemplate = {
  firstImpression:
    "This frame feels clean and organized, but my eye keeps bouncing between the bright window above the sink and the refrigerator on the right. The space has strong leading lines along the countertop, but I don't yet know what the story is.",
  sceneIdentification: "Kitchen interior",
  visibleObjects: [
    "Refrigerator",
    "Sink",
    "Window",
    "Upper cabinets",
    "Countertop",
    "Cleaning supplies",
    "Floor tile",
    "Range hood",
  ],
  visualHierarchy: [
    {
      rank: 1,
      element: "Bright window above the sink",
      why: "Highest luminance in frame — pulls the eye before anything else",
    },
    {
      rank: 2,
      element: "White refrigerator on the right",
      why: "Large vertical mass with high contrast against the darker cabinets",
    },
    {
      rank: 3,
      element: "Countertop leading line",
      why: "Horizontal edge carries the eye from left to right across the scene",
    },
  ],
  hasPrimarySubject: false,
  sceneType: "location-scout",
  strengths: [
    "The window above the sink gives a clear, bright anchor and explains the light direction across the countertop.",
    "Cabinet lines and the countertop edge create depth from foreground tile to back wall.",
    "The refrigerator's vertical mass balances the window on the opposite side of the frame.",
  ],
  improvements: [
    "The bright window and refrigerator compete equally — decide which one sells the story and darken or reframe the other.",
    "Cleaning supplies on the counter add clutter in the lower left; clear or reframe so the eye stays on the space.",
    "No human presence or narrative detail — add a person at the sink or a detail shot of what changed in this kitchen.",
  ],
  recommendations: [
    "Shoot a second frame from the left side of the room to reduce the refrigerator's weight and feature the window as establish-er.",
    "Bracket exposure for the window so you retain outside detail instead of blowing it white.",
    "Record natural sound at the sink — water, dishes — to anchor the kitchen in audio even if this frame stays wide.",
  ],
};

const PORTRAIT_TEMPLATE: MockTemplate = {
  firstImpression:
    "My eye goes straight to the person in the center of the frame — the face is readable and the background falls off softly. The story feels present, but the brightest strip along the top edge competes for attention.",
  sceneIdentification: "Interview / portrait setup",
  visibleObjects: [
    "Person (primary)",
    "Face",
    "Shoulders",
    "Background wall",
    "Soft light on camera-left",
    "Upper headroom",
    "Lower-third safe area",
  ],
  visualHierarchy: [
    {
      rank: 1,
      element: "Person's face in the center third",
      why: "Sharp contrast and human scale — natural focal point",
    },
    {
      rank: 2,
      element: "Bright strip along top of background",
      why: "Secondary luminance pulls a quick glance off the eyes",
    },
    {
      rank: 3,
      element: "Blurred background wall",
      why: "Lower detail keeps separation on the subject",
    },
  ],
  hasPrimarySubject: true,
  sceneType: "subject-present",
  strengths: [
    "The person's face in the center third is sharp enough for broadcast with workable separation from the wall.",
    "Shoulder line and headroom leave space for a lower-third without crowding the chin.",
    "Soft light on camera-left models the face without harsh under-eye shadow.",
  ],
  improvements: [
    "The bright strip along the top of the background steals a beat of attention from the eyes — flag it or reframe.",
    "Vertical lines in the background merge near the shoulders — shift half a step to clear merges.",
    "Story beat is emotional but the environment is generic — include one identifying detail in background or foreground.",
  ],
  recommendations: [
    "Tighten to a medium after this wide — same light, same position, more intimacy on the eyes.",
    "Hold focus on the near eye; recheck at 100% before you roll the interview.",
    "Capture a cutaway in this space that proves location while the person resets.",
  ],
};

function buildWhatChiefSeesForTemplate(
  pillars: PillarScores,
  template: MockTemplate,
  enhanced: boolean,
  assignment?: string
): WhatChiefSeesItem[] {
  const obs = template.hasPrimarySubject
    ? {
        communication:
          "The person's expression and posture in the center read as the message — background stays subordinate.",
        focus: "Eye lands on the face first; the bright top strip is the only serious competitor.",
        clarity: "Facial exposure is even; skin tones separate from the wall behind the shoulders.",
        context: "Background is neutral — context comes from the person, not the room details.",
        storytelling: enhanced && assignment
          ? `Frame supports "${assignment}" through expression, though environment does not yet prove place.`
          : "Human moment reads, but the frame alone does not explain why the story matters now.",
        craft: "Headroom and shoulder framing are workable; watch the bright edge along the top of frame.",
      }
    : {
        communication:
          "The room communicates domestic space — window and appliances tell 'kitchen' before any caption.",
        focus: "Brightness at the window wins first; refrigerator on the right pulls second.",
        clarity: "Overall exposure is readable; window area is brightest and loses exterior detail.",
        context: "Cabinets, sink, and floor tile establish a lived-in kitchen clearly.",
        storytelling:
          "Place is clear, narrative is not — nothing in frame shows action or change yet.",
        craft: "Countertop line is strong; clutter lower left breaks the otherwise clean geometry.",
      };
  return buildWhatChiefSeesFromPillars(pillars, obs);
}

function buildFromTemplate(
  template: MockTemplate,
  session: CaptureSession
): ChiefAnalysisResult {
  const enhanced = session.phase === "enhanced" && Boolean(session.storyContext);
  const base = template.hasPrimarySubject ? 76 : 70;
  const pillars = mockPillars(base, enhanced);
  const currentScore = averagePillars(pillars);
  const potentialScore = Math.min(98, currentScore + 7 + Math.floor(Math.random() * 5));
  const whatChiefSees = buildWhatChiefSeesForTemplate(
    pillars,
    template,
    enhanced,
    session.storyContext?.assignmentTitle
  );

  let assessment = template.hasPrimarySubject
    ? "After observing the interview setup, the person carries the frame with workable face exposure — tighten background distractions before you roll."
    : "After reading this kitchen, place is clear but story is not — decide whether window or refrigerator is your hero, then shoot detail that proves the beat.";

  if (enhanced && session.storyContext) {
    assessment = `With your assignment "${session.storyContext.assignmentTitle}" in mind: ${assessment}`;
  }

  return {
    ...template,
    phase: session.phase,
    pillars,
    visualStorytellingScore: currentScore,
    shotGrade: gradeFromScore(currentScore),
    currentScore,
    potentialScore,
    whatChiefSees,
    assessment,
  };
}

export async function analyzeWithChief(session: CaptureSession): Promise<ChiefAnalysisResult> {
  await delay(2400);
  const template = Math.random() > 0.45 ? PORTRAIT_TEMPLATE : KITCHEN_TEMPLATE;
  return buildFromTemplate(template, session);
}
