import { StyleSheet, Text, View } from "react-native";
import type { PillarScores as PillarScoresType } from "../types/analysis";
import { PILLAR_KEYS, PILLAR_LABELS } from "../utils/pillars";
import { colors, spacing, typography } from "../theme";

interface Props {
  pillars: PillarScoresType;
}

export function PillarScores({ pillars }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Visual storytelling pillars</Text>
      {PILLAR_KEYS.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{PILLAR_LABELS[key]}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pillars[key]}%` }]} />
          </View>
          <Text style={styles.value}>{pillars[key]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  title: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 100,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  value: {
    ...typography.caption,
    color: colors.text,
    width: 28,
    textAlign: "right",
  },
});
