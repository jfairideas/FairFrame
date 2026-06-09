import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BUILD_6C_FLAGS } from "../../config/build6c";
import { useAuth } from "../../context/AuthContext";
import { fetchProfileProgression } from "../../services/progression";
import {
  buildProgressionStatus,
  formatNextLevelLabel,
} from "../../services/progressionStatus";
import { formatFairScore } from "../../utils/fairScore";
import { trackEvent } from "../../services/analytics";
import { colors, spacing, typography } from "../../theme";

interface Props {
  variant?: "compact" | "expanded";
}

export function ProgressWidget({ variant = "compact" }: Props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ReturnType<typeof buildProgressionStatus> | null>(null);

  useEffect(() => {
    if (!BUILD_6C_FLAGS.ENABLE_PROGRESS_WIDGET) return;

    let cancelled = false;
    async function load() {
      if (!auth.user || auth.user.is_anonymous) {
        setStatus(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const profile = await fetchProfileProgression(auth.user.id);
      if (!cancelled) {
        setStatus(buildProgressionStatus(profile));
        setLoading(false);
        void trackEvent("progress_widget_viewed", { variant });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.user, variant]);

  if (!BUILD_6C_FLAGS.ENABLE_PROGRESS_WIDGET) return null;

  if (!auth.user || auth.user.is_anonymous) {
    return (
      <View style={styles.card}>
        <Text style={styles.invite}>Sign in to track your progress.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator color={colors.accent} size="small" />
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>Progress unavailable right now.</Text>
      </View>
    );
  }

  const nextLabel = formatNextLevelLabel(status);

  return (
    <View style={[styles.card, variant === "expanded" && styles.cardExpanded]}>
      <Text style={styles.level}>{status.currentLevel}</Text>
      <Text style={styles.meta}>
        {status.totalFrames} frames analyzed
        {status.rollingAverage > 0 ? ` · rolling avg ${formatFairScore(status.rollingAverage)}` : ""}
      </Text>
      {nextLabel && <Text style={styles.next}>{nextLabel}</Text>}
      {variant === "expanded" && status.nextLevelDescription && (
        <Text style={styles.desc}>{status.nextLevelDescription}</Text>
      )}
      {!status.avgRequirementMet && status.framesRequirementMet && status.nextLevel && (
        <Text style={styles.hint}>
          You have the frame count. Raise your rolling average to continue.
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
  },
  cardExpanded: { marginBottom: spacing.md },
  center: { alignItems: "center", justifyContent: "center", minHeight: 72 },
  level: { ...typography.label, color: colors.accent, fontSize: 16 },
  meta: { ...typography.caption, color: colors.textSecondary },
  next: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  desc: { ...typography.caption, color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  invite: { ...typography.body, color: colors.textSecondary },
  muted: { ...typography.caption, color: colors.textMuted },
});
