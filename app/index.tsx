import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { ProgressWidget } from "../src/components/progress/ProgressWidget";
import { JourneyBar } from "../src/components/progress/JourneyBar";
import { AnalysisRemainingPill } from "../src/components/usage/AnalysisRemainingPill";
import { Screen } from "../src/components/Screen";
import { fetchProfileProgression } from "../src/services/progression";
import { useEffect, useState } from "react";
import type { FairLevel } from "../src/types/fairLevel";
import { useAuth } from "../src/context/AuthContext";
import { appRoutes } from "../src/lib/appRoutes";
import { colors, spacing, typography } from "../src/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const auth = useAuth();
  const signedIn = auth.user && !auth.user.is_anonymous;
  const [level, setLevel] = useState<FairLevel>("Observer");

  useEffect(() => {
    if (!signedIn || !auth.user) return;
    void fetchProfileProgression(auth.user.id).then((p) => {
      if (p?.current_fair_level) setLevel(p.current_fair_level as FairLevel);
    });
  }, [signedIn, auth.user]);

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.brand}>FairFrame</Text>
        <Text style={styles.missionLine}>Teach People How To See.</Text>
        <Text style={styles.tagline}>Your AI Chief Photographer.</Text>
        <Text style={styles.mission}>
          Understand how humans experience your images — what grabs attention,
          what creates value, and how to improve your visual judgment over time.
        </Text>
      </View>
      {signedIn && (
        <View style={styles.progressSection}>
          <AnalysisRemainingPill />
          <ProgressWidget variant="compact" />
          <JourneyBar currentLevel={level} />
        </View>
      )}

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push("/login")} />
        <Button
          label="Skip to Camera"
          variant="ghost"
          onPress={() => router.replace("/camera-permission")}
        />
        {signedIn && (
          <>
            <Button label="My Progress" variant="secondary" onPress={() => router.push(appRoutes.progress)} />
            <Button label="Visual DNA" variant="ghost" onPress={() => router.push(appRoutes.dna)} />
            <Button label="Profile" variant="ghost" onPress={() => router.push(appRoutes.profile)} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: "center" },
  brand: {
    ...typography.hero,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  missionLine: {
    ...typography.headline,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  mission: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressSection: { gap: spacing.sm, marginBottom: spacing.lg },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
