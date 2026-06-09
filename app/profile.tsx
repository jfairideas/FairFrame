import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { JourneyBar } from "../src/components/progress/JourneyBar";
import { ProgressWidget } from "../src/components/progress/ProgressWidget";
import type { FairLevel } from "../src/types/fairLevel";
import { Label } from "../src/components/Label";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { fetchProfileProgression, type ProfileProgression } from "../src/services/progression";
import { fetchVisualDNA } from "../src/services/visualDNA";
import { formatFairScore } from "../src/utils/fairScore";
import { appRoutes } from "../src/lib/appRoutes";
import { colors, spacing, typography } from "../src/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [profile, setProfile] = useState<ProfileProgression | null>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth.user || auth.user.is_anonymous) {
      setProfile(null);
      setArchetype(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [p, dna] = await Promise.all([
      fetchProfileProgression(auth.user.id),
      fetchVisualDNA(auth.user.id),
    ]);
    setProfile(p);
    setArchetype(dna?.dominant_archetype ?? null);
    setLoading(false);
  }, [auth.user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!auth.user || auth.user.is_anonymous) {
    return (
      <Screen>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Sign in to save history and track progression.</Text>
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

  const email = auth.user.email ?? "Signed-in user";

  return (
    <Screen scroll>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.card}>
        <Label>Account</Label>
        <Text style={styles.email}>{email}</Text>
      </Card>

      <ProgressWidget variant="compact" />
      <JourneyBar currentLevel={(profile?.current_fair_level ?? "Observer") as FairLevel} />

      <Card style={styles.card}>
        <Label>FairLevel</Label>
        <Text style={styles.level}>{profile?.current_fair_level ?? "Observer"}</Text>
        <Text style={styles.meta}>
          {profile?.total_frames_analyzed ?? 0} frames · rolling avg{" "}
          {formatFairScore(profile?.rolling_average_fair_score ?? 0)}
        </Text>
        {archetype && <Text style={styles.meta}>Visual DNA: {archetype}</Text>}
      </Card>

      <View style={styles.nav}>
        <Button label="Progress" onPress={() => router.push(appRoutes.progress)} />
        <Button label="Visual DNA" variant="secondary" onPress={() => router.push(appRoutes.dna)} />
        <Button
          label="Capture a frame"
          variant="secondary"
          onPress={() => router.replace("/capture")}
        />
        <Button
          label="Sign Out"
          variant="ghost"
          onPress={async () => {
            await auth.signOut();
            router.replace("/login");
          }}
        />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: { marginBottom: spacing.md, gap: spacing.sm },
  email: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  level: { ...typography.headline, color: colors.accent, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  nav: { gap: spacing.sm, marginTop: spacing.md },
});
