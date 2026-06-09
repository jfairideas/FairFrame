import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BUILD_6C_FLAGS } from "../../config/build6c";
import { useAuth } from "../../context/AuthContext";
import { canInvokeLiveChief } from "../../lib/liveChiefAccess";
import { dailyUsageCopy, fetchDailyUsage } from "../../services/dailyUsage";
import { trackEvent } from "../../services/analytics";
import { colors, spacing, typography } from "../../theme";

export function AnalysisRemainingPill() {
  const auth = useAuth();
  const [copy, setCopy] = useState<string | null>(null);

  useEffect(() => {
    if (!BUILD_6C_FLAGS.ENABLE_ANALYSIS_REMAINING) return;
    if (!auth.user || auth.user.is_anonymous) return;

    let cancelled = false;
    async function load() {
      const access = await canInvokeLiveChief();
      const usage = await fetchDailyUsage();
      if (!cancelled) {
        setCopy(dailyUsageCopy(usage, access.allowed));
        void trackEvent("analysis_limit_viewed", {
          used: usage.used,
          remaining: usage.remaining,
        });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  if (!BUILD_6C_FLAGS.ENABLE_ANALYSIS_REMAINING) return null;
  if (!auth.user || auth.user.is_anonymous || !copy) return null;

  const atLimit = copy.includes("used today's free analyses");

  return (
    <View style={[styles.pill, atLimit && styles.pillLimit]}>
      <Text style={[styles.text, atLimit && styles.textLimit]}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  pillLimit: { borderColor: colors.textMuted },
  text: { ...typography.caption, color: colors.textSecondary },
  textLimit: { color: colors.text },
});
