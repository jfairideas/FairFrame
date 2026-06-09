import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { useSession } from "../src/context/SessionContext";
import { saveAnalysisHistory } from "../src/services/analysisHistory";
import { trackEvent } from "../src/services/analytics";
import { analyzeWithChief } from "../src/services/chief";
import { colors, spacing, typography } from "../src/theme";

const STEPS = [
  "Checking content eligibility…",
  "What am I looking at?",
  "What grabbed my attention first?",
  "Does that attention create value?",
  "FairScore and your assignment…",
];

export default function AnalysisLoadingScreen() {
  const router = useRouter();
  const {
    session,
    setResult,
    setAnalysisSource,
    setChiefFallbackReason,
    setAnalysisHistoryId,
    setEthics,
  } = useSession();
  const [stepIndex, setStepIndex] = useState(0);
  const analysisStartedRef = useRef(false);
  const requestIdRef = useRef(
    `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );

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

    if (analysisStartedRef.current) {
      return;
    }
    analysisStartedRef.current = true;

    let cancelled = false;

    void trackEvent("analysis_started", { request_id: requestIdRef.current });

    analyzeWithChief(session, { requestId: requestIdRef.current }).then(
      async ({ result, source, fallbackReason, ethics, ethicsRefused }) => {
        if (cancelled) return;

        if (ethics) setEthics(ethics);

        if (ethicsRefused || !result) {
          router.replace("/ethics-refusal");
          return;
        }

        setResult(result);
        setAnalysisSource(source);
        setChiefFallbackReason(fallbackReason ?? null);

        const analysisId = await saveAnalysisHistory(session, result, source, ethics ?? undefined);
        setAnalysisHistoryId(analysisId);
        void trackEvent("analysis_completed", {
          source,
          safety_tier: ethics?.safetyTier ?? "green",
        });
        router.replace("/results");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    session,
    setResult,
    setAnalysisSource,
    setChiefFallbackReason,
    setAnalysisHistoryId,
    setEthics,
    router,
  ]);

  return (
    <Screen>
      <View style={styles.content}>
        {session?.imageUri && (
          <Image source={{ uri: session.imageUri }} style={styles.thumb} />
        )}
        <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
        <Text style={styles.title}>Chief is observing your frame</Text>
        <Text style={styles.step}>{STEPS[stepIndex]}</Text>
        <Text style={styles.note}>
          FairFrame checks content eligibility before analysis. Live Chief runs for the founder account
          during beta; others see offline preview.
        </Text>
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
    lineHeight: 18,
  },
});
