import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import type { CardClassification } from "../../types/cards";
import { CARD_LAYOUT } from "../../types/cards";
import { getAtmosphereRecipe, getCeremonyGradientColors } from "../../theme/cardCeremony";

interface Props {
  classification: CardClassification;
  scale: number;
}

/** Transition band between photograph and placard — tier-specific ceremony threshold. */
export function CardCeremonyBridge({ classification, scale }: Props) {
  const recipe = getAtmosphereRecipe(classification);
  const height = CARD_LAYOUT.ceremonyBridgeHeight * scale;

  return (
    <View style={[styles.wrap, { height, marginHorizontal: CARD_LAYOUT.outerMargin * scale }]}>
      <LinearGradient
        colors={getCeremonyGradientColors(classification)}
        start={recipe.gradientStart}
        end={recipe.gradientEnd}
        style={styles.gradient}
      />
      <View style={[styles.hairline, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden" },
  gradient: { flex: 1, opacity: 0.85 },
  hairline: { height: 1 },
});
