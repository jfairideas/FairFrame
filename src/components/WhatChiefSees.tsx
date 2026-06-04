import { StyleSheet, Text, View } from "react-native";
import type { PillarRating, WhatChiefSeesItem } from "../types/analysis";
import { PILLAR_LABELS } from "../utils/pillars";
import { colors, spacing, typography } from "../theme";

interface Props {
  items: WhatChiefSeesItem[];
}

const RATING_COLORS: Record<PillarRating, string> = {
  strong: colors.success,
  good: colors.accent,
  moderate: colors.warning,
  weak: colors.danger,
};

function formatRating(rating: PillarRating): string {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

export function WhatChiefSees({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>What Chief sees</Text>
      {items.map((item) => (
        <View key={item.pillar} style={styles.row}>
          <View style={styles.header}>
            <Text style={styles.pillar}>{PILLAR_LABELS[item.pillar]}</Text>
            <Text style={[styles.rating, { color: RATING_COLORS[item.rating] }]}>
              {formatRating(item.rating)}
            </Text>
          </View>
          <Text style={styles.observation}>{item.observation}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  pillar: {
    ...typography.headline,
    fontSize: 15,
    color: colors.text,
  },
  rating: {
    ...typography.caption,
    fontWeight: "600",
  },
  observation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
