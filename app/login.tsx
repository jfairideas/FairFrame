import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { colors, spacing, typography } from "../src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const continueToApp = () => router.replace("/camera-permission");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      continueToApp();
    } catch (e) {
      Alert.alert("Sign in failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = () => {
    if (!email.trim()) {
      Alert.alert("Email required");
      return;
    }
    if (mode === "signup") {
      if (password.length < 6) {
        Alert.alert("Password must be at least 6 characters");
        return;
      }
      return run(() => auth.signUpWithEmail(email.trim(), password));
    }
    if (!password) {
      Alert.alert("Password required");
      return;
    }
    return run(() => auth.signInWithEmail(email.trim(), password));
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert("Email required");
      return;
    }
    setBusy(true);
    try {
      await auth.signInWithMagicLink(email.trim());
      Alert.alert("Check your email", "Open the magic link to finish signing in.");
    } catch (e) {
      Alert.alert("Magic link failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  if (!auth.isConfigured) {
    return (
      <Screen scroll>
        <Text style={styles.title}>FairFrame</Text>
        <Text style={styles.subtitle}>
          Teach People How To See. Sign in later to save history — start shooting now.
        </Text>
        <Button label="Continue to Camera" onPress={continueToApp} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Sign in to FairFrame</Text>
      <Text style={styles.subtitle}>
        Save analysis history, or go straight to camera — one photo, Chief's full response.
      </Text>

      <Button label="Continue to Camera" onPress={continueToApp} disabled={busy} />
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>sign in to save history</Text>
        <View style={styles.line} />
      </View>

      <Card style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!busy}
        />
        <Button
          label={mode === "signin" ? "Sign In" : "Create Account"}
          onPress={handleEmail}
          disabled={busy}
        />
        <Button
          label={mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          variant="ghost"
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          disabled={busy}
        />
        <Button label="Send Magic Link" variant="secondary" onPress={handleMagicLink} disabled={busy} />
      </Card>

      {busy && <ActivityIndicator color={colors.accent} style={styles.spinner} />}

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>

      <Button
        label="Continue with Google"
        variant="secondary"
        onPress={() => run(() => auth.signInWithOAuth("google"))}
        disabled={busy}
      />
      <Button
        label="Continue with Apple"
        variant="secondary"
        onPress={() => run(() => auth.signInWithOAuth("apple"))}
        disabled={busy}
        style={styles.gap}
      />
      <Button
        label="Continue as Guest"
        variant="ghost"
        onPress={() => run(() => auth.signInAsGuest())}
        disabled={busy}
      />
      <Button label="Skip for now" variant="ghost" onPress={continueToApp} disabled={busy} />
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
  card: {
    gap: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  spinner: {
    marginVertical: spacing.md,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  or: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gap: {
    marginTop: spacing.sm,
  },
});
