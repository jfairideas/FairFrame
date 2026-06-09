import { Image, StyleSheet, View } from "react-native";

export type FairFrameMarkVariant = "black" | "white" | "blue";

const MARK_SOURCES: Record<FairFrameMarkVariant, number> = {
  black: require("../../../assets/brand/fairframe_mark_black_transparent_1024.png"),
  white: require("../../../assets/brand/fairframe_mark_white_transparent_1024.png"),
  blue: require("../../../assets/brand/fairframe_mark_blue_transparent_1024.png"),
};

interface Props {
  variant?: FairFrameMarkVariant;
  width?: number;
}

/** Official FairFrame emblem — uses committed brand assets only. */
export function FairFrameMark({ variant = "white", width = 56 }: Props) {
  const height = Math.round(width * 0.5);
  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image
        source={MARK_SOURCES[variant]}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="FairFrame mark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
