import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { colors, spacing, typography } from "../src/theme";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>FairFrame</Text>
        <Text style={styles.missionLine}>Teach People How To See.</Text>
        <Text style={styles.tagline}>Your Pocket Chief Photographer.</Text>
        <Text style={styles.mission}>
          FairFrame is an AI visual storytelling coach — not a settings calculator,
          not a social network. Chief helps you observe, frame, and tell stronger
          stories before you hit record.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push("/login")} />
        <Button
          label="Skip to Camera"
          variant="ghost"
          onPress={() => router.replace("/camera-permission")}
        />
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
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
