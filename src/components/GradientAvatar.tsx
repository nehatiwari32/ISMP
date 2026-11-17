import React from "react";
import {
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../theme/colors";
import FastImage from "react-native-fast-image";

interface GradientAvatarProps {
  source: ImageSourcePropType;
  size?: number;
  borderWidth?: number;
  onPress?: () => void;
  isPress?: boolean;
}

const GradientAvatar: React.FC<GradientAvatarProps> = ({
  source,
  size = 40,
  borderWidth = 1,
  onPress,
  isPress = false,
}) => {
  const outerSize = size + borderWidth * 2;
  const hitSize = Math.max(outerSize, 44); // 👈 ensure min touch size

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isPress}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 👈 extra safe
      style={[
        styles.touchWrapper,
        {
          width: hitSize,
          height: hitSize,
          borderRadius: hitSize / 2,
        },
      ]}
    >
      <LinearGradient
        colors={[
          Colors.gradientBorder1,
          Colors.gradientBorder1,
          Colors.gradientBorder3,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientBorder,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            padding: borderWidth,
          },
        ]}
      >
        <FastImage
          source={source}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: Colors.primaryExtraLight,
          }}
          resizeMode="cover"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientAvatar;

const styles = StyleSheet.create({
  touchWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBorder: {
    justifyContent: "center",
    alignItems: "center",
  },
});
