import React from "react";
import { View, Text, StyleSheet } from "react-native";

const VibeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Vibe Screen</Text>
    </View>
  );
};

export default VibeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "700" },
});
