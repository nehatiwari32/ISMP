import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";

const SectionCard = ({ title, expanded, onToggle, children, badgeComponent }: any) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
      <Text style={Typography.black16Bold}>{title}</Text>
      {badgeComponent ? badgeComponent : <Image
        source={Icons.downArrow}
        style={[
          styles.chev,
          { transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
        ]}
      />}
    </TouchableOpacity>

    {expanded && <View style={styles.cardBody}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 16,
  },

  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },

  chev: {
    width: 14,
    height: 14,
    resizeMode: "contain",
    tintColor: Colors.secondaryText,
  },
});

export default SectionCard