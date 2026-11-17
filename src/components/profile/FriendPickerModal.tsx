// components/pickers/FriendPickerModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch } from "react-redux";
import { getFriends } from "../../redux/slices/friendSlice";
import { Typography } from "../../theme/typography";
import { Colors } from "../../theme/colors";
import GradientAvatar from "../GradientAvatar";
import { CustomCheckbox } from "../common";
import ViewContainer from "../ViewContainer";

type Friend = {
  user_id: string;
  name?: string | null;
  username?: string | null;
  full_name: string;
  profile_photo_url?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  title?: string;
  selectedList?: string[]; // initial selected ids
};

const LIMIT = 10;

const FriendPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  title = "Select Friends",
  selectedList = [],
}) => {
  const dispatch = useDispatch<any>();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedList || []);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFriends([]);
      setPage(1);
      setTotal(0);
      setSelectedIds(selectedList || []);
      loadFriends(1);
    }
  }, [visible]);

  const loadFriends = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const res: any = await dispatch(getFriends({ page: pageNum, limit: LIMIT })).unwrap();
      const items = res?.items ?? [];
      if (pageNum === 1) setFriends(items);
      else setFriends((p) => [...p, ...items]);
      setPage(res.page ?? pageNum);
      setTotal(res.total ?? (res.items?.length ?? 0));
    } catch (err) {
      console.error("Friend load error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loading) return;
    if (friends.length >= total) return;
    loadFriends(page + 1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <ViewContainer
      headerTitle={title}
      rightText="Done"
      onRightPress={() => onSave(selectedIds)}
    >
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => onClose()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => toggleSelect(item.user_id)}>
            <GradientAvatar source={item.profile_photo_url ? { uri: item.profile_photo_url } : undefined} size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.full_name || item.name || item.username}</Text>
              {item.username ? <Text style={styles.username}>{item.username}</Text> : null}
            </View>
            <CustomCheckbox
              checked={selectedIds.includes(item.user_id)}
              onPress={() => toggleSelect(item.user_id)}
              size={22}
            />
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} /> : null}
      />
    </ViewContainer>
  );
};

export default FriendPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { ...Typography.black16Bold },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, },
  name: { ...Typography.black14Medium },
  username: { ...Typography.black12Regular, color: Colors.secondaryText },
  saveButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, marginTop: 12 },
  saveText: { color: "#fff", textAlign: "center", ...Typography.black14Bold },
});
