import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Button } from "../src/components/Button";
import {
  CardPreviewActions,
  showCardMetadataWarning,
} from "../src/components/cards/CardPreviewActions";
import { PressCard } from "../src/components/cards/PressCard";
import { Screen } from "../src/components/Screen";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "../src/context/SessionContext";
import { buildPressCardViewModel } from "../src/services/cardEngine";
import { saveFairCardMetadata } from "../src/services/cardMetadata";
import { fetchProfileProgression } from "../src/services/progression";
import { isSupabaseConfigured, supabase } from "../src/lib/supabase";
import type { PressCardViewModel } from "../src/types/cards";
import { colors, spacing, typography } from "../src/theme";

const PREVIEW_WIDTH = Math.min(Dimensions.get("window").width - spacing.lg * 2, 400);

export default function CardPreviewScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { session, result, analysisHistoryId } = useSession();
  const cardRef = useRef<View>(null);
  const [viewModel, setViewModel] = useState<PressCardViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [metadataWarning, setMetadataWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!result) {
      setLoading(false);
      return;
    }

    let creatorName = "Creator";
    let fairLevel: string | undefined;

    if (auth.user && !auth.user.is_anonymous && isSupabaseConfigured) {
      const profile = await fetchProfileProgression(auth.user.id);
      fairLevel = profile?.current_fair_level;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", auth.user.id)
        .maybeSingle();
      creatorName =
        data?.display_name ??
        auth.user.email?.split("@")[0] ??
        "Creator";
    } else if (auth.user?.email) {
      creatorName = auth.user.email.split("@")[0];
    }

    const vm = buildPressCardViewModel({
      result,
      imageUri: session?.imageUri,
      creatorName,
      fairLevelAtCapture: fairLevel,
      analysisId: analysisHistoryId ?? undefined,
    });
    setViewModel(vm);
    setLoading(false);

    if (auth.user && !auth.user.is_anonymous && isSupabaseConfigured) {
      const saved = await saveFairCardMetadata(vm, auth.user.id);
      if (!saved.ok) {
        setMetadataWarning(
          saved.error ?? "Verification metadata could not be saved. You can still export this card."
        );
      } else if (saved.serial !== vm.serial) {
        setViewModel({ ...vm, serial: saved.serial });
      }
    }
  }, [result, session?.imageUri, auth.user, analysisHistoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const captureCard = async (): Promise<string | null> => {
    if (!cardRef.current || !viewModel?.imageUri) return null;
    try {
      return await captureRef(cardRef, {
        format: "png",
        quality: 1,
        width: 1080,
        height: 1350,
      });
    } catch (e) {
      console.warn("captureRef failed:", e);
      return null;
    }
  };

  const onSave = async () => {
    if (!viewModel?.imageUri) return;
    setBusy(true);
    try {
      const uri = await captureCard();
      if (!uri) {
        Alert.alert("Save failed", "Could not capture the card image.");
        return;
      }
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow photo library access to save your Press Card.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Press Card saved to your photo library.");
      if (metadataWarning) showCardMetadataWarning(metadataWarning);
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    if (!viewModel?.imageUri) return;
    setBusy(true);
    try {
      const uri = await captureCard();
      if (!uri) {
        Alert.alert("Share failed", "Could not capture the card image.");
        return;
      }
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share Press Card" });
      if (metadataWarning) showCardMetadataWarning(metadataWarning);
    } finally {
      setBusy(false);
    }
  };

  if (!result) {
    return (
      <Screen>
        <Text style={styles.empty}>No analysis available for a Press Card.</Text>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (loading || !viewModel) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Press Card</Text>
      <Text style={styles.subtitle}>Your recognized photograph — photo-first, minimal data.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewWrap}>
        <PressCard ref={cardRef} viewModel={viewModel} width={PREVIEW_WIDTH} />
      </ScrollView>

      {!viewModel.imageUri && (
        <Text style={styles.warning}>
          This card can't be rendered because the original session image is no longer available.
        </Text>
      )}

      {metadataWarning && <Text style={styles.warning}>{metadataWarning}</Text>}

      <CardPreviewActions onSave={onSave} onShare={onShare} busy={busy} />
      <Button label="Back to Results" variant="ghost" onPress={() => router.back()} />
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
  previewWrap: { alignItems: "center", paddingVertical: spacing.md },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  empty: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
});
