import { forwardRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { PressCardViewModel } from "../../types/cards";
import { CARD_LAYOUT } from "../../types/cards";
import { CardAtmosphere } from "./CardAtmosphere";
import { CardCeremonyBridge } from "./CardCeremonyBridge";
import { CardPlacard } from "./CardPlacard";

interface Props {
  viewModel: PressCardViewModel;
  /** Render width; height follows 4:5 ratio */
  width: number;
}

export const PressCard = forwardRef<View, Props>(function PressCard({ viewModel, width }, ref) {
  const scale = width / CARD_LAYOUT.width;
  const height = Math.round(width * (CARD_LAYOUT.height / CARD_LAYOUT.width));
  const photoHeight = CARD_LAYOUT.photoHeight * scale;
  const placardHeight = CARD_LAYOUT.placardHeight * scale;
  const margin = CARD_LAYOUT.outerMargin * scale;
  const frameWidth = width - margin * 2;

  if (!viewModel.imageUri) {
    return (
      <View ref={ref} style={[styles.canvas, { width, height, padding: margin }]}>
        <Text style={styles.missing}>
          This card can't be rendered because the original session image is no longer available.
        </Text>
      </View>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.canvas, { width, height, backgroundColor: "#050505" }]}
    >
      <View style={{ paddingTop: margin, paddingHorizontal: margin }}>
        <CardAtmosphere classification={viewModel.classification} scale={scale}>
          <Image
            source={{ uri: viewModel.imageUri }}
            style={{ width: frameWidth, height: photoHeight }}
            resizeMode="cover"
          />
        </CardAtmosphere>
      </View>

      <CardCeremonyBridge classification={viewModel.classification} scale={scale} />

      <View style={{ height: placardHeight }}>
        <CardPlacard viewModel={viewModel} scale={scale} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    overflow: "hidden",
    borderRadius: 4,
  },
  missing: {
    color: "#D9E2EC",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
  },
});
