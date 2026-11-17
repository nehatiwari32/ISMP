import React, { useCallback, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import LinearGradient from "react-native-linear-gradient";
import GradientAvatar from "../GradientAvatar";
import { Icons } from "../../assets/icons";
import { Typography } from "../../theme/typography";
import { fetchStories } from "../../redux/slices/storySlice";
import { RootState } from "../../redux/store";
import StoryViewerModal from "./StoryViewerModal";
import { Colors } from "../../theme/colors";

const LIMIT = 10;

// ✅ Memoized Story Card Component
const StoryCard = memo(({ userStory, onPress, isMuted = false }: any) => {
  const latestStory = userStory.stories?.[0];
  const storyImage = latestStory?.media?.[0]?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.storyItem, isMuted && styles.mutedStoryItem]}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: storyImage }}
        style={styles.storyCard}
        imageStyle={styles.storyImage}
      >
        {isMuted && (
          <View style={styles.mutedOverlay}>
            <View style={styles.mutedBadge}>
              <Text style={styles.mutedBadgeText}>🔇</Text>
            </View>
          </View>
        )}
      </ImageBackground>
      <View style={styles.avatarOverlay}>
        <GradientAvatar
          source={
            userStory.user?.profile_photo_url
              ? { uri: userStory.user.profile_photo_url }
              : Icons.placeholder
          }
          size={38}
          borderWidth={isMuted ? 0 : 2.5}
        />
      </View>
      <Text style={[styles.storyName, isMuted && styles.mutedStoryName]} numberOfLines={1}>
        {userStory.user?.username || userStory.user?.full_name}
      </Text>
    </TouchableOpacity>
  );
});

const YourStory = memo(({ userProfile, hasOwnStory, myStories, onViewStory, onAddStory }: any) => {
  // Get latest story image if available
  const latestStory = myStories?.[0];
  const storyImage = latestStory?.media?.[0]?.url;
  const hasImage = hasOwnStory && storyImage;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={hasOwnStory ? onViewStory : undefined}
    >
      {hasImage ? (
        // Show image background if story has image
        <ImageBackground
          source={{ uri: storyImage }}
          style={styles.storyCard}
          imageStyle={styles.storyImage}
        >
          <View style={[styles.avatarOverlay, { bottom: 40 }]}>
            <GradientAvatar
              source={
                userProfile?.profile_photo_url
                  ? { uri: userProfile.profile_photo_url }
                  : Icons.placeholder
              }
              size={38}
              borderWidth={2.5}
            />
          </View>

          {/* Add button for adding more stories */}
          <TouchableOpacity
            style={[styles.addButton, { bottom: 25 }]}
            onPress={onAddStory}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        // Show gradient if no story or no image
        <LinearGradient
          colors={["#FFFFFF", "#FFEAE2"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.storyCard, styles.yourStoryCard]}
        >
          <GradientAvatar
            source={
              userProfile?.profile_photo_url
                ? { uri: userProfile.profile_photo_url }
                : Icons.placeholder
            }
            size={42}
            borderWidth={2.5}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddStory}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
      <Text style={styles.storyName}>Your Story</Text>
    </TouchableOpacity>
  );
});

const StorySection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { myStories, otherStories, mutedStories, hasMoreStories } = useSelector(
    (state: RootState) => state.story
  );
  const { userProfile } = useSelector((state: any) => state.profile);

  const [localPage, setLocalPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [isMutedStory, setIsMutedStory] = useState(false);

  const hasOwnStory = myStories.length > 0;
  const hasMutedStories = mutedStories && mutedStories.length > 0;

  // ✅ Initial load only once using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      if (otherStories.length === 0) {
        dispatch(fetchStories({ page: 1, limit: LIMIT }) as any);
      }
    }, [dispatch, otherStories.length])
  );

  // ✅ Optimized load more with debouncing
  const loadMoreStories = useCallback(() => {
    if (!hasMoreStories || fetchingMore) return;

    setFetchingMore(true);
    const nextPage = localPage + 1;

    dispatch(fetchStories({ page: nextPage, limit: LIMIT }) as any)
      .finally(() => {
        setLocalPage(nextPage);
        setFetchingMore(false);
      });
  }, [hasMoreStories, fetchingMore, localPage, dispatch]);

  const openStory = useCallback((storyGroup: any, isMuted = false) => {
    setActiveStory(storyGroup);
    setIsMutedStory(isMuted);
    setViewerVisible(true);
  }, []);

  const handleViewYourStory = useCallback(() => {
    openStory({
      user_id: userProfile?.user_id,
      user: userProfile,
      stories: myStories,
    }, false);
  }, [userProfile, myStories, openStory]);

  const handleAddStory = useCallback(() => {
    navigation.navigate("BottomTabs", {
      screen: "AddPost",
      params: { type: "Story" },
    });
  }, [navigation]);

  const handleScroll = useCallback((e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const endReached = contentOffset.x + layoutMeasurement.width >= contentSize.width - 50;
    if (endReached) loadMoreStories();
  }, [loadMoreStories]);

  const handleStoryDeleted = useCallback((userId: string, storyId?: string) => {
    console.log("Story deleted:", userId, storyId);
    // Refresh stories after deletion
    dispatch(fetchStories({ page: 1, limit: LIMIT }) as any);
    setViewerVisible(false);
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {/* Your Story */}
        <YourStory
          userProfile={userProfile}
          hasOwnStory={hasOwnStory}
          myStories={myStories}
          onViewStory={handleViewYourStory}
          onAddStory={handleAddStory}
        />

        {/* Other Stories */}
        {otherStories.map((userStory) => (
          <StoryCard
            key={userStory.user_id}
            userStory={userStory}
            onPress={() => openStory(userStory, false)}
            isMuted={false}
          />
        ))}

        {/* Muted Stories Section */}
        {hasMutedStories && (
          <>
            {mutedStories.map((userStory) => (
              <StoryCard
                key={`muted-${userStory.user_id}`}
                userStory={userStory}
                onPress={() => openStory(userStory, true)}
                isMuted={true}
              />
            ))}
          </>
        )}
      </ScrollView>

      {viewerVisible && activeStory && (
        <StoryViewerModal
          visible={viewerVisible}
          onClose={() => {
            setViewerVisible(false);
            setIsMutedStory(false);
          }}
          storyGroup={activeStory}
          onStoryDeleted={handleStoryDeleted}
          isMuted={isMutedStory}
        />
      )}
    </View>
  );
};

export default memo(StorySection);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyItem: {
    width: 96,
    alignItems: "center",
  },
  mutedStoryItem: {
    opacity: 0.6,
  },
  storyCard: {
    width: 96,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
    backgroundColor: "#EEE",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  storyImage: {
    borderRadius: 10,
    resizeMode: "cover",
  },
  yourStoryCard: {
    backgroundColor: "#FFF6F2",
    justifyContent: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 44,
    alignSelf: "center",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E24C15",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  addIcon: {
    ...Typography.black18Medium,
    color: "#fff",
  },
  storyName: {
    ...Typography.black12Medium,
    marginTop: 22,
    textAlign: "center",
  },
  mutedStoryName: {
    color: Colors.secondaryText,
  },
  mutedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 8,
  },
  mutedBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  mutedBadgeText: {
    fontSize: 12,
  },
  // Muted separator styles
  mutedSeparatorContainer: {
    width: 96,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mutedSeparatorLine: {
    width: 1,
    height: 40,
    backgroundColor: Colors.secondaryText,
    opacity: 0.3,
  },
  mutedSeparatorText: {
    ...Typography.black10Bold,
    color: Colors.secondaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    transform: [{ rotate: "90deg" }],
  },
});