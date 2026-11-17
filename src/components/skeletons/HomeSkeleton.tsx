import React from "react";
import { View, StyleSheet } from "react-native";
import CustomSkeleton from "./CustomSkeleton";

const HomeSkeleton = () => {
  return (
    <View style={styles.container}>

      {/* Post Skeletons */}
      {[1, 2].map((_, i) => (
        <View key={i} style={styles.post}>

          {/* Post Header */}
          <View style={styles.header}>
            <CustomSkeleton width={45} height={45} radius={45} />
            <View style={{ marginLeft: 10 }}>
              <CustomSkeleton width={120} height={12} radius={6} />
              <CustomSkeleton width={80} height={10} radius={6} style={{ marginTop: 6 }} />
            </View>
          </View>

          {/* Image */}
          <CustomSkeleton width={"100%"} height={200} radius={12} style={{ marginTop: 10 }} />

          {/* Footer Icons */}
          <View style={styles.footer}>
            <CustomSkeleton width={28} height={28} radius={28} />
            <CustomSkeleton width={28} height={28} radius={28} />
            <CustomSkeleton width={28} height={28} radius={28} />
          </View>
        </View>
      ))}

      {/* Suggested Friends Title */}
      <CustomSkeleton width={150} height={14} radius={6} style={{ marginTop: 12 }} />

      {/* Suggested Friends Card */}
      <View style={styles.friendRow}>
        {[1, 2].map((_, i) => (
          <View key={i} style={styles.friendCard}>
            <CustomSkeleton width={60} height={60} radius={60} style={{ alignSelf: "center" }} />
            <CustomSkeleton width={100} height={10} radius={6} style={{ marginTop: 10 }} />
            <CustomSkeleton width={80} height={10} radius={6} style={{ marginTop: 6 }} />
            <CustomSkeleton width={"80%"} height={30} radius={20} style={{ marginTop: 12, alignSelf: "center" }} />
          </View>
        ))}
      </View>

    </View>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: "row", marginBottom: 16 },
  story: { marginRight: 10 },
  banner: { marginBottom: 16 },
  post: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: { flexDirection: "row", alignItems: "center" },
  footer: { flexDirection: "row", gap: 14, marginTop: 10 },
  friendRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  friendCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
});
