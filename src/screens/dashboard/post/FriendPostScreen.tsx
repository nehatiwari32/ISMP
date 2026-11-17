import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useRoute } from "@react-navigation/native";

import { RootState } from "../../../redux/store";
import { fetchFriendPost } from "../../../redux/slices/postSlice";
import { PostCard, ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";

const LIMIT = 10;

const FriendPostScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();

  // Get params from navigation
  const { friendId, type } = (route.params as any) || {};
  const { friendPosts, loadingFriendPosts, hasMoreFriendPosts } = useSelector(
    (state: RootState) => state.post
  );

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadInitialPosts();
    }, [friendId, type])
  );

  const loadInitialPosts = useCallback(async () => {
    if (!friendId) return;

    setPage(1);
    try {
      await dispatch(
        fetchFriendPost({
          page: 1,
          limit: LIMIT,
          friend_id: friendId,
          type: type
        }) as any
      );
    } catch (error) {
      console.error("Failed to load friend posts:", error);
    }
  }, [dispatch, friendId, type]);

  const handleRefresh = useCallback(async () => {
    if (!friendId) return;

    setRefreshing(true);
    setPage(1);
    try {
      await dispatch(
        fetchFriendPost({
          page: 1,
          limit: LIMIT,
          friend_id: friendId,
          type: type
        }) as any
      );
    } catch (error) {
      console.error("Failed to refresh friend posts:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, friendId, type]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMoreFriendPosts || loadingMore || loadingFriendPosts || !friendId) {
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await dispatch(
        fetchFriendPost({
          page: nextPage,
          limit: LIMIT,
          friend_id: friendId,
          type: type
        }) as any
      );
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more friend posts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, friendId, type, page, hasMoreFriendPosts, loadingMore, loadingFriendPosts]);

  const renderPost = useCallback(({ item }: any) => {
    return <PostCard post={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loadingFriendPosts) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts found</Text>
      </View>
    );
  }, [loadingFriendPosts]);

  const keyExtractor = useCallback((item: any) => item._id, []);

  if (!friendId) {
    return (
      <ViewContainer isHeader headerTitle="Friend Posts">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Invalid friend ID</Text>
        </View>
      </ViewContainer>
    );
  }

  return (
    <ViewContainer
      isHeader
      headerTitle="Friend Posts"
      containerStyle={styles.container}
    >
      <FlatList
        data={friendPosts || []}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    </ViewContainer>
  );
};

export default FriendPostScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    backgroundColor: Colors.lightBg,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
});