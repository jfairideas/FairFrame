import { StyleSheet, Text } from "react-native";
import { colors, typography } from "../theme";

interface LabelProps {
  children: string;
}

export function Label({ children }: LabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 6,
  },
});
