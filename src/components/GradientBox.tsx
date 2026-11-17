import React from 'react';
import { ViewStyle, StyleProp, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientBoxProps {
  colors: string[];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  borderRadius?: number;
}

export const GradientBox: React.FC<GradientBoxProps> = ({
  colors,
  children,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.gradientCard,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({

  gradientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 0.5,
  },

});