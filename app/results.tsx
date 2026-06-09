import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { ChiefSourceBanner } from "../src/components/ChiefSourceBanner";
import { ExpandableFullAnalysis } from "../src/components/ExpandableFullAnalysis";
import { FairScoreCard } from "../src/components/FairScoreCard";
import { Label } from "../src/components/Label";
import { ListSection } from "../src/components/ListSection";
import { EthicsNotice } from "../src/components/ethics/EthicsNotice";
import { ProgressWidget } from "../src/components/progress/ProgressWidget";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "../src/context/SessionContext";
import { appRoutes } from "../src/lib/appRoutes";
import { colors, spacing, typography } from "../src/theme";
import { imageTypeLabel } from "../src/utils/imageType";

const HERO_HEIGHT = Math.round(Dimensions.get("window").height * 0.42);

export default function ResultsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { session, result, analysisSource, chiefFallbackReason, ethics, reset } = useSession();
  const cardAllowed = ethics?.cardAllowed ?? true;

  if (!result) {
    return (
      <Screen>
        <Text style={styles.empty}>No analysis yet.</Text>
        <Button label="Capture a frame" onPress={() => router.replace("/capture")} />
      </Screen>
    );
  }

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
        <Text style={styles.reportLabel}>Chief's Report</Text>
        <Text style={styles.imageType}>{imageTypeLabel(result.imageType)}</Text>
        <View style={styles.gradeBadge}>
          <Text style={styles.grade}>{result.shotGrade}</Text>
        </View>
      </View>

      <Card>
        <Label>Chief's Reaction</Label>
        <Text style={styles.reaction}>{result.chiefsReaction}</Text>
      </Card>

      <Card style={styles.section}>
        <Label>What I Saw</Label>
        <View style={styles.chips}>
          {result.whatISaw.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <FairScoreCard fairScore={result.fairScore} />
      </Card>

      {ethics && <EthicsNotice ethics={ethics} />}

      <ProgressWidget variant="compact" />

      {cardAllowed ? (
        <Button
          label="PRESS CARD"
          onPress={() => router.push(appRoutes.cardPreview)}
          style={styles.pressCardBtn}
        />
      ) : (
        <Text style={styles.cardRestricted}>
          Press Card recognition is limited for sensitive images.
        </Text>
      )}

      <ListSection title="Why It Works" items={result.whyItWorks} tone="positive" />

      <Card style={styles.assignmentCard}>
        <Label>Chief's Assignment</Label>
        <Text style={styles.assignment}>{result.chiefsAssignment}</Text>
      </Card>

      <ExpandableFullAnalysis result={result} />

      <View style={styles.footer}>
        <Button label="New Shot" onPress={newShot} />
        <Button
          label="Back to Home"
          variant="ghost"
          onPress={() => {
            reset();
            router.replace("/");
          }}
        />
        {auth.user && !auth.user.is_anonymous && (
          <>
            <Button label="My Progress" variant="secondary" onPress={() => router.push(appRoutes.progress)} />
            <Button label="Visual DNA" variant="ghost" onPress={() => router.push(appRoutes.dna)} />
            <Button label="Profile" variant="ghost" onPress={() => router.push(appRoutes.profile)} />
            <Button
              label="Sign Out"
              variant="ghost"
              onPress={async () => {
                await auth.signOut();
                reset();
                router.replace("/login");
              }}
            />
          </>
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
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  reportLabel: { ...typography.label, color: colors.textMuted },
  imageType: {
    ...typography.headline,
    color: colors.text,
  },
  gradeBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  grade: { ...typography.title, color: colors.text },
  reaction: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    marginTop: spacing.sm,
  },
  section: { marginTop: spacing.md },
  pressCardBtn: { marginTop: spacing.md },
  cardRestricted: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipText: { ...typography.caption, color: colors.text },
  assignmentCard: {
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  assignment: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  footer: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xxl },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
