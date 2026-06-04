import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ChiefAnalysisResult } from "../types/analysis";
import { Label } from "./Label";
import { ListSection } from "./ListSection";
import { PillarScores } from "./PillarScores";
import { WhatChiefSees } from "./WhatChiefSees";
import { colors, spacing, typography } from "../theme";

interface Props {
  result: ChiefAnalysisResult;
}

export function ExpandableFullAnalysis({ result }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.toggleText}>
          {open ? "Hide Full Analysis" : "Expand Full Analysis"}
        </Text>
        <Text style={styles.chevron}>{open ? "−" : "+"}</Text>
      </Pressable>

      {open && (
        <View style={styles.body}>
          {(result.attentionGrabber || result.valueAssessment) && (
            <View style={styles.block}>
              <Label>Attention vs value</Label>
              {result.attentionGrabber ? (
                <Text style={styles.line}>
                  <Text style={styles.bold}>Attention: </Text>
                  {result.attentionGrabber}
                </Text>
              ) : null}
              {result.valueAssessment ? (
                <Text style={styles.line}>
                  <Text style={styles.bold}>Value: </Text>
                  {result.valueAssessment}
                </Text>
              ) : null}
            </View>
          )}

          <View style={styles.block}>
            <Label>Chief's deeper read</Label>
            <Text style={styles.assessment}>{result.assessment}</Text>
          </View>

          {result.visualHierarchy.length > 0 && (
            <View style={styles.block}>
              <Label>Visual hierarchy</Label>
              {result.visualHierarchy.map((step) => (
                <Text key={step.rank} style={styles.line}>
                  {step.rank}. {step.element} — {step.why}
                </Text>
              ))}
            </View>
          )}

          <PillarScores pillars={result.pillars} />
          <WhatChiefSees items={result.whatChiefSees} />
          <ListSection title="Strengths (detail)" items={result.strengths} tone="positive" />
          <ListSection title="Improvements" items={result.improvements} />
          <ListSection title="Recommendations" items={result.recommendations} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  toggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toggleText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "600",
  },
  chevron: {
    ...typography.headline,
    color: colors.accent,
  },
  body: { gap: spacing.lg, marginTop: spacing.md },
  block: { gap: spacing.sm },
  assessment: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  line: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  bold: { color: colors.text, fontWeight: "600" },
});
