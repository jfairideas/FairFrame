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
        <Text style={styles.tagline}>Your AI Chief Photographer.</Text>
        <Text style={styles.mission}>
          Understand how humans experience your images — what grabs attention,
          what creates value, and how to improve your visual judgment over time.
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
