import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Images } from "../../assets/images";
import { Typography } from "../../theme/typography";
import { useNavigation } from "@react-navigation/native";

const vibes = [
  Images.vibe1,
  Images.vibe2,
  Images.vibe1,
  Images.vibe2,
];

const VibeSection = () => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vibe</Text>
        <TouchableOpacity onPress={() => navigation.navigate("BottomTabs", { screen: "Vibe" })}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {vibes.map((vibe, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.vibeCard,
              index === 0 && styles.firstCard,
              index === vibes.length - 1 && styles.lastCard,
            ]}
            activeOpacity={0.8}
          >
            <Image source={vibe} style={styles.vibeImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View >
  );
};

export default VibeSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  title: {
    ...Typography.black16Bold,
    color: Colors.primaryText,
  },

  seeAll: {
    ...Typography.black12Medium,
    color: Colors.primary,
  },

  /* Cards */
  vibeCard: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },

  firstCard: {
    marginLeft: 20,
  },

  lastCard: {
    marginRight: 16,
  },

  vibeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
