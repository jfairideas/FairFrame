import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BUILD_6C_FLAGS } from "../../config/build6c";
import { trackEvent } from "../../services/analytics";
import { fairLevelIndex } from "../../services/fairLevel";
import { JOURNEY_BAR_LEVELS, type FairLevel } from "../../types/fairLevel";
import { colors, spacing, typography } from "../../theme";

interface Props {
  currentLevel: FairLevel;
  onLevelPress?: (level: FairLevel) => void;
}

export function JourneyBar({ currentLevel, onLevelPress }: Props) {
  useEffect(() => {
    if (BUILD_6C_FLAGS.ENABLE_JOURNEY_BAR) {
      void trackEvent("journey_bar_viewed");
    }
  }, []);

  if (!BUILD_6C_FLAGS.ENABLE_JOURNEY_BAR) return null;

  const currentIdx = fairLevelIndex(currentLevel);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Your journey</Text>
      <View style={styles.track}>
        {JOURNEY_BAR_LEVELS.map((level, idx) => {
          const isCurrent = level === currentLevel;
          const isReached = idx <= currentIdx;
          return (
            <Pressable
              key={level}
              onPress={() => onLevelPress?.(level)}
              style={[styles.node, isReached && styles.nodeReached, isCurrent && styles.nodeCurrent]}
            >
              <View style={[styles.dot, isCurrent && styles.dotCurrent, isReached && styles.dotReached]} />
              <Text
                style={[
                  styles.label,
                  isReached && styles.labelReached,
                  isCurrent && styles.labelCurrent,
                ]}
                numberOfLines={2}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>Fair Circle remains invite-only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginVertical: spacing.md },
  title: { ...typography.label, color: colors.textSecondary },
  track: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  node: {
    flexBasis: "30%",
    flexGrow: 1,
    minWidth: 96,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    opacity: 0.55,
    alignItems: "center",
    gap: 6,
  },
  nodeReached: { opacity: 0.85 },
  nodeCurrent: { opacity: 1, borderColor: colors.accent },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dotReached: { backgroundColor: colors.textSecondary },
  dotCurrent: { backgroundColor: colors.accent, width: 10, height: 10, borderRadius: 5 },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 10,
  },
  labelReached: { color: colors.textSecondary },
  labelCurrent: { color: colors.accent, fontWeight: "700" },
  note: { ...typography.caption, color: colors.textMuted, fontStyle: "italic" },
});
