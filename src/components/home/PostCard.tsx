import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RenderHTML from 'react-native-render-html';

import { Colors } from '../../theme/colors';
import { Icons } from '../../assets/icons';
import GradientAvatar from '../GradientAvatar';
import { getTimeAgo, REACTED_EMOJIS, downloadFile } from '../../utils/helper';
import {
  addLike,
  unLike,
  addReaction,
  fetchPost,
} from '../../redux/slices/postSlice';
import CommentSection from './CommentSection';
import { useNavigation } from '@react-navigation/native';
import SharePostModal from './SharePostModal';
import { Spacing, Typography } from '../../theme/typography';
import LikeListModal from './LikeListModal';
import { Images } from '../../assets/images';
import { CommonModal } from '../common';
import { RootState } from '../../redux/store';
import { usePostMenuOptions } from '../../hooks/usePostMenuOptions';
import {
  blockUser,
  followUser,
  notInterested,
  reportPost,
  savePost,
  unFollowUser,
  unFriendUser,
  unSavePost,
} from '../../redux/slices/userActionSlice';
import Toast from 'react-native-toast-message';
import MediaGrid from './MediaGrid';
import WhySeeingPostModal from '../WhySeeingPostModal';
import { sendFriendRequest } from '../../redux/slices/friendSlice';

