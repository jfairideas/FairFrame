import { StyleSheet, Text, View } from "react-native";
import type { ChiefAnalysisResult } from "../types/analysis";
import { Label } from "./Label";
import { colors, spacing, typography } from "../theme";

interface Props {
  result: ChiefAnalysisResult;
}

export function ChiefObservation({ result }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.impressionBlock}>
        <Label>Chief's first impression</Label>
        <Text style={styles.impression}>{result.firstImpression}</Text>
      </View>

      <View style={styles.block}>
        <Label>Scene</Label>
        <Text style={styles.body}>{result.sceneIdentification}</Text>
      </View>

      <View style={styles.block}>
        <Label>Visible in frame</Label>
        <View style={styles.chips}>
          {result.visibleObjects.map((obj) => (
            <View key={obj} style={styles.chip}>
              <Text style={styles.chipText}>{obj}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Label>Visual hierarchy</Label>
        {result.visualHierarchy.map((step) => (
          <View key={step.rank} style={styles.hierarchyRow}>
            <Text style={styles.rank}>{step.rank}</Text>
            <View style={styles.hierarchyBody}>
              <Text style={styles.hierarchyElement}>{step.element}</Text>
              <Text style={styles.hierarchyWhy}>{step.why}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  impressionBlock: { gap: spacing.sm },
  impression: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    fontStyle: "italic",
  },
  block: { gap: spacing.sm },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  hierarchyRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rank: {
    ...typography.headline,
    color: colors.accent,
    width: 20,
  },
  hierarchyBody: { flex: 1 },
  hierarchyElement: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  hierarchyWhy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
});
