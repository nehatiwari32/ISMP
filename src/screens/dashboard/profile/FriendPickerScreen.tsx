import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch } from "react-redux";
import { getFriends } from "../../../redux/slices/friendSlice";

import {
  CustomCheckbox,
  GradientAvatar,
  SearchField,
  ViewContainer,
} from "../../../components";

import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";

const LIMIT = 10;
let searchTimeout: NodeJS.Timeout | null = null;

const FriendPickerScreen = ({ navigation, route }) => {
  const dispatch = useDispatch<any>();

  const {
    selectedList = [],
    title = "Select Friends",
    onSave,
  } = route.params;

  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState(selectedList);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // search state
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadFriends(1, searchText);
  }, []);

  // ----------- FETCH FRIENDS WITH SEARCH + PAGINATION ----------
  const loadFriends = async (pageNum = 1, search = "") => {
    if (loading) return;
    setLoading(true);

    try {
      const res: any = await dispatch(
        getFriends({
          page: pageNum,
          limit: LIMIT,
          search: search.trim(),
        })
      ).unwrap();

      const items = res?.items ?? [];

      if (pageNum === 1) {
        setFriends(items);
      } else {
        setFriends((p) => [...p, ...items]);
      }

      setTotal(res.total ?? items.length);
      setPage(res.page ?? pageNum);
    } catch (err) {
      console.log("Friend load error:", err);
    }

    setLoading(false);
  };

  // ---------- LOAD MORE ----------
  const loadMore = () => {
    if (loading) return;
    if (friends.length >= total) return;

    loadFriends(page + 1, searchText);
  };

  // ---------- SEARCH INPUT HANDLER (DEBOUNCED) ----------
  const handleSearchChange = (text: string) => {
    setSearchText(text);

    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      loadFriends(1, text);
    }, 350); // fast debounce
  };

  // ---------- SELECT FRIEND ----------
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ---------- DONE ----------
  const handleDone = () => {
    if (onSave) onSave(selectedIds);
    navigation.goBack();
  };

  // ---------- EMPTY COMPONENT ----------
  const EmptyList = () => (
    <View style={{ marginTop: 40, alignItems: "center" }}>
      <Text style={{ ...Typography.black14Medium, color: Colors.secondaryText }}>
        No friends found
      </Text>
    </View>
  );

  return (
    <ViewContainer
      headerTitle={title}
      rightText="Done"
      onRightPress={handleDone}
      containerStyle={{ paddingHorizontal: 0 }}
    >
      {/* SEARCH BAR */}
      <View style={{
        flex: 1,
        backgroundColor: Colors.lightBg,
        paddingHorizontal: Spacing.screenHorizontalPadding,
      }}>
        <SearchField
          value={searchText}
          onChangeText={handleSearchChange}
          placeholder="Search Friends"
          containerStyle={{ marginTop: 14, marginBottom: 14 }}
        />

        {/* LIST */}

        <FlatList
          data={friends}
          keyExtractor={(item) => String(item.user_id)}
          ListEmptyComponent={!loading ? <EmptyList /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => toggleSelect(item.user_id)}>
              <GradientAvatar
                source={item.profile_photo_url ? { uri: item.profile_photo_url } : undefined}
                size={40}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.full_name}</Text>
                {item.username && (
                  <Text style={styles.username}>{item.username}</Text>
                )}
              </View>

              <CustomCheckbox
                checked={selectedIds.includes(item.user_id)}
                onPress={() => toggleSelect(item.user_id)}
                size={18}
                borderColor={Colors.border}
              />
            </TouchableOpacity>
          )}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      </View>

    </ViewContainer>
  );
};

export default FriendPickerScreen;

// ----------- Styles -----------
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  name: { ...Typography.black14Medium },
  username: { ...Typography.black12Regular, color: Colors.secondaryText },
});
