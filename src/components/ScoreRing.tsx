import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "large" | "medium";
}

export function ScoreRing({ score, label, size = "large" }: ScoreRingProps) {
  const isLarge = size === "large";
  return (
    <View style={styles.wrap}>
      <Text style={[styles.score, isLarge && styles.scoreLarge]}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  score: {
    ...typography.score,
    fontSize: 36,
    color: colors.text,
  },
  scoreLarge: {
    fontSize: 56,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
