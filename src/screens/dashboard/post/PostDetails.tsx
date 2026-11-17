import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import RenderHTML from 'react-native-render-html';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { Colors } from '../../../theme/colors';
import { Icons } from '../../../assets/icons';
import { Images } from '../../../assets/images';
import { Typography } from '../../../theme/typography';
import SharePostModal from '../../../components/home/SharePostModal';
import {
  getTimeAgo,
  openDocument,
  REACTED_EMOJIS,
  downloadFile,
} from '../../../utils/helper';
import {
  addLike,
  addReaction,
  deletePost,
  getPostDetails,
  unLike,
} from '../../../redux/slices/postSlice';
import {
  blockUser,
  followUser,
  notInterested,
  reportPost,
  savePost,
  unFollowUser,
  unFriendUser,
  unSavePost,
} from '../../../redux/slices/userActionSlice';
import {
  CommonModal,
  AppAvatar,
  LikeListModal,
  PostDetailCommentSection,
  ViewContainer,
} from '../../../components';
import { usePostMenuOptions } from '../../../hooks/usePostMenuOptions';
import WhySeeingPostModal from '../../../components/WhySeeingPostModal';
import Toast from '../../../utils/toast';
import { sendFriendRequest } from '../../../redux/slices/friendSlice';
import toast from '../../../utils/toast';
import LinkPreviewComponent from '../../../components/post/LinkPreview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getMimeExtension = (type: string): string => {
  switch (type) {
    case "video":
      return "mp4";
    case "photo":
    case "image":
      return "jpg";
    default:
      return "bin";
  }
};
const PostDetails = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userProfile } = useSelector((state: any) => state.profile);
  const isFocused = useIsFocused();

  const postId = route?.params?.postId;
  const pendingOperation = useRef<Record<string, 'like' | 'unlike' | null>>({});
  const [showWhyModal, setShowWhyModal] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const [showLikes, setShowLikes] = useState<{
    visible: boolean;
    mediaId?: string;
    targetType?: string;
  }>({ visible: false });
  const [showComments, setShowComments] = useState<{
    visible: boolean;
    mediaId?: string;
  }>({ visible: false });
  const [askModal, setAskModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // ✅ Per-video mute state
  const [videoMuteStates, setVideoMuteStates] = useState<Record<number, boolean>>({});

  // ✅ Per-media loading state
  const [mediaLoadingStates, setMediaLoadingStates] = useState<Record<number, boolean>>({});

  const [post, setPost] = useState<any>(null);


  console.log("postdetails", post);


  // Media-specific state
  const [mediaStates, setMediaStates] = useState<
    Record<
      string,
      {
        isLiked: boolean;
        likesCount: number;
        commentsCount: number;
      }
    >
  >({});
  const [videoEnded, setVideoEnded] = useState<Record<number, boolean>>({});

  const isOwnPost = userProfile?.user_id === post?.user_id;
  const userStatus = post?.user;

  const isBlocked = userStatus?.is_status === 'blocked';
  const isFriend = userStatus?.friends_status === true;
  const isFollowing = userStatus?.follow_status === 'following';
  const isSaved = post?.is_saved ?? post?.saved ?? false;

  const [followingState, setFollowingState] = useState(false);
  const [friendState, setFriendState] = useState(isFriend);
  const [savedState, setSavedState] = useState(isSaved);
  const [blockState, setBlockState] = useState(isBlocked);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const dynamicMenuOptions = usePostMenuOptions({
    isOwnPost,
    savedState,
    friendState,
    followingState,
    blockState,
  });

  const lastTapRef = useRef<Record<number, number>>({});
  const videoRefs = useRef<any>({});

  useEffect(() => {
    setFollowingState(isFollowing);
    setFriendState(isFriend);
    setSavedState(isSaved);
    setBlockState(isBlocked);
  }, [isFollowing, isFriend, isSaved, isBlocked]);

  useFocusEffect(
    useCallback(() => {
      if (post?.user) {
        setFollowingState(post?.user?.follow_status === 'following');
      }
    }, [post?.user?.follow_status]),
  );

  useEffect(() => {
    if (!postId) return;
    loadPostDetails();
  }, [postId]);

  useEffect(() => {
    if (!post?.media) return;

    setMediaStates(prev => {
      const updated = { ...prev };

      post.media.forEach((media: any) => {
        const mediaId = media._id;

        updated[mediaId] = {
          isLiked: prev[mediaId]?.isLiked ?? media.liked ?? false,
          likesCount: prev[mediaId]?.likesCount ?? media.likes_count ?? 0,
          commentsCount: Math.max(prev[mediaId]?.commentsCount || 0, media.comments_count || 0),
        };
      });

      return updated;
    });

    // ✅ Initialize loading states for all media
    const initialLoadingStates: Record<number, boolean> = {};
    post.media.forEach((_: any, index: number) => {
      initialLoadingStates[index] = true; // Start with loading
    });
    setMediaLoadingStates(initialLoadingStates);

    // ✅ Find first video and auto-play it
    const firstVideoIndex = post.media.findIndex((m: any) => m.type === 'video');
    if (firstVideoIndex !== -1) {
      setActiveVideoIndex(firstVideoIndex);
    }
  }, [post?.media]);

  const handleWatchAgain = (index: number) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].seek(0);
      setVideoEnded(prev => ({ ...prev, [index]: false }));
      setActiveVideoIndex(index); // ✅ Set as active
    }
  };

  const loadPostDetails = async () => {
    try {
      const res = await dispatch(getPostDetails(postId)).unwrap();
      setPost(res || {});
    } catch (err) {
      toast.error('Failed to load post')

    }
  };

  const handleMediaLikeToggle = async (mediaId: string, mediaIndex: number) => {
    if (pendingOperation.current[mediaId]) return;

    const currentState = mediaStates[mediaId];
    if (!currentState) return;

    const prevLiked = currentState.isLiked;
    const prevCount = currentState.likesCount;

    const payload = {
      target_type: 'media',
      target_id: post?._id,
      media_id: mediaId,
    };

    try {
      if (prevLiked) {
        pendingOperation.current[mediaId] = 'unlike';

        setMediaStates(prev => ({
          ...prev,
          [mediaId]: {
            ...prev[mediaId],
            isLiked: false,
            likesCount: Math.max(0, prevCount - 1),
          },
        }));

        await dispatch(unLike(payload)).unwrap();
      } else {
        pendingOperation.current[mediaId] = 'like';

        setMediaStates(prev => ({
          ...prev,
          [mediaId]: {
            ...prev[mediaId],
            isLiked: true,
            likesCount: prevCount + 1,
          },
        }));

        await dispatch(addLike(payload)).unwrap();
      }
    } catch (error) {
      // rollback
      setMediaStates(prev => ({
        ...prev,
        [mediaId]: {
          ...prev[mediaId],
          isLiked: prevLiked,
          likesCount: prevCount,
        },
      }));
    } finally {
      pendingOperation.current[mediaId] = null;
    }
  };

  // ✅ Handle single/double tap for video
  const handleVideoTap = useCallback(
    (mediaId: string, mediaIndex: number) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (!lastTapRef.current[mediaIndex]) {
        lastTapRef.current[mediaIndex] = 0;
      }

      if (
        lastTapRef.current[mediaIndex] &&
        now - lastTapRef.current[mediaIndex] < DOUBLE_TAP_DELAY
      ) {
        // ✅ Double tap → Like
        handleMediaLikeToggle(mediaId, mediaIndex);
        lastTapRef.current[mediaIndex] = 0;
      } else {
        // ✅ Single tap → Play/Pause
        if (activeVideoIndex === mediaIndex) {
          // Already playing, pause it
          setActiveVideoIndex(null);
        } else {
          // Play this video (pause others automatically)
          setActiveVideoIndex(mediaIndex);
        }
        lastTapRef.current[mediaIndex] = now;
      }
    },
    [activeVideoIndex, mediaStates],
  );

  // ✅ Handle double tap for images (like only)
  const handleMediaDoubleTap = useCallback(
    (mediaId: string, mediaIndex: number) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (!lastTapRef.current[mediaIndex]) {
        lastTapRef.current[mediaIndex] = 0;
      }

      if (
        lastTapRef.current[mediaIndex] &&
        now - lastTapRef.current[mediaIndex] < DOUBLE_TAP_DELAY
      ) {
        // Double tap detected - toggle like
        handleMediaLikeToggle(mediaId, mediaIndex);
        lastTapRef.current[mediaIndex] = 0;
      } else {
        // Single tap
        lastTapRef.current[mediaIndex] = now;
      }
    },
    [mediaStates],
  );

  // ✅ Handle double tap for entire post (like first media)
  const handlePostDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const POST_TAP_KEY = 'post_tap';

    if (!lastTapRef.current[POST_TAP_KEY]) {
      lastTapRef.current[POST_TAP_KEY] = 0;
    }

    if (
      lastTapRef.current[POST_TAP_KEY] &&
      now - lastTapRef.current[POST_TAP_KEY] < DOUBLE_TAP_DELAY
    ) {
      // Double tap detected on post - like first media
      if (post?.media?.length > 0) {
        const firstMedia = post.media[0];
        const firstMediaId = firstMedia._id || firstMedia.url;
        handleMediaLikeToggle(firstMediaId, 0);
      }
      lastTapRef.current[POST_TAP_KEY] = 0;
    } else {
      // Single tap
      lastTapRef.current[POST_TAP_KEY] = now;
    }
  }, [post, mediaStates, handleMediaLikeToggle]);

  const handleReactionSelect = async (emoji: string, mediaId: string) => {
    setShowReactions(null);
    try {
      await dispatch(
        addReaction({
          target_type: 'media',
          target_id: mediaId,
          emoji: emoji,
        }),
      ).unwrap();
      loadPostDetails();
    } catch (error) {
    }
  };

  const handleFollowToggle = async () => {
    const payload = { follow_user_id: post?.user_id };
    const prev = followingState;

    try {
      setFollowingState(!prev);

      if (prev) {
        await dispatch(unFollowUser(payload)).unwrap();
      } else {
        await dispatch(followUser(payload)).unwrap();
      }
    } catch {
      setFollowingState(prev);
    }
  };

  const handleSaveToggle = async () => {
    if (!post?._id) return;

    const payload = { post_id: post._id };
    const prev = savedState;

    try {
      setSavedState(!prev);

      if (prev) {
        await dispatch(unSavePost(payload)).unwrap();
      } else {
        await dispatch(savePost(payload)).unwrap();
      }
    } catch (error) {
      setSavedState(prev);
    }
  };

  const handleBlockUser = async () => {
    try {
      await dispatch(blockUser({ blocked_user_id: post?.user_id })).unwrap();
      setShowMenu(false);
      navigation.goBack();
    } catch (error) {
      toast.error('Failed to block user')

    }
  };

  const handleReportPost = async () => {
    try {
      setReportLoading(true);
      await dispatch(
        reportPost({ content_id: post?._id, content_type: 'post' }),
      ).unwrap();

      loadPostDetails();
      setShowMenu(false);
      setAskModal(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to report post')

    } finally {
      setReportLoading(false);
    }
  };

  const handleFriendToggle = useCallback(() => {
    const payload = { friend_user_id: post?.user_id };
    (dispatch as any)(friendState ? unFriendUser(payload) : sendFriendRequest({ target_user_id: post?.user_id }));
    setFriendState(!friendState);
  }, [dispatch, post?.user_id, friendState]);

  const handleNotInterested = async () => {
    try {
      await dispatch(
        notInterested({ content_id: post?._id, content_type: 'post' }),
      ).unwrap();
      loadPostDetails();
      setShowMenu(false);
    } catch (error) {
    }
  };

  const handleDeletePost = useCallback((postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  }, []);

  const confirmDeletePost = useCallback(async () => {
    if (!postToDelete) return;

    try {
      await dispatch(deletePost({ post_id: postToDelete })).unwrap();
      Toast.success('Post deleted successfully');
      navigation.goBack();
    } catch (error) {
      Toast.error('Failed to delete post');
    } finally {
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  }, [dispatch, postToDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  }, []);

  const handleMenuAction = (label: string) => {
    switch (label) {
      case 'Save':
      case 'Unsave Post':
        handleSaveToggle();
        break;
      case 'Add User':
      case 'Unfriend User':
        handleFriendToggle();
        break
      case 'Search':
        navigation.navigate('SearchUserScreen');
        return;
      case 'Edit Post':
        navigation.navigate('BottomTabs', {
          screen: 'AddPost',
          params: {
            postId: post?._id,
            post: post,
          },
        });
        return;
      case 'Delete Post':
        handleDeletePost(post?._id);
        break;
      case 'Follow User':
      case 'Unfollow User':
        handleFollowToggle();
        break;
      case 'Block User':
        handleBlockUser();
        break;
      case 'Why seeing this Post?':
        setShowWhyModal(true);
        setShowMenu(false);
        return;


      case 'Report':
        setAskModal(true);
        return;
      case 'Not Interested':
        handleNotInterested();
        break;

      case 'Download':
        if (post?.media?.length > 0) {
          const firstMedia = post.media[0];
          if (firstMedia?.url) {
            const mediaType = firstMedia.type === 'video' ? 'video' : 'photo';
            const ext = getMimeExtension(mediaType);
            const timestamp = Date.now();
            const fileName = `${mediaType}_${timestamp}.${ext}`;
            downloadFile(firstMedia.url, fileName, mediaType);
          }
        }
        break;
      default:
    }
    setShowMenu(false);
  };

  const handleCommentAdded = (mediaId: string) => {
    setMediaStates(prev => ({
      ...prev,
      [mediaId]: {
        ...prev[mediaId],
        commentsCount: (prev[mediaId]?.commentsCount || 0) + 1,
      },
    }));
    setTimeout(() => loadPostDetails(), 500);
  };

  const formattedLocalities = useMemo(() => {
    if (!Array.isArray(post?.localities_detail)) return '';
    const names = post.localities_detail
      .map((item: any) => item.locality_name || '')
      .join(', ');
    return names.length > 28 ? names.slice(0, 28) + '...' : names;
  }, [post?.localities_detail]);

  if (!post) {
    return (
      <ViewContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </ViewContainer>
    );
  }

  const renderMediaItem = (item: any, index: number) => {
    const mediaUrl = item?.url;
    const thumbnailUrl = item?.thumbnail_url || mediaUrl;
    const mediaId = item._id || mediaUrl;
    const mediaState = mediaStates[mediaId] || {
      isLiked: false,
      likesCount: 0,
      commentsCount: 0,
    };

    const isLoading = mediaLoadingStates[index] ?? false;

    // Get emoji data for this media
    const emojiEntries = Object.entries(item?.emojis_count || {});
    const sortedEmojis = emojiEntries.sort((a: any, b: any) => b[1] - a[1]);
    const topTwo = sortedEmojis.slice(0, 2);
    const totalCount = emojiEntries.reduce((acc, [, c]: any) => acc + c, 0);

    const renderMediaContent = () => {
      switch (item?.type) {
        case 'image':
          return (
            <TouchableOpacity
              onPress={() => handleMediaDoubleTap(mediaId, index)}
              activeOpacity={0.9}
              style={styles.mediaWrapper}
            >
              {isLoading && (
                <View style={styles.mediaLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
              <Image
                source={{ uri: mediaUrl }}
                style={styles.mediaItem}
                resizeMode="contain"
                onLoadStart={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoadEnd={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
              />
            </TouchableOpacity>
          );

        case 'video':
          const isThisVideoActive = activeVideoIndex === index;
          const isThisVideoMuted = videoMuteStates[index] ?? true; // Default muted

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleVideoTap(mediaId, index)}
              style={styles.videoContainer}
            >
              {isLoading && (
                <View style={styles.mediaLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}

              <Video
                ref={ref => { videoRefs.current[index] = ref; }}
                source={{ uri: mediaUrl }}
                style={styles.mediaItem}
                poster={thumbnailUrl}
                posterResizeMode="cover"
                resizeMode="cover"
                paused={!isFocused || !isThisVideoActive || videoEnded[index]}
                repeat={false}
                controls={false}
                muted={isThisVideoMuted}
                onEnd={() => {
                  setVideoEnded(prev => ({ ...prev, [index]: true }));
                  setActiveVideoIndex(null);
                }}
                onLoadStart={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoad={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="ignore"
              />

              {videoEnded[index] && (
                <View
                  style={styles.watchAgainOverlay}
                  pointerEvents="box-none"
                >
                  <TouchableOpacity
                    style={styles.watchAgainButton}
                    onPress={() => handleWatchAgain(index)}
                    activeOpacity={0.8}
                  >
                    <Image source={Icons.play} style={styles.watchAgainIcon} tintColor="white" />
                    <Text style={styles.watchAgainText}>Watch Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ✅ Mute/Unmute Button - Per Video */}
              <TouchableOpacity
                style={styles.muteButton}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent video tap
                  setVideoMuteStates(prev => ({
                    ...prev,
                    [index]: !prev[index],
                  }));
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Image
                  source={isThisVideoMuted ? Icons.unmute : Icons.mute}
                  style={styles.muteIcon}
                  tintColor="white"
                />
              </TouchableOpacity>

              {/* ✅ Play/Pause indicator */}
              {!isThisVideoActive && !videoEnded[index] && !isLoading && (
                <View style={styles.playPauseOverlay}>
                  <Image source={Icons.play} style={styles.playPauseIcon} tintColor="white" />
                </View>
              )}
            </TouchableOpacity>
          );

        case 'audio':
          const isAudioPlaying = activeVideoIndex === index;

          return (
            <View style={styles.audioContainer}>
              {isLoading && (
                <View style={styles.mediaLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}

              <Image source={Images.soundWave} style={styles.audioImg} />
              <Video
                ref={ref => (videoRefs.current[index] = ref)}
                source={{ uri: mediaUrl }}
                audioOnly={true}
                paused={!isAudioPlaying}
                controls={false}
                playInBackground={false}
                ignoreSilentSwitch="ignore"
                style={{ width: 0, height: 0 }}
                onLoadStart={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoad={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
              />
              <View style={styles.audioOverlay}>
                <TouchableOpacity
                  style={[styles.playButton]}
                  onPress={() => {
                    if (isAudioPlaying) {
                      setActiveVideoIndex(null);
                    } else {
                      setActiveVideoIndex(index);
                    }
                  }}
                >
                  <Image
                    source={isAudioPlaying ? Icons.pause : Icons.play}
                    style={styles.playIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );

        case 'document':
          return (
            <View style={styles.pdfContainer}>
              <View style={styles.pdfContent}>
                <Image source={Icons.downloadPdf} style={styles.docIcon} />
                <TouchableOpacity onPress={() => openDocument(item?.url)}>
                  <Text style={styles.pdfText}>Download Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          );

        default:
          return (
            <TouchableOpacity
              onPress={() => handleMediaDoubleTap(mediaId, index)}
              activeOpacity={0.9}
              style={styles.mediaWrapper}
            >
              {isLoading && (
                <View style={styles.mediaLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.mediaItem}
                resizeMode="cover"
                onLoadStart={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoadEnd={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
              />
            </TouchableOpacity>
          );
      }
    };

    return (
      <View key={index} style={styles.mediaItemWithActions}>
        {/* Media Content */}
        {renderMediaContent()}

        {/* Individual Footer Actions for each media */}
        <View style={styles.mediaFooterActions}>
          {/* Like Button */}
          <TouchableOpacity
            onPress={() => handleMediaLikeToggle(mediaId, index)}
            onLongPress={() => setShowReactions(index)}
            style={styles.actionButton}
          >
            <Image
              source={mediaState.isLiked ? Icons.fillHeart : Icons.like}
              tintColor={mediaState.isLiked ? Colors.error : Colors.primaryText}
              style={styles.actionIcon}
            />
            <Text
              style={[
                Typography.black13Regular,
                { color: Colors.secondaryTextDark, marginLeft: 4 },
              ]}
            >
              {mediaState.likesCount}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments({ visible: true, mediaId })}
          >
            <Image source={Icons.comment} style={styles.actionIcon} />
            <Text
              style={[
                Typography.black13Regular,
                { color: Colors.secondaryTextDark, marginLeft: 4 },
              ]}
            >
              {mediaState.commentsCount}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={() => setShowShareModal(true)}
            style={styles.actionButton}
          >
            <Image source={Icons.postShare} style={styles.actionIcon} />
            <Text
              style={[
                Typography.black13Regular,
                { color: Colors.secondaryTextDark, marginLeft: 4 },
              ]}
            >
              {item?.shares_count || 0}
            </Text>
          </TouchableOpacity>

          {/* Emoji Reactions */}
          {emojiEntries.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setShowLikes({ visible: true, mediaId, targetType: 'media' })
              }
              style={styles.emojiReactions}
            >
              <View style={styles.mediaEmojiContainer}>
                {topTwo.map(([emoji, _count]: any, emojiIndex: number) => (
                  <Text key={emojiIndex} style={styles.emoji}>
                    {emoji}
                  </Text>
                ))}
              </View>
              <Text
                style={[
                  Typography.black13Regular,
                  { color: Colors.secondaryTextDark, marginLeft: 8 },
                ]}
              >
                {totalCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.border} />

        {/* Reaction Bar for this specific media */}
        {showReactions === index && (
          <>
            <TouchableOpacity
              style={styles.reactionOverlay}
              activeOpacity={1}
              onPress={() => setShowReactions(null)}
            />
            <View style={styles.reactionBar}>
              {REACTED_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e.symbol}
                  onPress={() => handleReactionSelect(e.symbol, mediaId)}
                >
                  <Text style={styles.reactionEmoji}>{e.symbol}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  const userName = post?.user?.full_name || post?.user?.name || '';

  return (
    <ViewContainer containerStyle={{ paddingHorizontal: 0, flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.lightBg }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <AppAvatar
              imageUrl={post?.user?.profile_photo_url}
              name={post?.user?.full_name || post?.user?.name}
              size={30}
              borderWidth={1}
            />
            <View style={{ paddingLeft: 5 }}>
              <Text style={Typography.black13Bold}>
                {userName}
              </Text>
              <Text style={[Typography.black11Bold, { color: Colors.primary }]}>
                {getTimeAgo(post?.createdAt)}
                {post?.user?.ghost_mode === false && !!formattedLocalities && (
                  <>
                    <Text style={styles.dotSeparator}> • </Text>
                    <Text
                      style={[
                        Typography.black12Medium,
                        { color: Colors.primary },
                      ]}
                    >
                      {formattedLocalities}
                    </Text>
                  </>
                )}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!isOwnPost && (
              <TouchableOpacity
                onPress={handleFollowToggle}
                style={[
                  styles.followBtn,
                  {
                    backgroundColor: followingState
                      ? Colors.primaryExtraLight
                      : '#fff',
                  },
                ]}
              >
                <Text
                  style={[Typography.black14Medium, { color: Colors.primary }]}
                >
                  {followingState ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
              <Image source={Icons.more} style={styles.moreIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <View style={{ marginStart: '13.5%', marginEnd: '6%' }}>
          {/* Text */}
          {!!post.text &&
            (post.text.includes('<') ? (
              <RenderHTML
                contentWidth={SCREEN_WIDTH - 32}
                source={{ html: post.text }}
                enableCSSInlineProcessing={true}
                baseStyle={{ fontSize: 12, marginBottom: 6 }}
                tagsStyles={{
                  div: {
                    backgroundColor: 'transparent',
                  },
                  span: {
                    color: Colors.primaryText,
                  },
                  body: { marginBottom: 6 }
                }}
                defaultTextProps={{
                  style: {
                    fontSize: 12,
                    color: Colors.primaryText,
                    marginBottom: 6,
                  }
                }}
              />
            ) : (
              <Text style={[Typography.black12Regular, { marginBottom: 6 }]}>
                {post.text}
              </Text>
            ))}

          {/* Hashtags */}
          {!!post.hashtags?.length && (
            <Text style={[Typography.black12Regular, { marginBottom: 6 }]}>
              {post.hashtags.map((tag: string) => `#${tag}`).join(' ')}
            </Text>
          )}

          {/* Link */}
          {!!post.link && (
            // <Text
            //   onPress={() => Linking.openURL(post.link)}
            //   style={[
            //     Typography.black12Regular,
            //     {
            //       marginBottom: 6,
            //       textDecorationLine: 'underline',
            //       color: 'blue',
            //     },
            //   ]}
            // >
            //   {post.link}
            // </Text>
            <LinkPreviewComponent
              url={post.link}
              showRemove={false}
            />
          )}
        </View>

        {/* Vertical Media List with Individual Actions */}
        {post?.media && post.media.length > 0 && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.verticalMediaContainer}
            onPress={() => handlePostDoubleTap()}
          >
            {post.media.map((mediaItem: any, mediaIndex: number) =>
              renderMediaItem(mediaItem, mediaIndex),
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Menu */}
      {showMenu && (
        <>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuContainer}>
            {dynamicMenuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem]}
                onPress={() => handleMenuAction(option.label)}
              >
                <Image
                  source={option.icon}
                  style={styles.menuIcon}
                  tintColor={
                    option.label === 'Report' ? Colors.error : Colors.primary
                  }
                />
                <Text
                  style={[
                    Typography.black14Medium,
                    {
                      color:
                        option.label === 'Report'
                          ? Colors.error
                          : Colors.secondaryText,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Comment Modal */}
      {showComments.visible && (
        <PostDetailCommentSection
          mediaId={showComments.mediaId}
          onClose={() => setShowComments({ visible: false })}
          onCommentAdded={() =>
            showComments.mediaId && handleCommentAdded(showComments.mediaId)
          }
        />
      )}

      {showWhyModal && (
        <WhySeeingPostModal
          image={post?.user?.profile_photo_url}
          visible={showWhyModal}
          onClose={() => setShowWhyModal(false)}
        />
      )}

      {/* Modals */}
      {askModal && (
        <CommonModal
          visible={askModal}
          onClose={handleReportPost}
          onConfirm={() => setAskModal(false)}
          btnRow={true}
          image={Images.report}
          imgStyle={{
            height: 138,
            width: 140,
            objectFit: 'contain',
            marginBottom: 10,
            alignSelf: 'center',
          }}
          title={'Are you sure want to report this post?'}
          btnRowTitle1={
            reportLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              'Confirm'
            )
          }
          btnRowTitle2="Cancel"
        />
      )}

      {showLikes.visible && (
        <LikeListModal
          visible={showLikes.visible}
          onClose={() => setShowLikes({ visible: false })}
          targetId={showLikes.mediaId || postId}
          targetType={showLikes.targetType || 'post'}
        />
      )}

      {showShareModal && (
        <SharePostModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <CommonModal
        visible={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Post"
        body="Are you sure you want to delete this post?"
        btnRow={true}
        btnRowTitle1="Cancel"
        btnRowTitle2="Delete"
        onConfirm={confirmDeletePost}
      />
    </ViewContainer>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: { width: '60%', flexDirection: 'row', alignItems: 'center' },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  moreIcon: {
    height: 14,
    width: 14,
    marginLeft: 6,
    resizeMode: 'contain',
  },
  reactionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 500,
  },
  reactionBar: {
    position: 'absolute',
    bottom: 65,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    zIndex: 999,
  },
  reactionEmoji: {
    fontSize: 26,
    marginHorizontal: 6,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 220,
    borderWidth: 0.8,
    borderColor: Colors.border10,
    zIndex: 999,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.primary,
  },
  mediaWrapper: {
    position: 'relative',
  },
  mediaItem: {
    marginStart: '8%',
    width: SCREEN_WIDTH - 80,
    height: 259,
    objectFit: 'cover',
  },
  mediaLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    position: 'relative',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 16,
    height: 16,
    tintColor: '#000',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  playPauseIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  muteButton: {
    position: 'absolute',
    bottom: 10,
    right: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.iconBg,
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  muteIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  watchAgainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  watchAgainButton: {
    backgroundColor: Colors.iconBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
  },
  watchAgainIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  watchAgainText: {
    ...Typography.black14Bold,
    color: 'white',
  },
  audioContainer: {
    width: SCREEN_WIDTH - 80,
    height: 180,
    position: 'relative',
    marginStart: '10%',
  },
  audioImg: {
    width: SCREEN_WIDTH - 80,
    height: 180,
    objectFit: 'cover',
  },
  audioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dotSeparator: {
    fontSize: 12,
    color: Colors.primaryExtraLight,
  },
  pdfContainer: {
    width: SCREEN_WIDTH - 80,
    height: 180,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginStart: '10%',
  },
  pdfContent: {
    alignItems: 'center',
  },
  docIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFF',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    ...Typography.black12Medium,
    textDecorationLine: 'underline',
    color: '#FFF',
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  verticalMediaContainer: {
    backgroundColor: '#fff',
  },
  mediaItemWithActions: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  border: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  mediaFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginStart: '8%',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  emojiReactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaEmojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
});