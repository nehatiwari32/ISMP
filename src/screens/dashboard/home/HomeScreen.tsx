import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { View, StyleSheet, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import {
  BannerSlider,
  HomeFilters,
  HomeHeader,
  HomePincodeSelection,
  HomeSkeleton,
  LocalityInfoSection,
  PostCard,
  SearchInput,
  SectionDivider,
  StorySection,
  SuggestedFriendCard,
  VibeSection,
  ViewContainer,
} from "../../../components";
import { Colors } from "../../../theme/colors";
import { fetchPost, localityCategories, localityInfo } from "../../../redux/slices/postSlice";
import { RootState } from "../../../redux/store";
import { getSuggestedFriends, removeSuggestedFriend, removeSuggestedFrnd } from "../../../redux/slices/friendSlice";
import { Typography } from "../../../theme/typography";
import { fetchStories } from "../../../redux/slices/storySlice";

const LIMIT = 20;

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { posts, loading, hasMorePost, postType, selectLocality, localCategories, localityInfoList } = useSelector((s: RootState) => s.post);
  const { suggested } = useSelector((s: RootState) => s.friend);
  const { userProfile } = useSelector((state: any) => state.profile);

  const isLocalityInfo = postType === "locality_info" || postType === "locality_problems";
  const isQA = postType?.toLocaleUpperCase() === "QA";

  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [homeLoading, setHomeLoading] = useState(true);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(selectLocality || null);
  const [headerTab, setHeaderTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  // ✅ Prevent multiple simultaneous calls
  const isLoadingRef = useRef(false);
  const hasInitialized = useRef(false);

  const getCategoryPayload = () => {
    if (!activeCategory) return {};

    if (isQA) {
      return { QA_category: activeCategory };
    }

    if (postType === "locality_info") {
      return { locality_info_category: activeCategory };
    }

    if (postType === "locality_problems") {
      return { locality_problem_category: activeCategory };
    }

    return {};
  };

  // ✅ Memoize fetchPosts to prevent recreation
  const fetchPosts = useCallback(
    ({ pageNo = 1 } = {}) => {
      return dispatch(
        fetchPost({
          page: pageNo,
          limit: LIMIT,
          locality_ids: selectedLocation?.id || [],
          type: isQA ? "QA" : postType,
          ...getCategoryPayload(),
        }) as any
      );
    },
    [dispatch, selectedLocation, postType, activeCategory]
  );

  // ✅ Initial load - only once
  useFocusEffect(
    useCallback(() => {
      if (hasInitialized.current) return;

      hasInitialized.current = true;
      setHomeLoading(true);
      setPage(1);

      Promise.all([
        fetchPosts({ pageNo: 1, }),
        dispatch(fetchStories({ page: 1, limit: LIMIT }) as any),
        dispatch(getSuggestedFriends({ page: 1, limit: LIMIT }) as any),
      ]).finally(() => setHomeLoading(false));

      return () => {
        hasInitialized.current = false;
      };
    }, [])
  );

  // ✅ Locality info - only when needed
  useEffect(() => {
    if (postType === "locality_problems" || postType === "locality_info" || postType?.toLocaleUpperCase() === "QA") {
      dispatch(localityCategories({ activity_name: postType === "locality_problems" ? "locality problems" : postType === "locality_info" ? "locality info" : "QA" }) as any);
      dispatch(localityInfo({ page: 1, limit: 50 }) as any);
    }
  }, [postType]);

  // ✅ Set default category
  useEffect(() => {
    if (localCategories?.length > 0 && !activeCategory) {
      const firstCategoryId = localCategories[0]._id;
      setActiveCategory(firstCategoryId);
    }
  }, [localCategories, activeCategory]);


  // ✅ Optimized load more with ref check
  const loadMorePosts = useCallback(() => {
    if (isLoadingRef.current || loading || isFetchingMore || !hasMorePost) {
      return;
    }

    isLoadingRef.current = true;
    setIsFetchingMore(true);

    const nextPage = page + 1;
    setPage(nextPage);

    fetchPosts({ pageNo: nextPage })
      .finally(() => {
        setIsFetchingMore(false);
        isLoadingRef.current = false;
      });
  }, [loading, isFetchingMore, hasMorePost, page, fetchPosts]);

  // ✅ Memoized handlers
  const removeFromSuggested = useCallback((userId: string) => {
    dispatch(removeSuggestedFriend(userId));
    dispatch(getSuggestedFriends({ page: 1, limit: LIMIT }));
  }, [dispatch]);

  const removeFriend = useCallback((userId: string) => {
    dispatch(removeSuggestedFriend(userId));
    dispatch(removeSuggestedFrnd({ target_user_id: userId }));
  }, [dispatch]);

  const onCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setPage(1);
  }, []);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    setPage(1);
    isLoadingRef.current = false;

    try {
      await Promise.all([
        fetchPosts({ pageNo: 1 }),
        dispatch(fetchStories({ page: 1, limit: LIMIT }) as any),
        dispatch(getSuggestedFriends({ page: 1, limit: LIMIT }) as any),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts, dispatch, refreshing]);

  // ✅ Memoized SuggestedFriends component
  const SuggestedFriendsSection = useMemo(() => {
    if (suggested.length === 0) return null;

    return (
      <View style={{ backgroundColor: Colors.lightBg }}>
        <SectionDivider />
        <View style={styles.rowContainer}>
          <Text style={styles.title}>Suggested Friends</Text>
          <Text
            style={styles.seeAll}
            onPress={() => navigation.navigate("AllSuggestedFriends")}
          >
            See All
          </Text>
        </View>

        <FlatList
          data={suggested}
          horizontal
          keyExtractor={(i) => i.user_id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <SuggestedFriendCard
              friend={item}
              onRequestSent={removeFromSuggested}
              onRemove={removeFriend}
            />
          )}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      </View>
    );
  }, [suggested, removeFromSuggested, removeFriend]);

  // ✅ Optimized renderItem with proper keys
  const renderItem = useCallback(({ item, index }: any) => (
    <View key={`post-${item._id}`}>
      <PostCard post={item} />

      {!isQA && index === 0 && SuggestedFriendsSection}
      {index === 2 && <VibeSection />}
    </View>
  ), [isQA, SuggestedFriendsSection]);

  // ✅ Memoized footer
  const ListFooterComponent = useMemo(() => {
    if (!isFetchingMore) return null;
    return (
      <ActivityIndicator
        color={Colors.primary}
        style={{ marginVertical: 20 }}
      />
    );
  }, [isFetchingMore]);

  const handleTabChange = (index, tabLabel) => {
    setHeaderTab(index);

    // Navigate based on tab selection
    const label = tabLabel?.toLowerCase();
    if (label === "friends") {
      // Navigate to Friends screen
      navigation.navigate("FriendScreen");
    } else if (label === "events") {
      // Already on Events screen, do nothing
      return;
    }
  };

  return (
    <>
      <ViewContainer
        isHeader={false}
        isHomeHeader={true}
        backgroundColor={Colors.backgroundLight}
        containerStyle={{ paddingHorizontal: 0 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollable
      >
        <HomeHeader
          activeTab={headerTab}
          onLocationPress={() => setShowLocationDropdown(!showLocationDropdown)}
          selectedLocationLabel={selectedLocation?.label}
          onTabChange={handleTabChange}
        />

        {showLocationDropdown && (
          <View style={styles.overlay} pointerEvents="box-none">
            <Pressable
              style={styles.backdrop}
              onPress={() => setShowLocationDropdown(false)}
            />
            <View style={[styles.dropdownWrapper, { top: userProfile?.addresses?.length > 1 ? 130 : 66 }]} pointerEvents="box-none">
              <View style={styles.dropdown} pointerEvents="auto">
                <HomePincodeSelection
                  visible={showLocationDropdown}
                  selectedId={selectedLocation?.id}
                  onSelect={(item) => {
                    setSelectedLocation(item);
                    setShowLocationDropdown(false);
                    setPage(1);

                    dispatch(
                      fetchPost({
                        page: 1,
                        limit: LIMIT,
                        locality_ids: item.id ? [item.id] : [],
                        type: item.type,
                      }) as any
                    );
                  }}
                />
              </View>
            </View>
          </View>
        )}

        <SectionDivider />

        {isLocalityInfo ? (
          <>
            <LocalityInfoSection
              categories={localCategories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              info={localityInfoList}
            />
            <SectionDivider />
            <SearchInput />
          </>
        ) : (
          isQA ?
            <>
              <SectionDivider />
              <View style={{ paddingVertical: 16 }}>
                <BannerSlider />
              </View>
              <HomeFilters location={selectedLocation} category={activeCategory} onLocationChange={() => setShowLocationDropdown(!showLocationDropdown)} onCategoryChange={onCategoryChange} />
            </>
            :
            <>
              <SearchInput />
              <SectionDivider />
              <StorySection />
              <SectionDivider />
              <View style={{ paddingVertical: 16 }}>
                <BannerSlider />
              </View>
            </>
        )}

        {homeLoading && posts?.length === 0 ? (
          <HomeSkeleton />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.3}
            ListFooterComponent={ListFooterComponent}
            // ✅ Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            initialNumToRender={5}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 600,
              offset: 600 * index,
              index,
            })}
          />
        )}
      </ViewContainer>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  title: { ...Typography.black16Bold },
  seeAll: { ...Typography.black14Regular, color: Colors.primary },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  dropdownWrapper: {
    position: "absolute",
    left: 20,
  },
  dropdown: {
    borderRadius: 16,
    backgroundColor: "#fff",
  },
});