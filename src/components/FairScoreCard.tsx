import { StyleSheet, Text, View } from "react-native";
import { formatFairScore } from "../utils/fairScore";
import { colors, spacing, typography } from "../theme";

const SUBTEXT =
  "How effectively this image captures attention, communicates its purpose, and creates value for the viewer.";

interface Props {
  fairScore: number;
}

export function FairScoreCard({ fairScore }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>FairScore</Text>
      <Text style={styles.score}>
        {formatFairScore(fairScore)}
        <Text style={styles.outOf}> / 10</Text>
      </Text>
      <Text style={styles.subtext}>{SUBTEXT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.sm },
  label: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  score: {
    ...typography.score,
    fontSize: 56,
    color: colors.text,
  },
  outOf: {
    fontSize: 28,
    color: colors.textSecondary,
  },
  subtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
});
