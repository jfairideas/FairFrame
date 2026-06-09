import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Label } from "../src/components/Label";
import { ListSection } from "../src/components/ListSection";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { fetchVisualDNA } from "../src/services/visualDNA";
import type { VisualDNA } from "../src/types/visualDNA";
import { appRoutes } from "../src/lib/appRoutes";
import { colors, spacing, typography } from "../src/theme";

function topEntries(map: Record<string, number>, limit = 5): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => `${k} (${v})`);
}

function PremiumLockedSection({ title, description }: { title: string; description: string }) {
  return (
    <Card style={styles.lockedSection}>
      <View style={styles.lockedHeader}>
        <Label>{title}</Label>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Premium</Text>
        </View>
      </View>
      <Text style={styles.lockedDesc}>{description}</Text>
      <Text style={styles.lockedHint}>Coming in a future FairFrame release — no payment required yet.</Text>
    </Card>
  );
}

export default function DnaScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [dna, setDna] = useState<VisualDNA | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth.user || auth.user.is_anonymous) {
      setDna(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchVisualDNA(auth.user.id);
    setDna(data);
    setLoading(false);
  }, [auth.user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!auth.user || auth.user.is_anonymous) {
    return (
      <Screen>
        <Text style={styles.title}>Visual DNA</Text>
        <Text style={styles.subtitle}>Sign in and analyze frames to build your visual identity.</Text>
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

  const empty =
    !dna ||
    (dna.dominant_archetype === "The Observer" && (dna.top_strengths?.length ?? 0) === 0);

  return (
    <Screen scroll>
      <Text style={styles.title}>Visual DNA</Text>
      <Text style={styles.subtitle}>How Chief reads your recurring visual instincts.</Text>

      {empty ? (
        <Card>
          <Text style={styles.emptyText}>
            Analyze a few frames while signed in — your archetype and traits will appear here.
          </Text>
        </Card>
      ) : (
        <>
          <Card style={styles.heroCard}>
            <Label>Dominant archetype</Label>
            <Text style={styles.archetype}>{dna?.dominant_archetype ?? "The Observer"}</Text>
            {dna?.trait_badges && dna.trait_badges.length > 0 && (
              <View style={styles.badges}>
                {dna.trait_badges.map((b) => (
                  <View key={b} style={styles.badge}>
                    <Text style={styles.badgeText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <ListSection title="Top strengths" items={dna?.top_strengths ?? []} tone="positive" />

          <Card style={styles.section}>
            <Label>Subject lean</Label>
            {(topEntries(dna?.subject_preferences ?? {}).length > 0
              ? topEntries(dna?.subject_preferences ?? {})
              : ["Not enough data yet"]
            ).map((line) => (
              <Text key={line} style={styles.line}>
                {line}
              </Text>
            ))}
          </Card>
        </>
      )}

      <PremiumLockedSection
        title="Attention Drivers"
        description="What repeatedly pulls the eye in your frames — ranked patterns across your history."
      />
      <PremiumLockedSection
        title="Composition Patterns"
        description="Framing, hierarchy, and spatial habits Chief sees building over time."
      />
      <PremiumLockedSection
        title="Light Preferences"
        description="How you use light, shadow, and contrast across your body of work."
      />
      <PremiumLockedSection
        title="Growth Areas"
        description="Recurring improvement themes Chief tracks as your visual judgment evolves."
      />
      <PremiumLockedSection
        title="Evolution Trends"
        description="FairScore and DNA trajectory over weeks and months — where you're heading."
      />

      <Button label="FairLevel Progress" variant="secondary" onPress={() => router.push(appRoutes.progress)} />
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
  archetype: { ...typography.headline, color: colors.accent, marginTop: spacing.sm },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  badgeText: { ...typography.caption, color: colors.text },
  section: { marginTop: spacing.md, gap: spacing.xs },
  line: { ...typography.body, color: colors.textSecondary },
  emptyText: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  lockedSection: { marginTop: spacing.md, opacity: 0.75 },
  lockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  premiumBadge: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  premiumBadgeText: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  lockedDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  lockedHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, fontStyle: "italic" },
});
