import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";
import { getTimeAgo } from "../../utils/helper";

const FriendRequestCard = ({ item, acceptLoading, rejectLoading, onAccept, onReject }) => {
  const user = item?.requester;
  return (
    <View style={styles.card}>

      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image
            source={user?.profile_photo_url ? { uri: user.profile_photo_url } : Icons.placeholder}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            {/* NAME + POSTS */}
            <View style={styles.nameRow}>
              <Text style={Typography.black14Bold}>{user?.name || user?.full_name || ""}</Text>
              <Text style={styles.postText}>{user?.post_count || 0} Posts</Text>
            </View>

            {/* LOCATION */}
            {user?.locality?
            <View style={styles.row}>
              <Image source={Icons.location} style={styles.locIcon} />
              <Text style={Typography.black12Regular}>{`${user?.locality?.locality_name|| user?.locality?.district},${user?.locality?.state || ''}`}</Text>
            </View>
            :
              <View style={styles.row}>
              <Image source={Icons.professional} style={styles.locIcon} />
              <Text style={Typography.black12Regular}>{`${user?.locality?.company_name || user?.locality?.college_name || ''}`}</Text>
            </View>
            }

            {/* MUTUAL FRIENDS */}
            {user?.mutual_friends_count>0 &&
            <View style={styles.row}>
              <Image source={Icons.placeholder} style={styles.smallIcon} />
              <Text style={Typography.black12Regular}>{user?.mutual_friends_count || 0} Mutual Friends</Text>
            </View>
            }
          </View>
        </View>

        {/* TIME */}
        <Text style={styles.timeText}>{getTimeAgo(item?.createdAt)}</Text>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => onReject(item?.requester)}
          disabled={rejectLoading}
        >
          <Text style={[styles.rejectText]}>
            {rejectLoading ? "Loading..." : "Reject"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept(item?.requester)}
          disabled={acceptLoading}
        >
          <Text style={styles.acceptText}>
            {acceptLoading ? "Loading..." : "Accept"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default FriendRequestCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  postText: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
  },

  timeText: {
    ...Typography.black11Regular,
    color: Colors.secondaryText,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },

  locIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    objectFit: 'contain'
  },

  smallIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  btnWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  rejectBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 26,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 26,
    flex: 1,
    alignItems: "center",
  },

  rejectText: {
    ...Typography.black13Bold,
    color: Colors.primary,
  },

  acceptText: {
    ...Typography.black13Bold,
    color: "#fff",
  },
});
