import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { createSessionFromUrl } from "../../src/lib/authSession";
import { colors, typography } from "../../src/theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async (url: string) => {
      try {
        await createSessionFromUrl(url);
        router.replace("/camera-permission");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Authentication failed");
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) finish(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => finish(url));
    return () => sub.remove();
  }, [router]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ActivityIndicator size="large" color={colors.accent} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
});
