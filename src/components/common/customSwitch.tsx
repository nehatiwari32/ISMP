import React, { useRef, useEffect } from "react";
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Colors } from "../../theme/colors";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

const SWITCH_WIDTH = 48;
const SWITCH_HEIGHT = 24;
const THUMB_SIZE = 20;

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  containerStyle,
}) => {
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [3, SWITCH_WIDTH - THUMB_SIZE - 3],
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#EDEDED", Colors.switchEnabled], // OFF / ON colors
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => !disabled && onValueChange(!value)}
    >
      <Animated.View
        style={[
          styles.switch,
          { backgroundColor },
          containerStyle,
          disabled && { opacity: 0.6 },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  switch: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    justifyContent: "center",
    padding: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});
