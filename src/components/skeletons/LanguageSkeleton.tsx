import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import { Colors } from "../../theme/colors";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const H_PADDING = 20;
const BOX_WIDTH = (width - H_PADDING * 2 - ITEM_MARGIN * 2) / 2;

const LanguageSkeleton = () => {
  const dummy = Array(6).fill(null);

  const renderSkeletonBox = () => (
    <View style={styles.languageBox}>
      <View style={styles.symbolSkeleton} />
      <View style={styles.textSkeleton} />
    </View>
  );

  return (
    <FlatList
      data={dummy}
      numColumns={2}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderSkeletonBox}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default LanguageSkeleton;

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: H_PADDING,
    paddingVertical: "6%",
  },
  languageBox: {
    width: BOX_WIDTH,
    backgroundColor: "#f3f3f3",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginBottom: 16,
  },
  symbolSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.skeletonColor,
    marginBottom: 8,
  },
  textSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.skeletonColor,
  },
});
