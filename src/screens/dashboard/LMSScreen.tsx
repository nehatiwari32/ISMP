import React from "react";
import { View, Text, StyleSheet } from "react-native";

const LMSScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 LMS Screen</Text>
    </View>
  );
};

export default LMSScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "700" },
});
