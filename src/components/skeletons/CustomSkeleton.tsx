import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";

const CustomSkeleton = ({ width, height, radius = 8, style }: any) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
};

export default CustomSkeleton;

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.skeletonColor,
  },
});
