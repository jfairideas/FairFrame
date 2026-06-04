import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Screen } from "../src/components/Screen";
import { colors, spacing, typography } from "../src/theme";

export default function CameraPermissionScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const granted = permission?.granted ?? false;
  const denied = permission != null && !permission.granted && !permission.canAskAgain;

  const request = async () => {
    const result = await requestPermission();
    if (result.granted) router.replace("/capture");
  };

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Camera access</Text>
        <Text style={styles.body}>
          Chief needs to see your frame to coach composition, lighting, and story
          before you record.
        </Text>
        <Card>
          <Text style={styles.cardTitle}>Professional field tool</Text>
          <Text style={styles.cardBody}>
            FairFrame is not a social app. Your frames stay on device until you choose
            to analyze (future: encrypted upload to OpenAI).
          </Text>
        </Card>
        {denied && (
          <Text style={styles.warning}>
            Camera permission denied. Enable it in Settings or use Upload Photo.
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button
          label={granted ? "Open Camera" : "Allow Camera"}
          onPress={() => (granted ? router.replace("/capture") : request())}
        />
        <Button
          label="Upload Photo Instead"
          variant="secondary"
          onPress={() => router.replace("/upload")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
