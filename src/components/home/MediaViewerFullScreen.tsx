import React, { useState, useRef, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import { useDispatch } from "react-redux";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { Typography } from "../../theme/typography";
import { REACTED_EMOJIS, openDocument } from "../../utils/helper";
import { addLike, unLike, addReaction } from "../../redux/slices/postSlice";
import CommentSection from "./CommentSection";
import SharePostModal from "./SharePostModal";
import LikeListModal from "./LikeListModal";
import { Images } from "../../assets/images";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ✅ Individual Media Item in Full Screen
const FullScreenMediaItem = memo(({
  item,
  index,
  postId,
  stats,
  onLike,
  onComment,
  onShare,
  onReaction,
  showReactions,
  onToggleReactions,
  onShowLikes
}: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<any>(null);

  const mediaUrl = item?.url;
  const thumbnailUrl = item?.thumbnail_url || mediaUrl;
  const mediaId = item?._id || item?.id || `media-${index}`;

  const renderMediaContent = () => {
    switch (item?.type) {
      case "image":
        return (
          <FastImage
            source={{ uri: mediaUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        );

      case "video":
        return (
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              style={styles.fullScreenVideo}
              poster={thumbnailUrl}
              resizeMode="contain"
              paused={!isPlaying}
              repeat={false}
              controls={true}
            />
          </View>
        );

      case "audio":
        return (
          <View style={styles.audioWrapper}>
            <Image source={Images.soundWave} style={styles.audioBackground} />
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              audioOnly={true}
              paused={!isPlaying}
              controls={false}
              style={{ width: 0, height: 0 }}
            />
            <TouchableOpacity
              style={styles.audioPlayButton}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Image
                source={isPlaying ? Icons.pause : Icons.play}
                style={styles.audioPlayIcon}
              />
            </TouchableOpacity>
          </View>
        );

      case "document":
        return (
          <View style={styles.documentWrapper}>
            <Image source={Icons.downloadPdf} style={styles.docIcon} />
            <TouchableOpacity onPress={() => openDocument(item?.url)}>
              <Text style={styles.docText}>Download Document</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        );
    }
  };

  // Calculate emoji summary
  const emojiData = useMemo(() => {
    const entries = Object.entries(stats.emojis_count || {});
    const sorted = entries.sort((a: any, b: any) => b[1] - a[1]);
    const total = entries.reduce((acc, [, c]: any) => acc + c, 0);
    return { entries: sorted, total };
  }, [stats.emojis_count]);

  const topTwoEmojis = emojiData.entries.slice(0, 2);

  return (
    <View style={styles.mediaItemContainer}>
      {/* Media Content */}
      <View style={styles.mediaContentWrapper}>
        {renderMediaContent()}
      </View>

      {/* Interaction Bar */}
      <View style={styles.interactionBar}>
        <View style={styles.actionRow}>
          {/* Like Button */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              onPress={() => onLike(mediaId)}
              onLongPress={() => onToggleReactions(mediaId)}
              activeOpacity={0.7}
              style={styles.actionBtn}
            >
              <Image
                source={stats.liked ? Icons.fillHeart : Icons.like}
                style={styles.actionIcon}
                tintColor={stats.liked ? Colors.error : '#fff'}
              />
              <Text style={[Typography.black14Medium, { color: Colors.secondaryTextDark }]}>
                {stats.likes_count || 0}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onComment(mediaId)}
          >
            <Image source={Icons.comment} style={styles.actionIcon} />
            <Text style={[Typography.black14Medium, { color: Colors.secondaryTextDark }]}>
              {stats.comments_count || 0}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onShare(mediaId)}
          >
            <Image source={Icons.postShare} style={styles.actionIcon} />
            <Text style={[Typography.black14Medium, { color: Colors.secondaryTextDark }]}>
              {stats.shares_count || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emoji Summary */}
        {emojiData.total > 0 && (
          <View style={styles.emojiSummaryRow}>
            <View style={{ flexDirection: 'row' }}>
              {topTwoEmojis.map(([emoji]: any) => (
                <Text key={emoji} style={styles.emojiIcon}>{emoji}</Text>
              ))}
            </View>
            <Text style={styles.emojiTotal}>{emojiData.total} reactions</Text>
          </View>
        )}
      </View>

      {/* Reaction Popup */}
      {showReactions === mediaId && (
        <>
          <TouchableOpacity
            style={styles.reactionOverlay}
            activeOpacity={1}
            onPress={() => onToggleReactions(null)}
          />
          <View style={styles.reactionBar}>
            {REACTED_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e.symbol}
                onPress={() => onReaction(mediaId, e.symbol)}
              >
                <Text style={styles.reactionEmoji}>{e.symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
});

// ✅ Main Full Screen Media Viewer
const MediaViewerFullScreen = ({
  visible,
  onClose,
  mediaList,
  initialIndex = 0,
  postId,
  postUser
}: any) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<any>(null);

  // Initialize media stats from mediaList
  const initializeMediaStats = () => {
    const stats: any = {};
    mediaList?.forEach((item: any, index: number) => {
      const mediaId = item?._id || item?.id || `media-${index}`;
      stats[mediaId] = {
        likes_count: item?.likes_count || 0,
        comments_count: item?.comments_count || 0,
        shares_count: item?.shares_count || 0,
        liked: item?.liked || false,
        emojis_count: item?.emojis_count || {}
      };
    });
    return stats;
  };

  const [mediaStats, setMediaStats] = useState(initializeMediaStats());
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // ✅ UPDATED: Simple tap = heart like/unlike
  const handleLike = useCallback((mediaId: string) => {
    const isLiked = mediaStats[mediaId]?.liked;
    const payload = {
      target_type: "media",
      target_id: postId,
      media_id: mediaId
    };

    if (isLiked) {
      // Unlike - remove heart
      setMediaStats(prev => ({
        ...prev,
        [mediaId]: {
          ...prev[mediaId],
          liked: false,
          likes_count: prev[mediaId].likes_count - 1
        }
      }));
      dispatch(unLike(payload));
    } else {
      // Like - add heart
      setMediaStats(prev => ({
        ...prev,
        [mediaId]: {
          ...prev[mediaId],
          liked: true,
          likes_count: prev[mediaId].likes_count + 1
        }
      }));
      dispatch(addLike(payload));
    }
  }, [dispatch, postId, mediaStats]);

  // Handle Comment
  const handleComment = useCallback((mediaId: string) => {
    setSelectedMediaId(mediaId);
    setShowComments(true);
  }, []);

  // Handle Share
  const handleShare = useCallback((mediaId: string) => {
    setSelectedMediaId(mediaId);
    setShowShare(true);
  }, []);

  // ✅ UPDATED: Handle reaction selection (separate from like count)
  const handleReaction = useCallback((mediaId: string, emoji: string) => {
    setShowReactions(null);
    
    const payload = { 
      target_type: 'media', 
      target_id: postId,
      media_id: mediaId, 
      emoji 
    };

    // Just dispatch the reaction - backend will handle emojis_count separately
    dispatch(addReaction(payload));
  }, [dispatch, postId]);

  // Handle Show Likes
  const handleShowLikes = useCallback((mediaId: string) => {
    setSelectedMediaId(mediaId);
    setShowLikes(true);
  }, []);

  // Handle Comment Added
  const handleCommentAdded = useCallback(() => {
    if (selectedMediaId) {
      setMediaStats(prev => ({
        ...prev,
        [selectedMediaId]: {
          ...prev[selectedMediaId],
          comments_count: prev[selectedMediaId].comments_count + 1
        }
      }));
    }
  }, [selectedMediaId]);

  // Scroll to initial index
  React.useEffect(() => {
    if (visible && scrollViewRef.current && initialIndex > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: initialIndex * SCREEN_HEIGHT,
          animated: false
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Image source={Icons.arrowLeft} style={styles.backIcon} tintColor="#fff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[Typography.black14Bold, { color: '#fff' }]}>
              {postUser?.name || "User"}
            </Text>
            <Text style={[Typography.black12Regular, { color: '#ddd' }]}>
              {mediaList?.length} {mediaList?.length === 1 ? 'media' : 'media items'}
            </Text>
          </View>
        </View>

        {/* Scrollable Media List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={SCREEN_HEIGHT - 100}
        >
          {mediaList?.map((item: any, index: number) => {
            const mediaId = item?._id || item?.id || `media-${index}`;
            return (
              <FullScreenMediaItem
                key={mediaId}
                item={item}
                index={index}
                postId={postId}
                stats={mediaStats[mediaId]}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onReaction={handleReaction}
                showReactions={showReactions}
                onToggleReactions={setShowReactions}
                onShowLikes={handleShowLikes}
              />
            );
          })}
        </ScrollView>

        {/* Modals */}
        {showComments && (
          <CommentSection
            visible={showComments}
            postId={postId}
            mediaId={selectedMediaId}
            onClose={() => {
              setShowComments(false);
              setSelectedMediaId(null);
            }}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {showShare && (
          <SharePostModal
            visible={showShare}
            onClose={() => {
              setShowShare(false);
              setSelectedMediaId(null);
            }}
            postId={postId}
            mediaId={selectedMediaId}
          />
        )}

        {showLikes && selectedMediaId && (
          <LikeListModal
            visible={showLikes}
            onClose={() => {
              setShowLikes(false);
              setSelectedMediaId(null);
            }}
            targetId={postId}
            targetType="media"
          />
        )}
      </View>
    </Modal>
  );
};

export default memo(MediaViewerFullScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    objectFit: "contain"
  },
  headerInfo: {
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  mediaItemContainer: {
    height: SCREEN_HEIGHT - 100,
    justifyContent: 'center',
  },
  mediaContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  audioWrapper: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  audioBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  audioPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  documentWrapper: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  docIcon: {
    width: 50,
    height: 50,
    tintColor: '#fff',
    marginBottom: 16,
  },
  docText: {
    ...Typography.black14Medium,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  interactionBar: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 24,
    height: 24,
    objectFit: "contain",
    tintColor: '#fff',
  },
  likeEmoji: {
    fontSize: 24,
  },
  emojiSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  emojiIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  emojiTotal: {
    ...Typography.black12Medium,
    color: '#ddd',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    bottom: 80,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    zIndex: 999,
  },
  reactionEmoji: {
    fontSize: 28,
    marginHorizontal: 8,
  },
});