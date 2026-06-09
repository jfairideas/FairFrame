import { StyleSheet, Text, View } from "react-native";
import type { ProgressionStatus } from "../../types/progressionStatus";
import { EARNABLE_FAIR_LEVEL_REQUIREMENTS } from "../../types/fairLevel";
import { formatFairScore } from "../../utils/fairScore";
import { colors, spacing, typography } from "../../theme";

interface Props {
  status: ProgressionStatus;
}

export function LevelRequirementCard({ status }: Props) {
  if (!status.nextLevel) return null;

  const req = EARNABLE_FAIR_LEVEL_REQUIREMENTS.find((r) => r.level === status.nextLevel);
  if (!req) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Next: {status.nextLevel}</Text>
      <Text style={styles.desc}>{req.description}</Text>
      {req.minFrames !== null && (
        <Text style={styles.line}>
          Frames: {status.totalFrames} / {req.minFrames}
          {status.framesRequirementMet ? " ✓" : ""}
        </Text>
      )}
      {req.minRollingAverage !== null && (
        <Text style={styles.line}>
          Rolling avg: {formatFairScore(status.rollingAverage)} / {formatFairScore(req.minRollingAverage)}
          {status.avgRequirementMet ? " ✓" : ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: { ...typography.label, color: colors.accent },
  desc: { ...typography.body, color: colors.text },
  line: { ...typography.caption, color: colors.textSecondary },
});
