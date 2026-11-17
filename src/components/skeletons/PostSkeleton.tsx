import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Colors } from "../../theme/colors";

const PostSkeleton = () => {
  const dummyPosts = Array(3).fill(null); // Show 3 skeleton cards

  const renderSkeleton = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarSkeleton} />
          <View>
            <View style={styles.userNameSkeleton} />
            <View style={styles.timeSkeleton} />
          </View>
        </View>
        <View style={styles.followSkeleton} />
      </View>

      {/* Caption */}
      <View style={styles.captionSkeleton} />

      {/* Post Image */}
      <View style={styles.imageSkeleton} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <View style={styles.actionSkeleton} />
          <View style={styles.actionSkeleton} />
          <View style={styles.actionSkeleton} />
        </View>
        <View style={styles.likeSkeleton} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={dummyPosts}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderSkeleton}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PostSkeleton;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  container: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 14,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.skeletonColor,
  },
  userNameSkeleton: {
    width: 100,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.skeletonColor,
    marginBottom: 6,
  },
  timeSkeleton: {
    width: 60,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#eaeaea",
  },
  followSkeleton: {
    width: 60,
    height: 22,
    borderRadius: 12,
    backgroundColor: Colors.skeletonColor,
  },

  // Caption
  captionSkeleton: {
    width: "90%",
    height: 14,
    borderRadius: 6,
    backgroundColor: Colors.skeletonColor,
    marginBottom: 10,
  },

  // Image
  imageSkeleton: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.skeletonColor,
    marginBottom: 12,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionSkeleton: {
    width: 40,
    height: 14,
    borderRadius: 6,
    backgroundColor: Colors.skeletonColor,
  },
  likeSkeleton: {
    width: 30,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.skeletonColor,
  },
});
