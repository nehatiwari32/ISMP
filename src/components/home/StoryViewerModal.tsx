import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
  BackHandler,
} from 'react-native';
import Toast from '../../utils/toast';
import Video, { ResizeMode } from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';

import {
  viewerStoryList,
  deleteStory,
  fetchStories,
  muteStory,
  viewStory,
} from '../../redux/slices/storySlice';
import { addLike, unLike, addReaction } from '../../redux/slices/postSlice';
import {
  reportPost,
  unFollowUser,
  blockUser,
  savePost,
  unSavePost,
  followUser,
  unBlockUser,
  unFriendUser,
} from '../../redux/slices/userActionSlice';
import { sendFriendRequest, cancelFriendRequest, sendStoryFriendRequest } from '../../redux/slices/friendSlice';
import { downloadFile } from '../../utils/helper';
import { Colors } from '../../theme/colors';
import { AppAvatar } from '../common';
import { Icons } from '../../assets/icons';
import { Spacing, Typography } from '../../theme/typography';
import { getRelativeTime } from '../../utils/helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

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
const getDisplayName = (obj: any) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj.username || obj.full_name || obj.name || obj.text || '';
};

const StoryVideo = ({
  uri,
  onEnd,
  onError,
}: {
  uri: string;
  onEnd: () => void;
  onError: () => void;
}) => {
  const videoRef = useRef<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), 150);
    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, []);

  const handleWatchAgain = () => {
    try {
      if (videoRef.current) {
        videoRef.current.seek(0);
        setVideoEnded(false);
      }
    } catch (e) {
      setVideoEnded(false);
    }
  };

  if (!shouldRender) {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
        style={StyleSheet.absoluteFillObject}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          repeat={false}
          paused={paused}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onEnd={onEnd}
          onError={(e) => {
            console.log('VIDEO ERROR:', e);
            setLoading(false);
            onError();
          }}
          controls={false}
          muted={false}
        />

        {loading && (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Watch Again Overlay */}
      {videoEnded && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleWatchAgain}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 30,
              gap: 10,
            }}
          >
            <Image
              source={Icons.play}
              style={{ width: 22, height: 22, tintColor: '#fff' }}
            />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              Watch Again
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// Main StoryViewerModal
// ─────────────────────────────────────────────
const StoryViewerModal = ({
  visible,
  onClose,
  storyGroup,
  onStoryDeleted,
  isMuted = false,
}: any) => {
  const dispatch = useDispatch();
  const navigation = useNavigation()
  const { userProfile } = useSelector((s: any) => s.profile);
  const { viewers, loadingViewers } = useSelector((s: any) => s.story);

  const stories = useMemo(
    () => storyGroup?.stories || [],
    [storyGroup?.stories],
  );
  const isOwnStory = useMemo(
    () => storyGroup?.user_id === userProfile?.user_id,
    [storyGroup?.user_id, userProfile?.user_id],
  );
  const [localStories, setLocalStories] = useState<any[]>([]);

  useEffect(() => {
    if (storyGroup?.stories) {
      setLocalStories(storyGroup.stories);
    }
  }, [storyGroup?.stories]);


  const [index, setIndex] = useState(0);
  const [videoKey, setVideoKey] = useState(0); 
  const [showViewers, setShowViewers] = useState(false);
  const [message, setMessage] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [friendsStatus, setFriendsStatus] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState<string | null>(null);

  const currentStory = useMemo(() => localStories[index], [localStories, index]);
  const hasMultipleStories = stories.length > 1;

  // ✅ Safe media extraction
  const currentMedia = useMemo(() => {
    if (!currentStory?.media || !Array.isArray(currentStory.media)) return null;
    return currentStory.media[0] || null;
  }, [currentStory]);

  const isVideoStory = currentMedia?.type === 'video';
  const mediaUrl = currentMedia?.url || null;

  console.log("userdata", currentStory);

  console.log("viewers", viewers);



  // ✅ Reset states on story change
  useEffect(() => {
    if (currentStory) {
      setIsLiked(currentStory.liked || false);
      setLikesCount(currentStory.likes_count || 0);
      setIsSaved(currentStory.saved || false);

      const user = currentStory.user || {};
      setFollowStatus(user.follow_status || currentStory.follow_status || null);
      setFriendsStatus(user.friends_status || currentStory.friends_status || false);
      setFriendRequestStatus(
        user.friend_request_status || currentStory.friend_request_status || null,
      );
      setIsBlocked(currentStory.blocked_status || false);

      // ✅ New key = video component remounts fresh
      setVideoKey(prev => prev + 1);
    }
  }, [currentStory]);

  // ✅ Reset on modal open
  useEffect(() => {
    if (visible) {
      setIndex(0);
      setVideoKey(prev => prev + 1);
    }
  }, [visible]);

  /* BACK HANDLER */
  useEffect(() => {
    const backAction = () => {
      if (showViewers) { setShowViewers(false); return true; }
      if (showMoreMenu) { setShowMoreMenu(false); return true; }
      if (visible) { onClose(); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showViewers, showMoreMenu, visible, onClose]);



  const viewedRef = useRef(new Set());

  useEffect(() => {
    if (!currentStory?._id) return;
    if (viewedRef.current.has(currentStory._id)) return;
    viewedRef.current.add(currentStory._id);

    if (isOwnStory) {
      dispatch(viewerStoryList(currentStory._id));
    } else {
      dispatch(viewStory(currentStory._id));
    }

  }, [currentStory?._id, isOwnStory]);

  const goNext = useCallback(() => {
    if (index < stories.length - 1) setIndex(prev => prev + 1);
    else onClose();
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(prev => prev - 1);
  }, [index]);

  const refreshStories = useCallback(() => {
    setTimeout(() => dispatch(fetchStories({ page: 1, limit: 20 })), 300);
  }, [dispatch]);

  /* LIKE */
  const handleLikeToggle = useCallback(async () => {
    if (isProcessing || !currentStory?._id) return;
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(prev => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    setIsProcessing(true);
    const payload = { target_type: 'story', target_id: currentStory._id };
    try {
      if (isLiked) await (dispatch as any)(unLike(payload)).unwrap();
      else await (dispatch as any)(addLike(payload)).unwrap();
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      Toast.error('Failed to update like');
    } finally {
      setIsProcessing(false);
      refreshStories()
    }
  }, [isProcessing, currentStory?._id, isLiked, likesCount, dispatch]);

  /* SAVE */
  const handleSaveToggle = useCallback(async () => {
    if (!mediaUrl) {
      Toast.error('No media found to download');
      return;
    }
    try {
      const mediaType = isVideoStory ? 'video' : 'photo';
      const ext = getMimeExtension(mediaType);
      const timestamp = Date.now();
      const fileName = `${mediaType}_${timestamp}.${ext}`;
      await downloadFile(mediaUrl, fileName, mediaType);
    } catch (error: any) {
      console.log("error", error);
      Toast.error('Failed to update save status');
    }
  }, [currentStory, isSaved, dispatch, mediaUrl, isVideoStory]);


  const handleReaction = useCallback(async (emoji: string) => {
    if (!currentStory?._id) return;

    // ✅ Update UI immediately
    setLocalStories(prev =>
      prev.map((story, i) =>
        i === index
          ? { ...story, my_reaction: emoji }
          : story
      )
    );

    try {
      await (dispatch as any)(
        addReaction({
          target_type: 'story',
          target_id: currentStory._id,
          emoji,
        }),
      ).unwrap();
      refreshStories()
    } catch {
      Toast.error('Failed to send reaction');
    }

  }, [currentStory?._id, dispatch, index]);
  /* SEND MESSAGE */
  const handleSendMessage = useCallback(async () => {
    if (message.trim() && currentStory?._id) {
      try { setMessage(''); }
      catch { Toast.error('Failed to send message'); }
    }

  }, [message, currentStory?._id]);

  /* DELETE */
  const handleDeleteStory = useCallback(() => setShowDeleteModal(true), []);

  const confirmDelete = async () => {
    const storyId = currentStory?._id;
    if (!storyId) return;
    try {
      await dispatch(deleteStory(storyId) as any).unwrap();
      if (stories.length <= 1) {
        onClose();
        onStoryDeleted?.(storyGroup?.user_id);
      } else {
        if (index >= stories.length - 1) setIndex(Math.max(0, index - 1));
        onStoryDeleted?.(storyGroup?.user_id, storyId);
      }
      refreshStories();
    } catch {
      Toast.error('Failed to delete story');
    } finally {
      setShowDeleteModal(false);
    }
  };

  /* DOWNLOAD */
  const handleDownload = useCallback(async () => {
    if (!mediaUrl) {
      Toast.error('No media found to download');
      return;
    }
    const mediaType = isVideoStory ? 'video' : 'photo';
    const ext = getMimeExtension(mediaType);
    const timestamp = Date.now();
    const fileName = `${mediaType}_${timestamp}.${ext}`;
    await downloadFile(mediaUrl, fileName, mediaType);
  }, [mediaUrl, isVideoStory]);

  /* MUTE */
  const handleMuteToggle = useCallback(async () => {
    const action = isMuted ? 'unmute' : 'mute';
    const actionText = isMuted ? 'Unmute' : 'Mute';
    Alert.alert(
      `${actionText} Story`,
      `Are you sure you want to ${action} stories from ${storyGroup?.user?.username || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: isMuted ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await (dispatch as any)(
                muteStory({ muted_user_id: storyGroup?.user_id, action }),
              ).unwrap();
              refreshStories();
              onClose();
            } catch {
              Toast.error(`Failed to ${action} user`);
            }
          },
        },
      ],
    );
  }, [isMuted, storyGroup?.user_id, storyGroup?.user?.username, dispatch, refreshStories, onClose]);

  /* FOLLOW */
  const handleFollowToggle = useCallback(async () => {
    const userId = storyGroup?.user_id;
    if (!userId || isOwnStory) return;
    const isFollowing = followStatus === 'following';
    const prevStatus = followStatus;
    setFollowStatus(isFollowing ? null : 'following');
    try {
      if (isFollowing) {
        await (dispatch as any)(unFollowUser({ follow_user_id: userId })).unwrap();
        Toast.success('User unfollowed successfully');
      } else {
        await (dispatch as any)(followUser({ follow_user_id: userId })).unwrap();
        Toast.success('User followed successfully');
      }
      refreshStories();
    } catch {
      setFollowStatus(prevStatus);
      Toast.error('Failed to update follow status');
    }
  }, [storyGroup?.user_id, followStatus, isOwnStory, dispatch, refreshStories]);

  /* BLOCK */
  const handleBlockToggle = useCallback(async () => {
    const userId = storyGroup?.user_id;
    if (!userId || isOwnStory) return;
    const actionText = isBlocked ? 'Unblock' : 'Block';
    const prevBlocked = isBlocked;
    Alert.alert(
      `${actionText} User`,
      `Are you sure you want to ${actionText.toLowerCase()} ${storyGroup?.user?.username || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            setIsBlocked(!isBlocked);
            try {
              if (isBlocked) {
                await (dispatch as any)(unBlockUser({ blocked_user_id: userId })).unwrap();
              } else {
                await (dispatch as any)(blockUser({ blocked_user_id: userId })).unwrap();
              }
              Toast.success(`User ${actionText.toLowerCase()}ed successfully`);
              refreshStories();
              if (!isBlocked) onClose();
            } catch {
              setIsBlocked(prevBlocked);
              Toast.error(`Failed to ${actionText.toLowerCase()} user`);
            }
          },
        },
      ],
    );
  }, [storyGroup?.user_id, storyGroup?.user?.username, isBlocked, isOwnStory, dispatch, refreshStories, onClose]);

  /* REPORT */
  const handleReport = useCallback(async () => {
    Alert.alert('Report Story', 'Are you sure you want to report this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(
              reportPost({ content_id: currentStory?._id, content_type: 'story' }),
            ).unwrap();
            refreshStories();
            Toast.success('Story reported successfully');
          } catch {
            Toast.error('Failed to report story');
          }
        },
      },
    ]);
  }, [currentStory?._id, dispatch]);

  /* FRIEND */
  const handleFriendAction = useCallback(async () => {
    const userId = storyGroup?.user_id;
    if (!userId || isOwnStory) return;
    try {
      if (friendsStatus) {
        Alert.alert('Unfriend', 'Are you sure you want to unfriend this user?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfriend',
            style: 'destructive',
            onPress: async () => {
              await (dispatch as any)(unFriendUser({ friend_user_id: userId })).unwrap();
              refreshStories();
            },
          },
        ]);
      } else if (friendRequestStatus === 'pending') {
        await (dispatch as any)(cancelFriendRequest({ target_user_id: userId })).unwrap();
        Toast.success('Friend request cancelled');
        refreshStories();
      } else {
        console.log("sent frnd", userId);

        await (dispatch as any)(sendStoryFriendRequest({ target_user_id: userId })).unwrap();
        Toast.success('Friend request sent');
        refreshStories();
      }
    } catch (err: any) {
      Toast.error('Failed to update friend status');
    }
  }, [storyGroup?.user_id, isOwnStory, friendsStatus, friendRequestStatus, dispatch, refreshStories]);

  const handleShare = useCallback(() => {
    Toast.info('Share feature will be available soon');
  }, []);

  /* MORE MENU */
  const handleMoreAction = useCallback(
    (action: string) => {
      setShowMoreMenu(false);
      const actions: Record<string, () => void> = {
        mute: handleMuteToggle,
        download: handleDownload,
        share: handleShare,
        save: handleSaveToggle, // ✅ Fixed: was handleDownload before
        addUser: handleFriendAction,
        unfollow: handleFollowToggle,
        block: handleBlockToggle,
        sendMessage: () => Toast.info('Direct messaging will be available soon'),
        report: handleReport,
        delete: handleDeleteStory,
      };
      actions[action]?.();
    },
    [
      handleMuteToggle, handleDownload, handleShare, handleSaveToggle,
      handleFriendAction, handleFollowToggle, handleBlockToggle,
      handleReport, handleDeleteStory,
    ],
  );

  /* RENDER VIEWER */
  const renderViewer = useCallback(({ item }: any) => {
    const user = item?.user;
    const reactions = item?.reactions || [];
    const displayReaction = reactions.length > 0 ? reactions[0] : item?.liked ? '❤️' : null;
    return (
      <View style={styles.viewerItemRow}>
        <View style={styles.avatarWrapper}>
          <AppAvatar
            imageUrl={user?.profile_photo_url}
            name={user?.name || user?.username}
            size={44}
            borderWidth={2}
          />
          {displayReaction && (
            <View style={styles.reactionBadge}>
              <Text style={styles.reactionBadgeText}>{displayReaction}</Text>
            </View>
          )}
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.viewerName}>{user?.name || user?.username || ''}</Text>
          {user?.username && (
            <Text style={styles.viewerUsername}>@{user.username}</Text>
          )}
        </View>
      </View>
    );
  }, []);

  // ✅ Guards - prevent render with bad data
  if (!visible) return null;
  if (!stories || stories.length === 0) return null;
  if (!currentStory) return null;

  console.log("currentStory", currentStory);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (showMoreMenu) { setShowMoreMenu(false); return; }
        if (showViewers) { setShowViewers(false); return; }
        onClose();
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>

          {/* ✅ MEDIA SECTION */}
          {isVideoStory && mediaUrl ? (
            // ✅ v7 - Video in isolated component with key for remount
            <StoryVideo
              key={videoKey}
              uri={mediaUrl}
              onEnd={() => { }}
              onError={() => console.log('Story video error')}
            />
          ) : !isVideoStory && mediaUrl ? (
            <Image
              source={{ uri: mediaUrl }}
              style={[StyleSheet.absoluteFillObject, { width, height }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
            ]}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Media unavailable</Text>
            </View>
          )}

          {/* Text overlay */}
          {!!currentStory?.text && (
            <View style={styles.centerTextContainer}>
              <Text style={styles.centerText}>{currentStory.text}</Text>
            </View>
          )}

          {/* Tags */}
          {Array.isArray(currentStory?.tags) && currentStory.tags.length > 0 &&
            currentStory.tags.map((tag: any, tagIndex: number) => (
              <View
                key={tagIndex}
                style={[
                  styles.textTagContainer,
                  {
                    top: tag.position?.top || '50%',
                    left: tag.position?.left || '10%',
                    right: tag.position?.right,
                    bottom: tag.position?.bottom,
                  },
                ]}
              >
                <Text style={styles.textTagText}>{getDisplayName(tag)}</Text>
              </View>
            ))}

          {/* Mentions */}
          {Array.isArray(currentStory?.mentions) && currentStory.mentions.length > 0 && (
            <View style={styles.mentionsContainer}>
              {currentStory.mentions.map((mention: any, mentionIndex: number) => (
                <TouchableOpacity key={mentionIndex} style={styles.mentionButton}>
                  <Text style={styles.mentionText}>@{getDisplayName(mention)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate('OtherUserProfileScreen', { userId: storyGroup?.user_id })}>
              <View style={styles.userRow}>
                <AppAvatar
                  imageUrl={storyGroup?.user?.profile_photo_url}
                  name={storyGroup?.user?.username || storyGroup?.user?.full_name}
                  size={36}
                  borderWidth={1}
                />
                <View>
                  <View style={[styles.userRow, { flex: 0 }]}>
                    <Text style={styles.username} numberOfLines={1}>
                      {storyGroup?.user?.username || storyGroup?.user?.full_name}
                    </Text>
                  </View>
                  <View style={styles.userRow}>
                    <Text style={styles.timeLocation}>
                      {getRelativeTime(currentStory?.createdAt)}
                    </Text>
                    {hasMultipleStories && (
                      <View style={styles.counter}>
                        <Text style={styles.counterText}>
                          {index + 1}/{stories.length}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => setShowMoreMenu(!showMoreMenu)}
                style={styles.iconBg}
              >
                <Image
                  source={Icons.more}
                  style={[styles.icon, { transform: [{ rotate: '90deg' }] }]}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBg}>
                <Image source={Icons.cross} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Arrows */}
          {hasMultipleStories && (
            <>
              <TouchableOpacity style={styles.left} onPress={goPrev} activeOpacity={0.8}>
                <Image source={Icons.backword} style={styles.iconSize} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.right} onPress={goNext} activeOpacity={0.8}>
                <Image source={Icons.forword} style={styles.iconSize} />
              </TouchableOpacity>
            </>
          )}

          {/* Bottom Bar */}
          {isOwnStory ? (
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.viewersButton}
                onPress={() => setShowViewers(!showViewers)}
              >
                <Image source={Icons.fillEye} style={styles.eyeIcon} />
                <Text style={styles.viewersText}>{viewers?.length || 0}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bottomBar}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Send Message..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity
                  style={[styles.likeButton, isLiked && styles.likeButtonActive]}
                  onPress={handleLikeToggle}
                  disabled={isProcessing}
                >
                  <Image
                    source={isLiked ? Icons.fillHeart : Icons.like}
                    style={[styles.likeIcon, isLiked && styles.likeIconActive]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reactionButton,
                    currentStory?.my_reaction === '😂' && { backgroundColor: '#333' }
                  ]}
                  onPress={() => handleReaction('😂')}
                >
                  <Text style={styles.reactionEmoji}>😂</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reactionButton,
                    currentStory?.my_reaction === '👏' && { backgroundColor: '#333' }
                  ]}
                  onPress={() => handleReaction('👏')}
                >
                  <Text style={styles.reactionEmoji}>👏</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Viewers Sheet */}
          {isOwnStory && showViewers && (
            <View style={styles.viewersOverlay}>
              <TouchableOpacity
                style={styles.viewersOverlayBg}
                activeOpacity={1}
                onPress={() => setShowViewers(false)}
              />
              <View style={styles.viewersModal}>
                <View style={styles.viewersHeader}>
                  <Text style={styles.viewersTitle}>
                    Viewers ({viewers?.length || 0})
                  </Text>
                  <TouchableOpacity onPress={() => setShowViewers(false)}>
                    <Image source={Icons.cross} style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>
                {loadingViewers ? (
                  <ActivityIndicator color={Colors.primary} style={styles.loader} />
                ) : (
                  <FlatList
                    data={viewers || []}
                    renderItem={renderViewer}
                    keyExtractor={item =>
                      item?.user_id || item?._id || Math.random().toString()
                    }
                    contentContainerStyle={styles.viewersList}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No views yet</Text>
                    }
                  />
                )}
              </View>
            </View>
          )}

          {/* More Menu */}
          {showMoreMenu && (
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setShowMoreMenu(false)}
            >
              <View style={styles.moreMenu}>
                {isOwnStory ? (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('download')}
                    >
                      <Image source={Icons.download} style={styles.menuIcon} />
                      <Text style={styles.menuText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('share')}
                    >
                      <Image source={Icons.postShare} style={styles.menuIcon} />
                      <Text style={styles.menuText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => handleMoreAction('delete')}
                    >
                      <Image
                        source={Icons.trashIcon}
                        style={[styles.menuIcon, styles.menuIconDanger]}
                      />
                      <Text style={styles.menuTextDanger}>Delete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('mute')}
                    >
                      <Image source={Icons.mute} style={styles.menuIcon} />
                      <Text style={styles.menuText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('download')}
                    >
                      <Image source={Icons.download} style={styles.menuIcon} />
                      <Text style={styles.menuText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('share')}
                    >
                      <Image source={Icons.postShare} style={styles.menuIcon} />
                      <Text style={styles.menuText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('save')}
                    >
                      <Image source={Icons.save} style={styles.menuIcon} />
                      <Text style={styles.menuText}>{isSaved ? 'Unsave' : 'Save'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('addUser')}
                    >
                      <Image
                        source={friendsStatus ? Icons.unfriend : Icons.addUser}
                        style={styles.menuIcon}
                      />
                      <Text style={styles.menuText}>
                        {friendsStatus
                          ? 'Unfriend User'
                          : friendRequestStatus === 'pending'
                            ? 'Cancel Request'
                            : 'Add Friend'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('unfollow')}
                    >
                      <Image source={Icons.notification} style={styles.menuIcon} />
                      <Text style={styles.menuText}>
                        {followStatus === 'following' ? 'Unfollow User' : 'Follow User'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('block')}
                    >
                      <Image source={Icons.blockUser} style={styles.menuIcon} />
                      <Text style={styles.menuText}>
                        {isBlocked ? 'Unblock User' : 'Block User'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMoreAction('sendMessage')}
                    >
                      <Image source={Icons.message} style={styles.menuIcon} />
                      <Text style={styles.menuText}>Send Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => handleMoreAction('report')}
                    >
                      <Image
                        source={Icons.report}
                        style={[styles.menuIcon, styles.menuIconDanger]}
                      />
                      <Text style={styles.menuTextDanger}>Report</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContainer}>
            <Text style={styles.customModalTitle}>Delete Story</Text>
            <Text style={styles.customModalBody}>
              Are you sure you want to delete this story?
            </Text>
            <View style={styles.customModalButtons}>
              <TouchableOpacity
                style={[styles.customModalButton, styles.customModalCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.customModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customModalButton, styles.customModalDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.customModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

export default StoryViewerModal;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'black' },
  container: { flex: 1, backgroundColor: 'black' },
  viewerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loaderCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarWrapper: { position: 'relative' },
  reactionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    elevation: 2,
  },
  reactionBadgeText: { fontSize: 12 },
  viewerName: { fontSize: 15, fontWeight: '600', color: '#000' },
  viewerUsername: { fontSize: 13, color: '#777', marginTop: 2 },
  topBar: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flex: 1,
  },
  username: { ...Typography.black16Bold, color: '#fff' },
  timeLocation: { ...Typography.black11Bold, color: Colors.primary, marginTop: 2 },
  followHeaderButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  followHeaderText: { ...Typography.black12Bold, color: '#fff' },
  counter: {
    backgroundColor: Colors.shadowTxt,
    paddingVertical: 4,
    borderRadius: 13,
    marginHorizontal: 12,
    paddingHorizontal: 12,
  },
  counterText: { ...Typography.black12Regular, color: '#fff' },
  actions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  icon: { width: 15, height: 15, tintColor: '#fff' },
  left: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 8,
  },
  iconSize: { width: 40, height: 40, objectFit: 'contain' },
  right: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  viewersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 26,
    alignSelf: 'flex-start',
  },
  eyeIcon: { width: 20, height: 20, tintColor: '#fff' },
  viewersText: { ...Typography.black14Medium, color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  messageInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  likeButtonActive: { backgroundColor: '#FFE5E5' },
  likeIcon: { width: 24, height: 24, objectFit: 'contain', tintColor: '#666' },
  likeIconActive: { tintColor: Colors.error },
  likeCount: {
    position: 'absolute',
    bottom: -8,
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  likeCountActive: { color: Colors.error },
  reactionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reactionEmoji: { fontSize: 24 },
  viewersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    justifyContent: 'flex-end',
  },
  viewersOverlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  viewersModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
    paddingBottom: 20,
    zIndex: 99999,
  },
  viewersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewersTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  iconBg: {
    backgroundColor: Colors.iconBg,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  closeIcon: { width: 20, height: 20, tintColor: '#000' },
  viewersList: { paddingHorizontal: 20, paddingTop: 12 },
  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  fallbackAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fallbackText: { ...Typography.black16Bold, color: Colors.primary },
  loader: { marginTop: 20 },
  watchAgainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  watchAgainIcon: { width: 22, height: 22, resizeMode: 'contain' },
  watchAgainText: { ...Typography.black14Bold, color: 'white' },
  emptyText: {
    ...Typography.black13Regular,
    textAlign: 'center',
    color: Colors.secondaryText,
    marginTop: 30,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  moreMenu: {
    backgroundColor: '#FFF6F2',
    borderRadius: 16,
    width: width * 0.65,
    paddingVertical: 8,
    position: 'absolute',
    top: 100,
    right: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuIcon: { width: 22, height: 22, objectFit: 'contain', tintColor: Colors.primary },
  menuText: { ...Typography.black14Medium, color: Colors.secondaryText },
  menuItemDanger: { borderTopWidth: 1, borderTopColor: '#FFE5E5' },
  menuIconDanger: { tintColor: '#FF4444' },
  menuTextDanger: { ...Typography.black14Medium, color: '#FF4444' },
  centerTextContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    left: 20,
    zIndex: 5,
    alignItems: 'flex-end',
  },
  centerText: {
    ...Typography.black12Regular,
    color: '#fff',
    backgroundColor: Colors.iconBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: width * 0.85,
    lineHeight: 22,
    textAlign: 'left',
  },
  textTagContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: width * 0.8,
    zIndex: 4,
  },
  textTagText: {
    ...Typography.black14Regular,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  mentionsContainer: {
    position: 'absolute',
    bottom: 190,
    right: 20,
    left: 20,
    backgroundColor: '#FFFFFF4D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 6,
    alignSelf: 'flex-end',
    maxWidth: width * 0.7,
  },
  mentionButton: { marginBottom: 4 },
  mentionText: { ...Typography.black12Regular, color: '#fff', textAlign: 'right' },
  customModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  customModalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: Spacing.modalBorderRadius,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customModalTitle: { ...Typography.black18Bold, marginBottom: 8, textAlign: 'center' },
  customModalBody: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  customModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  customModalButton: {
    flex: 1,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customModalCancel: { borderColor: Colors.primary, borderWidth: 1 },
  customModalDelete: { backgroundColor: Colors.primary },
  customModalCancelText: { ...Typography.black14Bold, color: Colors.primary },
  customModalDeleteText: { ...Typography.black14Bold, color: '#fff' },
  viewerLikeIcon: { width: 16, height: 16, tintColor: Colors.error, marginLeft: 10 },
});