const PostCard = ({
  post,
  onUserBlocked,
  onDeletePost,
  onUnsaveSuccess,
  paused = true,
}: any) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userProfile } = useSelector((state: any) => state.profile);
  const { postType } = useSelector((s: RootState) => s.post);
  const isOwnPost = userProfile?.user_id == post?.user_id;
  const userStatus = post?.user;
  const isBlocked = userStatus?.is_status === 'blocked';
  const isFriend = userStatus?.friends_status === true;
  const isFollowing = userStatus?.follow_status === 'following';
  const isSaved = post?.saved || false;

  const [state, setState] = useState({
    showComments: false,
    showMenu: false,
    showReactions: false,
    showShareModal: false,
    showLikes: false,
    askModal: false,
    blockConfirmModal: false,
    showWhyModal: false,
  });

  const [commentCount, setCommentCount] = useState(post?.comments_count || 0);
  const [followingState, setFollowingState] = useState(isFollowing);
  const [friendState, setFriendState] = useState(isFriend);
  const [savedState, setSavedState] = useState(isSaved);
  const [blockState, setBlockState] = useState(isBlocked);
  const [reportLoading, setReportLoading] = useState(false);
  const lastTap = useRef<number>(0);
  const [likedState, setLikedState] = useState(post?.liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);

  const pendingOperation = useRef<'like' | 'unlike' | null>(null);
  const dynamicMenuOptions = usePostMenuOptions({
    isOwnPost,
    savedState,
    friendState,
    followingState,
    blockState,
  });

  useEffect(() => {
    setLikedState(post?.liked || false);
    setLikesCount(post?.likes_count || 0);
  }, [post?.liked, post?.likes_count]);

  useEffect(() => {
    setCommentCount(post?.comments_count || 0);
  }, [post?.comments_count]);

  const formattedLocalities = useMemo(() => {
    if (!Array.isArray(post?.localities_detail)) return '';
    const names = post.localities_detail
      .map((item: any) => item.locality_name || '')
      .join(', ');
    return names.length > 28 ? names.slice(0, 28) + '...' : names;
  }, [post?.localities_detail]);

  useEffect(() => {
    setFollowingState(isFollowing);
    setFriendState(isFriend);
    setSavedState(isSaved);
    setBlockState(isBlocked);
  }, [isFollowing, isFriend, isSaved, isBlocked]);

  const updateState = useCallback((updates: any) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleLikeToggle = useCallback(async () => {
    if (pendingOperation.current) return;

    const payload = {
      target_type: 'post',
      target_id: post._id,
    };

    const prevLiked = likedState;
    const prevCount = likesCount;

    try {
      if (likedState) {
        pendingOperation.current = 'unlike';

        setLikedState(false);
        setLikesCount(p => Math.max(0, p - 1));

        await dispatch(unLike(payload)).unwrap();
      } else {
        pendingOperation.current = 'like';

        setLikedState(true);
        setLikesCount(p => p + 1);

        await dispatch(addLike(payload)).unwrap();
      }
    } catch {
      setLikedState(prevLiked);
      setLikesCount(prevCount);
    } finally {
      pendingOperation.current = null;
    }
  }, [dispatch, likedState, likesCount, post._id]);

  const handleCommentAdded = useCallback(() => {
    setCommentCount(prev => prev + 1);
  }, []);

  const navigateToDetails = useCallback(() => {
    navigation.navigate('PostDetails', { postId: post._id });
  }, [navigation, post._id]);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      updateState({ showReactions: false });
      dispatch(
        addReaction({ target_type: 'post', target_id: post._id, emoji }),
      );
      setTimeout(() => {
        dispatch(fetchPost({ page: 1, limit: 20 }) as any);
      }, 500);
    },
    [dispatch, post._id, updateState],
  );

  const refreshPost = useCallback(async () => {
    await dispatch(fetchPost({ page: 1, limit: 20 }) as any);
  }, [dispatch]);

  const handleFollowToggle = useCallback(() => {
    const payload = { follow_user_id: post?.user_id };
    dispatch(followingState ? unFollowUser(payload) : followUser(payload));
    setFollowingState(!followingState);
  }, [dispatch, post?.user_id, followingState]);

  const handleFriendToggle = useCallback(() => {
    const payload = { friend_user_id: post?.user_id };
    dispatch(friendState ? unFriendUser(payload) : sendFriendRequest({ target_user_id: post?.user_id }));
    setFriendState(!friendState);
  }, [dispatch, post?.user_id, friendState]);


  const handleSaveToggle = useCallback(() => {
    if (!post?._id) return;

    const payload = { post_id: post._id };

    if (savedState) {
      dispatch(unSavePost(payload));
    } else {
      dispatch(savePost(payload));
    }
    setSavedState(prev => !prev);
    refreshPost();
    if (onUnsaveSuccess) {
      onUnsaveSuccess?.();
    }
  }, [dispatch, post?._id, savedState, refreshPost]);

  const handleReportPost = useCallback(async () => {
    try {
      setReportLoading(true);
      await dispatch(
        reportPost({ content_id: post?._id, content_type: 'post' }),
      ).unwrap();
      refreshPost();
      updateState({ showMenu: false, askModal: false });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to report');
    } finally {
      setReportLoading(false);
    }
  }, [dispatch, post?._id, refreshPost, updateState]);

  const handleBlockUser = useCallback(async () => {
    try {
      await dispatch(blockUser({ blocked_user_id: post?.user_id })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'User blocked successfully',
      });

      updateState({ blockConfirmModal: false });
      onUserBlocked?.();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Failed to block user',
      });
    }
  }, [dispatch, post?.user_id, updateState, onUserBlocked]);

  const handleMenuAction = useCallback(
    (label: string) => {
      switch (label) {
        case 'Delete Post':
          if (onDeletePost) {
            onDeletePost(post?._id);
          }
          updateState({ showMenu: false });
          return;
        case 'Search':
          navigation.navigate('SearchUserScreen');
          updateState({ showMenu: false });
          return;
        case 'Edit Post':
          navigation.navigate('AddPost' as any, {
            postId: post?._id,
            post: post,
          });
          updateState({ showMenu: false });
          return;
        case 'Save':
        case 'Unsave Post':
          handleSaveToggle();
          break;
        case 'Follow User':
        case 'Unfollow User':
          handleFollowToggle();
          break;
        case 'Add User':
        case 'Unfriend User':
          handleFriendToggle();
          break
        case 'Block User':
          updateState({ blockConfirmModal: true, showMenu: false });
          return;
        case 'Report':
          updateState({ askModal: true, showMenu: false });
          return;
        case 'Report':
          updateState({ askModal: true, showMenu: false });
          return;
        case 'Not Interested':
          dispatch(
            notInterested({ content_id: post?._id, content_type: 'post' }),
          );
          refreshPost();
          break;
        case 'Why seeing this Post?':
          updateState({ showWhyModal: true, showMenu: false });
          return;

        case 'Download':
          if (post?.media?.length > 0) {
            const firstMedia = post.media[0];
            if (firstMedia?.url) {
              const type = firstMedia.type === 'video' ? 'video' : 'photo';
              downloadFile(firstMedia.url, type);
            }
          }
          break;
      }
      updateState({ showMenu: false });
    },
    [
      handleSaveToggle,
      handleFollowToggle,
      handleFriendToggle,
      onDeletePost,
      dispatch,
      post?._id,
      updateState,
      onUserBlocked,
      navigation,
      post?.media,
      refreshPost,
    ],
  );

  const userName = post?.user?.name || post?.user?.full_name || '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => {
            if (isOwnPost) {
              navigation.navigate('ProfileScreen');
            } else {
              (navigation as any).navigate('OtherUserProfileScreen', {
                userId: post?.user_id,
              });
            }
          }}
        >
          {post?.user?.profile_photo_url ? (
            <GradientAvatar
              source={{ uri: post.user.profile_photo_url }}
              size={30}
              borderWidth={1}
            />
          ) : userName ? (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.fallbackText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.fallbackAvatar,
                {
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Image
                source={Icons.placeholderIcon}
                style={{ height: 18, width: 18, objectFit: 'contain' }}
                tintColor={Colors.primary}
              />
            </View>
          )}
          <View>
            <Text style={Typography.black13Bold}>{userName}</Text>
            <View style={styles.metaRow}>
              <Text
                style={[Typography.black12Medium, { color: Colors.primary }]}
              >
                {getTimeAgo(post?.createdAt)}
              </Text>
              {!!formattedLocalities && (
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
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.metaRow}>
          {!isOwnPost && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              style={[
                styles.followButton,
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

          <TouchableOpacity
            onPress={() => updateState({ showMenu: !state.showMenu })}
          >
            <Image source={Icons.more} style={styles.moreIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu */}
      {state.showMenu && (
        <>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => updateState({ showMenu: false })}
          />
          <View style={styles.menuContainer}>
            {dynamicMenuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  // option.label === 'Not Interested' && styles.menuItemHighlight,
                ]}
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

      <View>
        <TouchableOpacity activeOpacity={1} onPress={navigateToDetails}>
          {!!post.text &&
            (post.text.includes('<') ? (
              <View style={styles.contentPadding}>
                <RenderHTML
                  source={{ html: post.text }}
                  baseStyle={{ fontSize: 12, marginBottom: 6 }}
                />
              </View>
            ) : (
              <Text
                style={[
                  Typography.black12Regular,
                  styles.contentPadding,
                  { marginBottom: 6 },
                ]}
              >
                {post.text}
              </Text>
            ))}
          {!!post.hashtags?.length && (
            <View style={[styles.contentPadding, { marginBottom: 6, flexDirection: 'row', flexWrap: 'wrap' }]}>
              {post.hashtags.map((tag: string, index: number) => (
                <View key={index} style={styles.tagContainer}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {!!post.link && (
            <Text
              onPress={() => Linking.openURL(post.link)}
              style={[
                Typography.black12Regular,
                styles.contentPadding,
                {
                  marginBottom: 6,
                  textDecorationLine: 'underline',
                  color: 'blue',
                },
              ]}
            >
              {post.link}
            </Text>
          )}
        </TouchableOpacity>

        {post?.media?.length > 0 && (
          <MediaGrid media={post.media} onImagePress={navigateToDetails} paused={paused} />
        )}
      </View>
      {state.showReactions && (
        <>
          <TouchableOpacity
            style={styles.reactionOverlay}
            activeOpacity={1}
            onPress={() => updateState({ showReactions: false })}
          />
          <View style={styles.reactionBar}>
            {REACTED_EMOJIS.map(e => (
              <TouchableOpacity
                key={e.symbol}
                onPress={() => handleReactionSelect(e.symbol)}
              >
                <Text style={styles.reactionEmoji}>{e.symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text
        style={[
          Typography.black12Medium,
          styles.contentPadding,
          { marginVertical: 12, color: Colors.secondaryText },
        ]}
        onPress={navigateToDetails}
      >
        {post?.views_count} Views | {post?.report_count} Report
      </Text>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <TouchableOpacity
              onPress={handleLikeToggle}
              onLongPress={() => updateState({ showReactions: true })}
              activeOpacity={0.7}
              disabled={false}
            >
              <Image
                source={likedState ? Icons.fillHeart : Icons.like}
                tintColor={likedState ? Colors.error : Colors.primaryText}
                style={styles.actionIcon}
              />
            </TouchableOpacity>

            <Text
              style={[
                Typography.black13Medium,
                { color: Colors.secondaryTextDark },
              ]}
              onPress={() => updateState({ showLikes: true })}
            >
              {likesCount}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateState({ showComments: true })}
          >
            <Image
              source={postType === 'QA' ? Icons.edit : Icons.comment}
              style={styles.actionIcon}
            />
            <Text
              style={[
                Typography.black13Medium,
                { color: Colors.secondaryTextDark },
              ]}
            >
              {commentCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateState({ showShareModal: true })}
          >
            <Image source={Icons.postShare} style={styles.actionIcon} />
            <Text
              style={[
                Typography.black13Medium,
                { color: Colors.secondaryTextDark },
              ]}
            >
              {post?.shares_count || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {post?.emojis_count && Object.keys(post.emojis_count).length > 0 && (
          <TouchableOpacity
            style={styles.emojiSummaryRow}
            onPress={() => updateState({ showLikes: true })}
          >
            <View style={styles.emojiContainer}>
              {Object.entries(post.emojis_count)
                .slice(0, 3)
                .map(([emoji, count]) => (
                  <Text key={emoji} style={styles.emoji}>
                    {emoji}
                  </Text>
                ))}
            </View>
            <Text
              style={[
                Typography.black12Medium,
                { color: Colors.secondaryTextDark },
              ]}
            >
              {Object.values(post.emojis_count).reduce(
                (sum: number, count: any) => sum + Number(count),
                0,
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {state.showWhyModal && (
        <WhySeeingPostModal
          image={post?.user?.profile_photo_url}
          visible={state.showWhyModal}
          onClose={() => updateState({ showWhyModal: false })}
        />
      )}
      {/* Modals */}
      {state.showComments && (
        <CommentSection
          visible={state.showComments}
          postId={post._id}
          onClose={() => updateState({ showComments: false })}
          onCommentAdded={handleCommentAdded}
        />
      )}
      {state.showLikes && (
        <LikeListModal
          visible={state.showLikes}
          onClose={() => updateState({ showLikes: false })}
          targetId={post._id}
          targetType="post"
        />
      )}
      {state.askModal && (
        <CommonModal
          visible={state.askModal}
          onClose={handleReportPost}
          onConfirm={() => updateState({ askModal: false })}
          btnRow={true}
          image={Images.report}
          imgStyle={{
            height: 138,
            width: 140,
            objectFit: 'contain',
            marginBottom: 10,
            alignSelf: 'center',
          }}
          title="Are you sure want to report this post?"
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
      {state.blockConfirmModal && (
        <CommonModal
          visible={state.blockConfirmModal}
          onClose={handleBlockUser}
          onConfirm={() => updateState({ blockConfirmModal: false })}
          btnRow={true}
          image={Images.report}
          imgStyle={{
            height: 138,
            width: 140,
            objectFit: 'contain',
            marginBottom: 10,
            alignSelf: 'center',
          }}
          title="Are you sure you want to block this user?"
          btnRowTitle1="Confirm"
          btnRowTitle2="Cancel"
        />
      )}

      {state.showShareModal && (
        <SharePostModal
          visible={state.showShareModal}
          onClose={() => updateState({ showShareModal: false })}
        />
      )}
    </View>
  );
};

export default memo(PostCard);

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.screenHorizontalPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginHorizontal: Spacing.screenHorizontalPadding,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  fallbackText: {
    ...Typography.black16Bold,
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSeparator: {
    fontSize: 12,
    color: Colors.primaryExtraLight,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  moreIcon: {
    objectFit: 'contain',
    height: 14,
    width: 14,
    marginLeft: 6,
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
  tagContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemHighlight: {
    backgroundColor: Colors.primaryExtraLight,
  },
  menuIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  contentPadding: {
    paddingLeft: 16 + 36 + 2,
    paddingRight: 16 + 14 + 6,
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
    bottom: 45,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16 + 36 + 2,
    paddingRight: 16,
  },
  actions: { flexDirection: 'row', gap: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  emoji: {
    fontSize: 16,
  },
  emojiSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16 + 40 + 4,
    marginBottom: 8,
    paddingVertical: 4,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
});
