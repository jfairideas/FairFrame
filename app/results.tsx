import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { ChiefObservation } from "../src/components/ChiefObservation";
import { Label } from "../src/components/Label";
import { ListSection } from "../src/components/ListSection";
import { PillarScores } from "../src/components/PillarScores";
import { ScoreRing } from "../src/components/ScoreRing";
import { Screen } from "../src/components/Screen";
import { ChiefSourceBanner } from "../src/components/ChiefSourceBanner";
import { WhatChiefSees } from "../src/components/WhatChiefSees";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "../src/context/SessionContext";
import { colors, spacing, typography } from "../src/theme";
import { reportPhaseLabel, sceneTypeLabel } from "../src/utils/labels";

const HERO_HEIGHT = Math.round(Dimensions.get("window").height * 0.46);

export default function ResultsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { session, result, analysisSource, chiefFallbackReason, reset } = useSession();

  if (!result) {
    return (
      <Screen>
        <Text style={styles.empty}>No analysis yet.</Text>
        <Button label="Capture a frame" onPress={() => router.replace("/capture")} />
      </Screen>
    );
  }

  const canEnhance = result.phase === "initial" && !session?.storyContext;

  const newShot = () => {
    reset();
    router.replace("/capture");
  };

  return (
    <Screen scroll>
      {session?.imageUri && (
        <View style={styles.heroWrap}>
          <Image source={{ uri: session.imageUri }} style={styles.heroImage} resizeMode="cover" />
        </View>
      )}

      {analysisSource && (
        <ChiefSourceBanner source={analysisSource} fallbackReason={chiefFallbackReason ?? undefined} />
      )}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.reportLabel}>{reportPhaseLabel(result.phase)}</Text>
          <Text style={styles.scene}>
            {result.sceneIdentification} · {sceneTypeLabel(result.sceneType)}
          </Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.grade}>{result.shotGrade}</Text>
        </View>
      </View>

      <Card style={styles.observeCard}>
        <ChiefObservation result={result} />
      </Card>

      <Text style={styles.scoreSectionLabel}>Evaluation</Text>

      <Card style={styles.scoreCard}>
        <ScoreRing
          score={result.visualStorytellingScore}
          label="Visual Storytelling Score"
        />
        <View style={styles.scoreCompare}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Current</Text>
            <Text style={styles.scoreValue}>{result.currentScore}</Text>
          </View>
          <View style={styles.dividerV} />
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Potential</Text>
            <Text style={[styles.scoreValue, styles.potential]}>{result.potentialScore}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.assessmentCard}>
        <Label>Chief's assessment</Label>
        <Text style={styles.assessment}>{result.assessment}</Text>
      </Card>

      <Card>
        <PillarScores pillars={result.pillars} />
      </Card>

      <Card style={styles.seesCard}>
        <WhatChiefSees items={result.whatChiefSees} />
      </Card>

      <ListSection title="Strengths" items={result.strengths} tone="positive" />
      <ListSection title="Improvements" items={result.improvements} />
      <ListSection title="Recommendations" items={result.recommendations} />

      <View style={styles.footer}>
        {canEnhance && (
          <Button
            label="Add Story Context — Enhanced Report"
            onPress={() => router.push("/story-context")}
          />
        )}
        <Button label="New Shot" onPress={newShot} variant={canEnhance ? "secondary" : "primary"} />
        <Button
          label="Back to Home"
          variant="ghost"
          onPress={() => {
            reset();
            router.replace("/");
          }}
        />
        {auth.user && !auth.user.is_anonymous && (
          <Button
            label="Sign Out"
            variant="ghost"
            onPress={async () => {
              await auth.signOut();
              reset();
              router.replace("/login");
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: "100%",
    height: HERO_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  heroImage: { width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerText: { flex: 1, paddingRight: spacing.md },
  reportLabel: { ...typography.label, color: colors.textMuted },
  scene: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  gradeBadge: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  grade: { ...typography.title, color: colors.text },
  observeCard: { marginBottom: spacing.lg },
  scoreSectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  scoreCard: { marginBottom: spacing.md, alignItems: "center" },
  assessmentCard: { marginBottom: spacing.md },
  seesCard: { marginBottom: spacing.lg },
  assessment: { ...typography.body, color: colors.text, lineHeight: 24 },
  scoreCompare: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  scoreBlock: { flex: 1, alignItems: "center" },
  scoreLabel: { ...typography.caption, color: colors.textMuted },
  scoreValue: { ...typography.score, fontSize: 32, color: colors.text },
  potential: { color: colors.accent },
  dividerV: { width: 1, backgroundColor: colors.divider },
  devNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  footer: { gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.xxl },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
