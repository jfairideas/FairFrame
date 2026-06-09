import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { JourneyBar } from "../src/components/progress/JourneyBar";
import { LevelRequirementCard } from "../src/components/progress/LevelRequirementCard";
import { ProgressWidget } from "../src/components/progress/ProgressWidget";
import { AnalysisRemainingPill } from "../src/components/usage/AnalysisRemainingPill";
import { buildProgressionStatus } from "../src/services/progressionStatus";
import { Label } from "../src/components/Label";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { formatFairScore } from "../src/utils/fairScore";
import {
  fetchProfileProgression,
  type ProfileProgression,
} from "../src/services/progression";
import {
  EARNABLE_FAIR_LEVEL_REQUIREMENTS,
  type FairLevel,
} from "../src/types/fairLevel";
import { fairLevelIndex, progressToNextLevel } from "../src/services/fairLevel";
import { appRoutes } from "../src/lib/appRoutes";
import { colors, spacing, typography } from "../src/theme";

export default function ProgressScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [profile, setProfile] = useState<ProfileProgression | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth.user || auth.user.is_anonymous) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchProfileProgression(auth.user.id);
    setProfile(data);
    setLoading(false);
  }, [auth.user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!auth.user || auth.user.is_anonymous) {
    return (
      <Screen>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Sign in to track FairLevel and frame history.</Text>
        <Button label="Sign In" onPress={() => router.push("/login")} />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  const level = (profile?.current_fair_level ?? "Observer") as FairLevel;
  const total = profile?.total_frames_analyzed ?? 0;
  const rolling = profile?.rolling_average_fair_score ?? 0;
  const status = buildProgressionStatus(profile);
  const next = progressToNextLevel(level, total, rolling);
  const currentIdx = Math.min(
    fairLevelIndex(level),
    EARNABLE_FAIR_LEVEL_REQUIREMENTS.length - 1
  );

  return (
    <Screen scroll>
      <Text style={styles.title}>FairLevel Progress</Text>
      <Text style={styles.subtitle}>Frames analyzed build your visual judgment over time.</Text>

      <AnalysisRemainingPill />
      <ProgressWidget variant="expanded" />
      <JourneyBar currentLevel={level} />
      <LevelRequirementCard status={status} />

      <Card style={styles.heroCard}>
        <Label>Current FairLevel</Label>
        <Text style={styles.level}>{level}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Frames</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatFairScore(rolling)}</Text>
            <Text style={styles.statLabel}>Rolling avg</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {profile?.highest_fair_score ? formatFairScore(profile.highest_fair_score) : "—"}
            </Text>
            <Text style={styles.statLabel}>Lifetime best</Text>
          </View>
        </View>
        {profile?.best_classification && (
          <Text style={styles.bestClass}>Best classification: {profile.best_classification}</Text>
        )}
      </Card>

      {next.framesNeeded !== null && (
        <Card>
          <Label>Next level</Label>
          <Text style={styles.nextText}>
            {next.framesNeeded > 0
              ? `${next.framesNeeded} more frames`
              : "Frame count met"}
            {next.avgNeeded !== null && next.avgNeeded > 0
              ? ` · raise rolling avg by ${next.avgNeeded.toFixed(1)}`
              : ""}
          </Text>
        </Card>
      )}

      <View style={styles.ladder}>
        {EARNABLE_FAIR_LEVEL_REQUIREMENTS.map((req, idx) => {
          const reached = idx <= currentIdx;
          return (
            <View
              key={req.level}
              style={[styles.ladderRow, reached && styles.ladderRowReached]}
            >
              <Text style={[styles.ladderLevel, reached && styles.ladderLevelReached]}>
                {req.level}
              </Text>
              <Text style={styles.ladderDesc}>{req.description}</Text>
              <Text style={styles.ladderReq}>
                {req.minFrames !== null ? `${req.minFrames}+ frames` : ""}
                {req.minRollingAverage !== null ? ` · ${req.minRollingAverage}+ avg` : ""}
              </Text>
            </View>
          );
        })}
        <View style={styles.inviteOnlyRow}>
          <Text style={styles.inviteOnlyLabel}>Fair Circle</Text>
          <Text style={styles.inviteOnlyDesc}>Invite-only future membership — not earned through frames.</Text>
        </View>
      </View>

      <Button label="View Visual DNA" variant="secondary" onPress={() => router.push(appRoutes.dna)} />
      <Button label="Profile" variant="ghost" onPress={() => router.push(appRoutes.profile)} />
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  heroCard: { marginBottom: spacing.md, gap: spacing.sm },
  level: { ...typography.hero, color: colors.accent, fontSize: 32 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  stat: { alignItems: "center", flex: 1 },
  statValue: { ...typography.title, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },
  bestClass: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  nextText: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  ladder: { marginVertical: spacing.lg, gap: spacing.sm },
  ladderRow: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    opacity: 0.65,
  },
  ladderRowReached: { opacity: 1, borderColor: colors.accent },
  ladderLevel: { ...typography.label, color: colors.textMuted },
  ladderLevelReached: { color: colors.accent },
  ladderDesc: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  ladderReq: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  inviteOnlyRow: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    opacity: 0.5,
    marginTop: spacing.sm,
  },
  inviteOnlyLabel: { ...typography.label, color: colors.textMuted },
  inviteOnlyDesc: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
