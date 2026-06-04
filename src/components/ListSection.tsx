import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

interface ListSectionProps {
  title: string;
  items: string[];
  tone?: "neutral" | "positive";
}

export function ListSection({ title, items, tone = "neutral" }: ListSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <Text style={[styles.bullet, tone === "positive" && styles.bulletPositive]}>
            {tone === "positive" ? "+" : "–"}
          </Text>
          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.warning,
    width: 16,
  },
  bulletPositive: {
    color: colors.success,
  },
  item: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
});
