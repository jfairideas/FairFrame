import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Screen } from "../src/components/Screen";
import { useSession } from "../src/context/SessionContext";
import { colors, spacing, typography } from "../src/theme";

export default function StoryContextScreen() {
  const router = useRouter();
  const { session, setSession } = useSession();
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [storyBeat, setStoryBeat] = useState("");
  const [audience, setAudience] = useState("");

  const runEnhancedReport = () => {
    if (!session) {
      router.replace("/capture");
      return;
    }
    setSession({
      ...session,
      phase: "enhanced",
      storyContext: {
        assignmentTitle: assignmentTitle.trim() || "Field Assignment",
        storyBeat: storyBeat.trim() || "What must this image prove for the story?",
        audience: audience.trim() || undefined,
      },
    });
    router.push("/analysis-loading");
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Add story context</Text>
      <Text style={styles.subtitle}>
        You already have Chief's report. Add assignment details for an enhanced report
        that connects visuals to your story.
      </Text>

      <Card style={styles.card}>
        <Field
          label="Assignment title"
          value={assignmentTitle}
          onChangeText={setAssignmentTitle}
          placeholder="e.g. Downtown flood coverage"
        />
        <Field
          label="Story beat"
          value={storyBeat}
          onChangeText={setStoryBeat}
          placeholder="What must this shot prove?"
          multiline
        />
        <Field
          label="Audience (optional)"
          value={audience}
          onChangeText={setAudience}
          placeholder="e.g. Evening newscast"
        />
      </Card>

      <Button label="Get Enhanced Report" onPress={runEnhancedReport} />
      <Button label="Back to Report" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
      />
    </View>
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
  card: { gap: spacing.md, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.textMuted },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  inputMulti: { minHeight: 88, textAlignVertical: "top" },
});
