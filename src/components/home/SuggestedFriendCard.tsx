import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useDispatch } from "react-redux";
import FastImage from "react-native-fast-image";

import { sendFriendRequest } from "../../redux/slices/friendSlice";
import { Icons } from "../../assets/icons";
import { Typography } from "../../theme/typography";
import { Colors } from "../../theme/colors";

const SuggestedFriendCard = ({ friend, onRequestSent, onRemove }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    try {
      setLoading(true);

      await dispatch(
        sendFriendRequest({ target_user_id: friend.user_id })
      ).unwrap();

      // remove from list
      onRequestSent(friend.user_id);

    } catch (err) {
      Alert.alert('Error', err?.data)
      console.log("Request failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.cardWrapper}>
      {/* ❌ CROSS */}
      <TouchableOpacity style={styles.cross} onPress={() => onRemove(friend?.user_id)}>
        <Image source={Icons.cross} style={styles.crossIcon} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.columnWrapper}>
          <View style={{ alignItems: "center" }}>
            {friend?.profile_photo_url ?
              <FastImage
                source={{
                  uri: friend?.profile_photo_url,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              :
              <View style={[styles.avatar, { borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: "center" }]}>
                <Image
                  source={Icons.placeholderIcon}
                  style={{ height: 32, width: 32, objectFit: "contain" }}
                  tintColor={Colors.primary}
                />
              </View>
            }

            <Text style={[Typography.black14Bold, { textAlign: "center" }]} numberOfLines={1}>
              {friend?.full_name}
            </Text>

            {friend?.common_interests?.interests?.length > 0 && <Text
              style={[Typography.black13Medium, { textAlign: "center", color: Colors.secondaryText }]}
              numberOfLines={1}
            >
              {friend.common_interests.interests.join(", ")}
            </Text>}

            {friend?.location?.[0] && <View style={styles.locationRow}>
              <Image source={Icons.location} style={styles.locIcon} />
              <Text style={[Typography.black13Medium, { color: Colors.secondary }]} numberOfLines={1}>
                {[
                  friend.location[0].locality_name,
                  friend.location[0].district,
                  friend.location[0].state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>}
          </View>
          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.btn,
              friend?.request_status === "pending" && styles.btnCancel,
            ]}
            onPress={handleRequest}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[Typography.black12Medium, { color: Colors.primary }]}>
                Send Request
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SuggestedFriendCard;

const styles = StyleSheet.create({
  cardWrapper: {
    paddingTop: 20,
    overflow: "visible",
    position: "relative",
  },
  cross: {
    position: "absolute",
    top: 8,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.grayColor,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  crossIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.gray40,
  },
  card: {
    width: 167,
    height: 181,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  columnWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: "space-between",
    alignItems: "center"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
    marginBottom: 6,
  },
  locIcon: { width: 14, height: 14, tintColor: Colors.secondary, objectFit: 'contain' },
  btn: {
    width: 143,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryExtraLight,
    marginTop: 6,
    alignItems: 'center'
  },
  btnCancel: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
});
