import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";

const SectionDivider = () => {
  return <View style={styles.divider} />;
};

export default SectionDivider;

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 2,
    borderColor: Colors.secondBorder,
  },
});
