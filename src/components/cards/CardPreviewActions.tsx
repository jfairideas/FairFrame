import { Alert, StyleSheet, View } from "react-native";
import { Button } from "../Button";
import { spacing } from "../../theme";

interface Props {
  onSave: () => void;
  onShare: () => void;
  busy?: boolean;
}

export function CardPreviewActions({ onSave, onShare, busy = false }: Props) {
  return (
    <View style={styles.wrap}>
      <Button label="Save Card" onPress={onSave} disabled={busy} />
      <Button label="Share Card" variant="secondary" onPress={onShare} disabled={busy} />
    </View>
  );
}

export function showCardMetadataWarning(message: string) {
  Alert.alert("Card saved locally", message);
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.lg },
});
