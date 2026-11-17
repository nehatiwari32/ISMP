import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ViewContainer } from "../../../../components";
import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";
import { Icons } from "../../../../assets/icons";
import { securityOptions } from "../../../../utils/helper";

const SecurityScreen = () => {
  const navigation = useNavigation();

  return (
    <ViewContainer
      headerTitle="Security"
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <View style={styles.container}>
        {securityOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.rowText}>{item.title}</Text>

            <Image source={Icons.chervonLeft} style={styles.iconSize} />
          </TouchableOpacity>
        ))}
      </View>
    </ViewContainer>
  );
};

export default SecurityScreen;

// ------------------------------------
//            STYLES
// ------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: Colors.lightBg,
    paddingTop: 20
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  rowText: {
    ...Typography.black16Medium,
  },
  iconSize: {
    height: 13,
    width: 13,
    objectFit: 'contain',
  }
});
