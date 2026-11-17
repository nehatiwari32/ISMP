import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";

const HomeFilters = ({
  location,
  category,
  onLocationChange,
  onCategoryChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLocationChange}>
        <View style={styles.rowContainer}>
          <Image source={Icons.location} style={styles.locationIcon} />
          <Text style={styles.greenText}>{location}</Text>
          <Image source={Icons.fillArrow} style={styles.arrowIcon} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.chip} onPress={onCategoryChange}>
        <Text style={styles.chipText}>{category} </Text>
        <Image source={Icons.downArrow} style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeFilters;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.lightBg,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationIcon: {
    height: 20,
    width: 20,
    objectFit: "contain"
  },
  arrowIcon: {
    height: 16,
    width: 16,
    objectFit: "contain",
    color: Colors.secondary
  },
  greenText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryLight
  },
  chipText: {
    ...Typography.black12Bold,
    color: Colors.secondary,
  },
});
