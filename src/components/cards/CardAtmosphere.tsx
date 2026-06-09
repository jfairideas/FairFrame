import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { CardClassification } from "../../types/cards";
import { getCardAtmosphereTokens } from "../../theme/cardColors";
import {
  getAtmosphereRecipe,
  getCeremonyGradientColors,
  type CornerCeremonyStyle,
} from "../../theme/cardCeremony";

interface Props {
  classification: CardClassification;
  children: ReactNode;
  scale?: number;
}

function CornerCeremony({
  style,
  atmosphere,
  size,
}: {
  style: CornerCeremonyStyle;
  atmosphere: ReturnType<typeof getCardAtmosphereTokens>;
  size: number;
}) {
  const dot = (color: string, pos: object, s = size) => (
    <View
      pointerEvents="none"
      style={[styles.cornerDot, pos, { width: s, height: s, backgroundColor: color }]}
    />
  );

  const archivalCorner = (pos: object) => (
    <View pointerEvents="none" style={[styles.archivalCorner, pos]}>
      <View style={[styles.archivalH, { backgroundColor: atmosphere.secondary }]} />
      <View style={[styles.archivalV, { backgroundColor: atmosphere.secondary }]} />
    </View>
  );

  const sealCorner = (pos: object, color: string) => (
    <View
      pointerEvents="none"
      style={[styles.sealCorner, pos, { borderColor: color, width: size * 1.4, height: size * 1.4 }]}
    />
  );

  switch (style) {
    case "ascent":
      return dot(atmosphere.bloomSecondary, styles.cornerTopLeft, size * 1.3);
    case "balanced":
      return (
        <>
          {dot(atmosphere.bloomSecondary, styles.cornerTopLeft)}
          {dot(atmosphere.bloomAccent, styles.cornerBottomRight)}
        </>
      );
    case "radiant":
      return (
        <>
          {dot(atmosphere.bloomSecondary, styles.cornerTopLeft, size * 0.75)}
          {dot(atmosphere.bloomAccent, styles.cornerTopRight, size * 0.75)}
          {dot(atmosphere.bloomAccent, styles.cornerBottomLeft, size * 0.75)}
          {dot(atmosphere.bloomSecondary, styles.cornerBottomRight, size * 0.75)}
        </>
      );
    case "seal":
      return (
        <>
          {sealCorner(styles.cornerTopRight, atmosphere.secondary)}
          {sealCorner(styles.cornerBottomLeft, atmosphere.accent)}
        </>
      );
    case "archival":
      return (
        <>
          {archivalCorner(styles.cornerTopLeft)}
          {archivalCorner(styles.cornerBottomRight)}
        </>
      );
    default:
      return null;
  }
}

/**
 * Recognition atmosphere — tier-specific ceremony, not a single template with color swaps.
 * Color lives outside the photograph only.
 */
export function CardAtmosphere({ classification, children, scale = 1 }: Props) {
  const atmosphere = getCardAtmosphereTokens(classification);
  const recipe = getAtmosphereRecipe(classification);
  const borderWidth = recipe.borderWidth * scale;
  const bloom = Math.max(8, borderWidth * 2.2);

  return (
    <View
      style={[
        styles.haloWrap,
        {
          borderRadius: recipe.frameRadius,
          shadowColor: atmosphere.secondary,
          shadowRadius: recipe.shadowRadius * scale,
          shadowOpacity: recipe.shadowOpacity,
          backgroundColor: atmosphere.haloSecondary,
        },
      ]}
    >
      <LinearGradient
        colors={getCeremonyGradientColors(classification)}
        start={recipe.gradientStart}
        end={recipe.gradientEnd}
        style={[
          styles.gradientBorder,
          { padding: borderWidth, borderRadius: recipe.frameRadius },
        ]}
      >
        <View
          style={[
            styles.photoFrame,
            { borderRadius: Math.max(1, recipe.frameRadius - borderWidth) },
          ]}
        >
          <View
            style={[
              styles.hairline,
              {
                borderColor: atmosphere.hairlineAccent,
                borderRadius: Math.max(1, recipe.frameRadius - borderWidth),
              },
            ]}
          >
            {children}
          </View>
        </View>
      </LinearGradient>

      <CornerCeremony style={recipe.cornerStyle} atmosphere={atmosphere} size={bloom} />
    </View>
  );
}

const styles = StyleSheet.create({
  haloWrap: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    position: "relative",
  },
  gradientBorder: { overflow: "hidden" },
  photoFrame: { overflow: "hidden", backgroundColor: "#050505" },
  hairline: { borderWidth: 1, overflow: "hidden" },
  cornerDot: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.8,
  },
  cornerTopLeft: { top: -5, left: -5 },
  cornerTopRight: { top: -5, right: -5 },
  cornerBottomLeft: { bottom: -5, left: -5 },
  cornerBottomRight: { bottom: -5, right: -5 },
  sealCorner: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.7,
  },
  archivalCorner: {
    position: "absolute",
    width: 14,
    height: 14,
    opacity: 0.65,
  },
  archivalH: { position: "absolute", top: 0, left: 0, width: 14, height: 1 },
  archivalV: { position: "absolute", top: 0, left: 0, width: 1, height: 14 },
});
