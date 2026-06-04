import type {
  CaptureSession,
  ChiefAnalysisResult,
  ImageType,
  PillarScores,
  VisualHierarchyStep,
  WhatChiefSeesItem,
} from "../types/analysis";
import { legacyScoreFromFairScore } from "../utils/fairScore";
import {
  averagePillars,
  buildWhatChiefSeesFromPillars,
  scoreToRating,
} from "../utils/pillars";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function gradeFromFairScore(fairScore: number): ChiefAnalysisResult["shotGrade"] {
  if (fairScore >= 9) return "A";
  if (fairScore >= 8) return "B";
  if (fairScore >= 7) return "C";
  if (fairScore >= 6) return "D";
  return "F";
}

function mockPillars(base: number): PillarScores {
  const jitter = () => Math.floor(Math.random() * 10) - 4;
  return {
    communication: Math.min(95, base + jitter()),
    focus: Math.min(95, base + jitter()),
    clarity: Math.min(95, base + jitter()),
    context: Math.min(95, base + jitter()),
    storytelling: Math.min(95, base + jitter()),
    craft: Math.min(95, base + jitter()),
  };
}

interface MockTemplate {
  chiefsReaction: string;
  whatISaw: string[];
  fairScore: number;
  imageType: ImageType;
  whyItWorks: string[];
  chiefsAssignment: string;
  sceneIdentification: string;
  visualHierarchy: VisualHierarchyStep[];
  attentionGrabber: string;
  valueAssessment: string;
  hasPrimarySubject: boolean;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  assessment: string;
  whatChiefSeesObs: Partial<Record<keyof PillarScores, string>>;
}

const COMMERCIAL_LOCATION: MockTemplate = {
  chiefsReaction:
    "The gas price sign immediately grabs my attention. I know exactly where I am. What's missing is a human element that would elevate this from a location shot into a stronger photograph.",
  whatISaw: [
    "Gas price sign",
    "Fuel canopy",
    "Red van",
    "Asphalt foreground",
    "Concrete pad",
    "Sky",
    "Distant trees",
    "Utility poles",
  ],
  fairScore: 6.8,
  imageType: "commercial",
  whyItWorks: [
    "The price sign reads instantly — place and context land without a caption.",
    "The red van adds a color anchor under the canopy.",
    "Open sky keeps the frame from feeling cramped.",
  ],
  chiefsAssignment:
    "Make one frame where a person or hands-in-action connects the sign to a human story — same light, tighter composition.",
  sceneIdentification: "Gas station / commercial location",
  visualHierarchy: [
    {
      rank: 1,
      element: "Gas price sign",
      why: "Highest contrast and readable type — immediate orientation",
    },
    {
      rank: 2,
      element: "Red van under canopy",
      why: "Color mass pulls second; adds scale",
    },
    {
      rank: 3,
      element: "Bright sky band",
      why: "Open luminance along the top edge",
    },
  ],
  attentionGrabber: "Gas price sign and bright canopy edge",
  valueAssessment:
    "Attention is clear but mostly informational — value rises when a human or narrative detail appears.",
  hasPrimarySubject: false,
  strengths: [
    "Readable establish-er for place.",
    "Color accent from the van.",
  ],
  improvements: [
    "No human element — reads as record, not story.",
    "Foreground asphalt is a large inactive plane.",
    "Sign grabs attention but does not yet create emotional stay.",
  ],
  recommendations: [
    "Move closer so the sign and a person share one plane.",
    "Shoot a second frame at golden hour for warmer value on the canopy.",
  ],
  assessment:
    "You're close on place. The frame proves location fast, but FairScore stays moderate because attention does not yet convert into story value. Add one human beat and re-test hierarchy.",
  whatChiefSeesObs: {
    communication: "Sign communicates place immediately; story beat is thin.",
    focus: "Eye hits the sign first — expected for this scene type.",
    clarity: "Exposure is readable across the lot.",
    context: "Canopy and pumps establish commercial context.",
    storytelling: "Information without a human hook limits stay power.",
    craft: "Frame is level; foreground could be tighter.",
  },
};

