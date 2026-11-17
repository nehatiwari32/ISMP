import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, ActivityIndicator, RefreshControl, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getSuggestedFriends } from "../../../redux/slices/friendSlice";
import { SuggestedFriendCard, ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";

const PAGE_LIMIT = 10;

const AllSuggestedFriends = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.friend);

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [allSuggested, setAllSuggested] = useState<any[]>([]);


  // Initial load
  useEffect(() => {
    loadSuggestedFriends(1, true);
  }, []);

  const loadSuggestedFriends = async (pageNum: number, isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result: any = await dispatch(
        getSuggestedFriends({ page: pageNum, limit: PAGE_LIMIT })
      ).unwrap();

      const newItems = result?.items || [];
      const metadata = result?.metadata || {};

      if (isRefresh) {
        setAllSuggested(newItems);
        setPage(1);
      } else {
        setAllSuggested((prev) => [...prev, ...newItems]);
      }

      setHasMore(metadata?.hasNextPage || newItems.length === PAGE_LIMIT);
    } catch (error) {
      console.error("Error loading suggested friends:", error);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !refreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSuggestedFriends(nextPage, false);
    }
  }, [loadingMore, refreshing, hasMore, page]);

  const handleRefresh = useCallback(() => {
    setHasMore(true);
    loadSuggestedFriends(1, true);
  }, []);

  const handleRemoveFromList = (id) => {
    setAllSuggested(prev => prev.filter(item => item.user_id !== id));

    loadSuggestedFriends(1, true);
  };

  const removeFriend = (userId) => {
    handleRemoveFromList(userId)
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading || refreshing) return null;
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100
      }}>
        <Text style={{
          fontSize: 16,
          color: Colors.secondaryText,
          textAlign: "center"
        }}>
          No suggested friends found
        </Text>
      </View>
    );
  };

  return (
    <ViewContainer headerTitle="Suggested Friends" containerStyle={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1, backgroundColor: Colors.lightBg }}>
        <FlatList
          data={allSuggested}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-around" }}
          keyExtractor={(item, index) => `${item.user_id}-${index}`}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1
          }}
          renderItem={({ item }) => (
            <SuggestedFriendCard friend={item} onRequestSent={handleRemoveFromList} onRemove={removeFriend} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ViewContainer>
  );
};

export default AllSuggestedFriends;