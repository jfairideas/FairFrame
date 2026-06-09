import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { EthicsNotice } from "../src/components/ethics/EthicsNotice";
import { Screen } from "../src/components/Screen";
import { useSession } from "../src/context/SessionContext";
import { colors, spacing, typography } from "../src/theme";

export default function EthicsRefusalScreen() {
  const router = useRouter();
  const { session, ethics, reset } = useSession();

  const message =
    ethics?.userMessage ??
    "FairFrame cannot analyze or score this image because it appears to violate our content eligibility rules.";

  return (
    <Screen scroll>
      {session?.imageUri && (
        <Image source={{ uri: session.imageUri }} style={styles.thumb} resizeMode="cover" />
      )}

      <Text style={styles.title}>Recognition not available</Text>
      <Text style={styles.subtitle}>
        This is an eligibility decision — not a photograph score. FairFrame does not assign FairScore to
        disallowed content.
      </Text>

      {ethics ? (
        <EthicsNotice ethics={ethics} />
      ) : (
        <Text style={styles.body}>{message}</Text>
      )}

      <Button
        label="Choose another frame"
        onPress={() => {
          reset();
          router.replace("/capture");
        }}
      />
      <Button label="Back to Home" variant="ghost" onPress={() => router.replace("/")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  thumb: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.lg,
    opacity: 0.85,
  },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
});
