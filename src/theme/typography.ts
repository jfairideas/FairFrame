export const typography = {
  hero: { fontSize: 32, fontWeight: "700" as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: "600" as const, letterSpacing: -0.3 },
  headline: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: "500" as const, letterSpacing: 0.2 },
  label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2, textTransform: "uppercase" as const },
  score: { fontSize: 48, fontWeight: "700" as const, letterSpacing: -1 },
} as const;
