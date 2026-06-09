import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { getCardTextColors } from "../../theme/cardColors";
import {
  getCeremonyGradientColors,
  getCeremonyTypography,
  getAtmosphereRecipe,
} from "../../theme/cardCeremony";
import type { PressCardViewModel } from "../../types/cards";
import { CARD_LAYOUT } from "../../types/cards";
import { FairFrameMark } from "../brand/FairFrameMark";
import { FairScoreLens } from "./FairScoreLens";

interface Props {
  viewModel: PressCardViewModel;
  scale: number;
}

/**
 * Award ceremony footer — classification is the title of the award.
 * FairScore is supporting evidence. Creator, serial, emblem are issued certification.
 */
export function CardPlacard({ viewModel, scale }: Props) {
  const textColors = getCardTextColors(viewModel.classification);
  const typo = getCeremonyTypography(viewModel.classification);
  const recipe = getAtmosphereRecipe(viewModel.classification);
  const markWidth = CARD_LAYOUT.markWidth * scale;

  return (
    <View style={[styles.placard, { paddingHorizontal: 28 * scale, paddingVertical: 12 * scale }]}>
      <Text
        style={[
          styles.awardTitle,
          {
            color: textColors.classification,
            fontSize: typo.awardTitleSize * scale,
            lineHeight: (typo.awardTitleSize + 4) * scale,
            letterSpacing: typo.awardTitleTracking * scale,
          },
        ]}
        numberOfLines={2}
      >
        {viewModel.classificationLabel}
      </Text>

      <LinearGradient
        colors={getCeremonyGradientColors(viewModel.classification)}
        start={recipe.gradientStart}
        end={recipe.gradientEnd}
        style={[styles.ceremonyRule, { marginVertical: 8 * scale, height: 2 * scale }]}
      />

      <View style={styles.evidenceRow}>
        <FairScoreLens
          score={viewModel.fairScore}
          textColors={textColors}
          size="card"
          scale={scale}
          ceremony
          scoreSize={typo.scoreSize}
          labelSize={typo.scoreLabelSize}
        />

        <View style={[styles.certMeta, { marginLeft: 16 * scale }]}>
          <Text
            style={[styles.creator, { fontSize: typo.creatorSize * scale }]}
            numberOfLines={1}
          >
            {viewModel.creatorName}
          </Text>
          <Text
            style={[
              styles.serial,
              { color: textColors.serial, fontSize: typo.serialSize * scale },
            ]}
            numberOfLines={1}
          >
            {viewModel.serial}
          </Text>
        </View>

        <FairFrameMark variant="white" width={markWidth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placard: {
    backgroundColor: "#0A0A0B",
    flex: 1,
    justifyContent: "center",
  },
  awardTitle: {
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ceremonyRule: {
    width: "100%",
    opacity: 0.9,
    borderRadius: 1,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  certMeta: {
    flex: 1,
    gap: 2,
    alignItems: "flex-end",
  },
  creator: {
    color: "rgba(255,255,255,0.86)",
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "right",
  },
  serial: {
    fontWeight: "500",
    letterSpacing: 1.4,
    opacity: 0.82,
    textAlign: "right",
  },
});
