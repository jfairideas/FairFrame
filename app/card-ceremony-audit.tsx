import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { PressCard } from "../src/components/cards/PressCard";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "../src/context/SessionContext";
import {
  buildCeremonyAuditMatrix,
  CEREMONY_AUDIT_SCORES,
} from "../src/services/cardCeremonyAudit";
import { getAtmosphereRecipe } from "../src/theme/cardCeremony";
import type { PressCardViewModel } from "../src/types/cards";
import { colors, spacing, typography } from "../src/theme";

const CARD_WIDTH = Math.min(Dimensions.get("window").width - spacing.lg * 2, 280);

/**
 * Founder visual audit — five recognition ceremonies, same photograph.
 * Navigate directly: /card-ceremony-audit
 */
export default function CardCeremonyAuditScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { session } = useSession();
  const [cards, setCards] = useState<PressCardViewModel[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(session?.imageUri ?? null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let uri = session?.imageUri ?? null;
      if (!uri) {
        const asset = Asset.fromModule(require("../assets/splash-icon.png"));
        await asset.downloadAsync();
        uri = asset.localUri ?? asset.uri;
      }
      if (!cancelled && uri) {
        setImageUri(uri);
        const creator =
          auth.user?.email?.split("@")[0] ??
          auth.user?.user_metadata?.display_name ??
          "Creator";
        setCards(buildCeremonyAuditMatrix(uri, creator));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.imageUri, auth.user]);

  return (
    <Screen scroll>
      <Text style={styles.title}>Card Ceremony Audit</Text>
      <Text style={styles.subtitle}>
        Five recognition ceremonies — same photograph. Founder approval test: five different
        ceremonies, not one template with color swaps.
      </Text>

      {imageUri && (
        <Text style={styles.note}>Using shared photograph for all five tiers.</Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.matrix}
      >
        {cards.map((card) => {
          const recipe = getAtmosphereRecipe(card.classification);
          return (
            <View key={card.classification} style={styles.cell}>
              <Text style={styles.tierLabel}>
                {card.classificationLabel} · {CEREMONY_AUDIT_SCORES[card.classification]}
              </Text>
              <Text style={styles.emotion}>{recipe.emotion}</Text>
              <PressCard viewModel={card} width={CARD_WIDTH} />
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.instruction}>
        Screenshot this row side-by-side. Pass = five distinct recognition ceremonies. Fail = one
        template with five color swaps.
      </Text>

      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  note: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  matrix: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  cell: { alignItems: "center", width: CARD_WIDTH + 8 },
  tierLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "center",
  },
  emotion: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  instruction: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});
