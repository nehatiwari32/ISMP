import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { CommonListingCard } from "../common";
import { getLikeList } from "../../redux/slices/postSlice";
import { Typography } from "../../theme/typography";

const { height } = Dimensions.get("window");

const LikeListModal = ({ visible, onClose, targetId, targetType }) => {

  const dispatch = useDispatch();

  const [likes, setLikes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // =======================
  // 🔥 API CALL
  // =======================
  const loadLikes = async (pageNumber = 1) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await dispatch(
        getLikeList({
          target_id: targetId,
          target_type: targetType,
          page: pageNumber,
          limit: 10
        })
      ).unwrap();

      const list = res?.items ?? [];

      if (pageNumber === 1) {
        setLikes(list);
      } else {
        setLikes(prev => [...prev, ...list]);
      }

      setTotal(res?.total || 0);
      setHasMore(list.length === 10);

    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // 🔥 RUN WHEN MODAL OPENS
  // =======================
  useEffect(() => {
    if (visible) {
      setLikes([]);
      setPage(1);
      setHasMore(true);
      loadLikes(1);
    }
  }, [visible]);

  // =======================
  // 🔥 PAGINATION
  // =======================
  const loadMore = () => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      loadLikes(next);
    }
  };

  // =======================
  // 🔥 EMPTY UI
  // =======================
  const EmptyList = () => (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <Text style={{ color: "#777", fontSize: 14 }}>No liked users found</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContainer}>

          {/* Handle Bar */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Likes ({total})</Text>

          {/* LIST */}
          <FlatList
            data={likes}
            keyExtractor={(item) => item._id.toString()}
            showsVerticalScrollIndicator={true}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={!loading && <EmptyList />}
            renderItem={({ item }) => (
              <CommonListingCard
                title={item.username || ""}
                subTitle=""
                image={item.profile_photo_url}
              />
            )}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator size="small" color="#000" style={{ marginVertical: 12 }} />
              ) : null
            }
          />

        </View>
      </View>
    </Modal>
  );
};

export default LikeListModal;


// =======================
// 🎨 STYLES
// =======================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayBg: { flex: 1 },

  // FIXED HEIGHT
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    height: height * 0.65, // FIXED HEIGHT
  },

  handle: {
    alignSelf: "center",
    width: 50,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 12,
  },

  title: {
    ...Typography.black13Bold,
    marginBottom: 12,
  },
});
