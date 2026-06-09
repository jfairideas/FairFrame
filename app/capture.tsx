import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { AnalysisRemainingPill } from "../src/components/usage/AnalysisRemainingPill";
import { useSession } from "../src/context/SessionContext";
import { colors, spacing, typography } from "../src/theme";

export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { setSession } = useSession();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.message}>Camera permission required</Text>
        <Button label="Grant Permission" onPress={requestPermission} />
        <Button
          label="Upload Instead"
          variant="ghost"
          onPress={() => router.replace("/upload")}
        />
      </View>
    );
  }

  const capture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
    if (!photo?.uri) return;
    setSession({ imageUri: photo.uri });
    router.push("/analysis-loading");
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
            <Text style={styles.modeLabel}>Chief</Text>
            <Pressable onPress={() => router.push("/upload")}>
              <Text style={styles.back}>Upload</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>Chief will read your frame — no modes to pick.</Text>

          <View style={styles.shutterRow}>
            <Pressable style={styles.shutter} onPress={capture} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  back: { ...typography.caption, color: colors.text },
  modeLabel: { ...typography.label, color: colors.text },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  shutterRow: { alignItems: "center" },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.text,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  message: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
