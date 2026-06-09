import { StyleSheet, Text, View } from "react-native";
import type { EthicsScreenResult } from "../../types/ethics";
import { colors, spacing, typography } from "../../theme";

interface Props {
  ethics: EthicsScreenResult;
}

export function EthicsNotice({ ethics }: Props) {
  if (ethics.safetyTier === "green") return null;

  const isRed = ethics.safetyTier === "red";

  return (
    <View style={[styles.wrap, isRed ? styles.red : styles.yellow]}>
      <Text style={styles.title}>{isRed ? "Content eligibility" : "Sensitive image notice"}</Text>
      <Text style={styles.body}>{ethics.userMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  yellow: {
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  red: {
    borderColor: colors.warning,
    backgroundColor: "rgba(255,180,80,0.08)",
  },
  title: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});
