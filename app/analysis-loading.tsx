import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { useSession } from "../src/context/SessionContext";
import { saveAnalysisHistory } from "../src/services/analysisHistory";
import { analyzeWithChief } from "../src/services/chief";
import { colors, spacing, typography } from "../src/theme";

const STEPS = [
  "Identifying the scene…",
  "Listing what's visible in the frame…",
  "Mapping visual hierarchy — what pulls the eye…",
  "Evaluating storytelling — then scoring…",
];

export default function AnalysisLoadingScreen() {
  const router = useRouter();
  const { session, setResult, setAnalysisSource, setChiefFallbackReason } = useSession();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 650);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    if (!session) {
      router.replace("/capture");
      return;
    }

    let cancelled = false;

    analyzeWithChief(session).then(async ({ result, source, fallbackReason }) => {
      if (cancelled) return;
      setResult(result);
      setAnalysisSource(source);
      setChiefFallbackReason(fallbackReason ?? null);
      await saveAnalysisHistory(session, result, source);
      router.replace("/results");
    });

    return () => {
      cancelled = true;
    };
  }, [session, setResult, setAnalysisSource, setChiefFallbackReason, router]);

  const loadingTitle =
    session?.phase === "enhanced"
      ? "Chief is deepening the report with your story context"
      : "Chief is observing your frame";

  return (
    <Screen>
      <View style={styles.content}>
        {session?.imageUri && (
          <Image source={{ uri: session.imageUri }} style={styles.thumb} />
        )}
        <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
        <Text style={styles.title}>{loadingTitle}</Text>
        <Text style={styles.step}>{STEPS[stepIndex]}</Text>
        <Text style={styles.note}>Sending frame to Live Chief when Supabase is configured…</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  spinner: { marginBottom: spacing.lg },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  step: {
    ...typography.body,
    color: colors.accent,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