const PORTRAIT: MockTemplate = {
  chiefsReaction:
    "My eye goes straight to the face — readable expression, workable separation from the wall. You're close; the brightest strip along the top edge is stealing a beat from the eyes.",
  whatISaw: [
    "Face",
    "Shoulders",
    "Background wall",
    "Soft light camera-left",
    "Headroom",
    "Bright top edge",
  ],
  fairScore: 7.6,
  imageType: "portrait",
  whyItWorks: [
    "Face lands in the center third with broadcast-ready sharpness.",
    "Shoulder line leaves lower-third room.",
    "Soft modeling light without harsh under-eye shadow.",
  ],
  chiefsAssignment:
    "Shift half a step to kill the bright top strip, then shoot a tight medium on the eyes — same light, more intimacy.",
  sceneIdentification: "Portrait / interview setup",
  visualHierarchy: [
    { rank: 1, element: "Face", why: "Human scale and contrast" },
    { rank: 2, element: "Bright top strip", why: "Competing luminance" },
    { rank: 3, element: "Background wall", why: "Low detail — stays subordinate" },
  ],
  attentionGrabber: "Face in the center third",
  valueAssessment: "Attention and value align — expression carries stay power.",
  hasPrimarySubject: true,
  strengths: [
    "Readable face with clean separation.",
    "Workable headroom for graphics.",
  ],
  improvements: [
    "Top highlight competes with the eyes.",
    "Environment is generic — add one identifying detail.",
  ],
  recommendations: [
    "Hold focus on the near eye at 100% before you roll.",
  ],
  assessment:
    "Strong human frame with one fixable distraction. FairScore reflects solid communication with room to sharpen hierarchy.",
  whatChiefSeesObs: {
    communication: "Expression reads as the message.",
    focus: "Eyes win first when the top strip is ignored.",
    clarity: "Even facial exposure.",
    context: "Neutral wall — person carries place.",
    storytelling: "Human moment present; environment could prove more.",
    craft: "Framing is workable; watch the top edge.",
  },
};

const KITCHEN: MockTemplate = {
  chiefsReaction:
    "The bright window above the sink owns the frame — I know it's a kitchen. The refrigerator on the right fights it for attention. Decide which element sells the story.",
  whatISaw: [
    "Window above sink",
    "Refrigerator",
    "Cabinets",
    "Countertop",
    "Sink",
    "Floor tile",
  ],
  fairScore: 7.1,
  imageType: "architecture",
  whyItWorks: [
    "Window gives a clear light anchor.",
    "Counter line adds depth.",
    "Space reads as lived-in kitchen.",
  ],
  chiefsAssignment:
    "Pick window OR refrigerator as hero — darken the other with position or exposure, then add one detail that shows action at the sink.",
  sceneIdentification: "Kitchen interior",
  visualHierarchy: [
    { rank: 1, element: "Window", why: "Brightest area" },
    { rank: 2, element: "Refrigerator", why: "Large vertical mass" },
    { rank: 3, element: "Counter line", why: "Leads across the scene" },
  ],
  attentionGrabber: "Window luminance",
  valueAssessment: "Place is clear; narrative value needs action or detail.",
  hasPrimarySubject: false,
  strengths: ["Clear room identity.", "Strong leading line on the counter."],
  improvements: [
    "Two equal anchors compete.",
    "No action at the sink yet.",
  ],
  recommendations: [
    "Bracket the window for exterior detail.",
  ],
  assessment:
    "Good observation frame for space. Value climbs when you commit to one visual hero and add story detail.",
  whatChiefSeesObs: {
    communication: "Room type reads fast.",
    focus: "Window wins first look.",
    clarity: "Readable exposure except blown window.",
    context: "Fixtures establish kitchen.",
    storytelling: "Place without action.",
    craft: "Geometry is clean; clutter lower left breaks flow.",
  },
};

function buildFromTemplate(template: MockTemplate): ChiefAnalysisResult {
  const pillars = mockPillars(Math.round(template.fairScore * 10));
  const visualStorytellingScore = legacyScoreFromFairScore(template.fairScore);
  const whatChiefSees: WhatChiefSeesItem[] = (
    Object.keys(pillars) as (keyof PillarScores)[]
  ).map((key) => ({
    pillar: key as WhatChiefSeesItem["pillar"],
    rating: scoreToRating(pillars[key as keyof PillarScores]),
    observation:
      template.whatChiefSeesObs[key as keyof PillarScores] ??
      `Chief notes ${key} on this frame.`,
  }));

  return {
    chiefsReaction: template.chiefsReaction,
    whatISaw: template.whatISaw,
    fairScore: template.fairScore,
    imageType: template.imageType,
    whyItWorks: template.whyItWorks,
    chiefsAssignment: template.chiefsAssignment,
    sceneIdentification: template.sceneIdentification,
    visibleObjects: template.whatISaw,
    visualHierarchy: template.visualHierarchy,
    attentionGrabber: template.attentionGrabber,
    valueAssessment: template.valueAssessment,
    pillars,
    whatChiefSees,
    assessment: template.assessment,
    strengths: template.strengths,
    improvements: template.improvements,
    recommendations: template.recommendations,
    shotGrade: gradeFromFairScore(template.fairScore),
    firstImpression: template.chiefsReaction,
    hasPrimarySubject: template.hasPrimarySubject,
    sceneType: template.hasPrimarySubject ? "subject-present" : "location-scout",
    visualStorytellingScore,
    currentScore: visualStorytellingScore,
    potentialScore: Math.min(98, visualStorytellingScore + 9),
  };
}

export async function analyzeWithChief(_session: CaptureSession): Promise<ChiefAnalysisResult> {
  await delay(2400);
  const roll = Math.random();
  const template =
    roll > 0.66 ? COMMERCIAL_LOCATION : roll > 0.33 ? PORTRAIT : KITCHEN;
  return buildFromTemplate(template);
}
