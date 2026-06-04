import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Screen } from "../src/components/Screen";
import { useSession } from "../src/context/SessionContext";
import { colors, spacing, typography } from "../src/theme";

export default function UploadScreen() {
  const router = useRouter();
  const { setSession } = useSession();
  const [uri, setUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
    }
  };

  const analyze = () => {
    if (!uri) return;
    setSession({ imageUri: uri });
    router.push("/analysis-loading");
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Upload frame</Text>
      <Text style={styles.subtitle}>
        Chief analyzes automatically — subject scene or location scout.
      </Text>

      <Card style={styles.previewCard}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </Card>

      <Button label="Choose Photo" variant="secondary" onPress={pickImage} />
      <Button label="Analyze with Chief" onPress={analyze} disabled={!uri} />
      <Button label="Open Camera" variant="ghost" onPress={() => router.replace("/capture")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  previewCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  preview: { width: "100%", height: 240 },
  placeholder: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  placeholderText: { ...typography.caption, color: colors.textMuted },
});
