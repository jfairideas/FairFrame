import { StyleSheet, Text, View } from "react-native";
import type { ChiefAnalysisSource } from "../services/chief";
import { colors, spacing, typography } from "../theme";

interface Props {
  source: ChiefAnalysisSource;
  fallbackReason?: string;
}

export function ChiefSourceBanner({ source, fallbackReason }: Props) {
  const isLive = source === "live-chief";

  return (
    <View style={[styles.banner, isLive ? styles.live : styles.preview]}>
      <Text style={[styles.label, isLive ? styles.liveText : styles.previewText]}>
        {isLive ? "LIVE CHIEF" : "OFFLINE PREVIEW"}
      </Text>
      {!isLive && fallbackReason && (
        <Text style={styles.reason} numberOfLines={3}>
          {fallbackReason}
        </Text>
      )}
      {!isLive && !fallbackReason && (
        <Text style={styles.reason}>Demo analysis — not connected to OpenAI</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  live: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: colors.success,
  },
  preview: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderColor: colors.warning,
  },
  label: {
    ...typography.label,
    letterSpacing: 1.5,
  },
  liveText: { color: colors.success },
  previewText: { color: colors.warning },
  reason: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
});
