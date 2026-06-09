import { StyleSheet, Text, View } from "react-native";
import type { CardTextColors } from "../../theme/cardColors";
import { formatFairScore } from "../../utils/fairScore";

interface Props {
  score: number;
  textColors: CardTextColors;
  size?: "card" | "compact";
  scale?: number;
  /** Ceremony mode: score as supporting evidence, not hero. */
  ceremony?: boolean;
  scoreSize?: number;
  labelSize?: number;
}

export function FairScoreLens({
  score,
  textColors,
  size = "card",
  scale = 1,
  ceremony = false,
  scoreSize,
  labelSize,
}: Props) {
  const isCard = size === "card";
  const resolvedScore = scoreSize ?? (ceremony ? 44 : 48) * scale;
  const resolvedLine = resolvedScore + 3 * scale;
  const resolvedLabel = labelSize ?? (ceremony ? 8 : 9) * scale;

  return (
    <View style={[styles.wrap, ceremony && styles.wrapCeremony]}>
      <Text
        style={[
          styles.score,
          isCard
            ? { fontSize: resolvedScore, lineHeight: resolvedLine }
            : styles.scoreCompact,
          ceremony && styles.scoreCeremony,
          { color: textColors.score },
        ]}
      >
        {formatFairScore(score)}
      </Text>
      <Text
        style={[
          styles.label,
          isCard && { fontSize: resolvedLabel, marginTop: 1 * scale },
          ceremony && styles.labelCeremony,
          { color: textColors.serial },
        ]}
      >
        FAIRSCORE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-end" },
  wrapCeremony: { alignItems: "flex-start" },
  score: { fontWeight: "700", letterSpacing: -0.5 },
  scoreCeremony: { fontWeight: "600", opacity: 0.92 },
  scoreCompact: { fontSize: 40, lineHeight: 44 },
  label: { fontWeight: "600", letterSpacing: 2, marginTop: 2 },
  labelCeremony: { fontWeight: "500", letterSpacing: 1.6, opacity: 0.7 },
});
