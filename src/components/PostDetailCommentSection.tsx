import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "../theme/colors";
import { Icons } from "../assets/icons";
import { RootState } from "../redux/store";
import { addComment, fetchComments, addLike, unLike, getPostDetails } from "../redux/slices/postSlice";
import { getTimeAgo } from "../utils/helper";
import { Spacing, Typography } from "../theme/typography";
import FastImage from "react-native-fast-image";

type Props = {
  postId: string;
  onCommentAdded?: () => void;
};

const PostDetailCommentSection: React.FC<Props> = ({
  postId,
  onCommentAdded,
}) => {
  const dispatch = useDispatch();
  const { comments, commentLoading, commentPage, hasMoreComments } = useSelector(
    (s: RootState) => s.post
  );
  const { userProfile } = useSelector((state: any) => state.profile);
  const { postType } = useSelector((s: RootState) => s.post);

  const scrollViewRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (postId) {
      loadComments(true);
    }
  }, [postId]);

  // Sync with Redux comments
  useEffect(() => {
    if (Array.isArray(comments) && comments.length > 0) {
      setLocalComments(prevLocal => {
        // Keep optimistic comments (temp IDs)
        const optimistic = prevLocal.filter(c =>
          c._id.toString().startsWith('temp_')
        );

        // Merge without duplicates
        const serverIds = new Set(comments.map(c => c._id));
        const merged = [
          ...optimistic.filter(c => !serverIds.has(c._id)),
          ...comments
        ];

        return merged;
      });
    } else if (comments.length === 0 && !commentLoading) {
      // Clear local if server returns empty
      setLocalComments([]);
    }
  }, [comments, commentLoading]);

  // Keyboard handling
  useEffect(() => {
    const keyboardShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );

    return () => keyboardShow.remove();
  }, []);

  const loadComments = async (reset = false) => {
    try {
      if (reset) {
        setLocalComments([]);
      }
      await dispatch(fetchComments({
        post_id: postId,
        page: reset ? 1 : commentPage + 1,
        limit: 50
      })).unwrap();
    } catch (error) {
      console.log("Error loading comments:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadComments(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!commentLoading && hasMoreComments) {
      loadComments(false);
    }
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || submitting) return;

    setSubmitting(true);

    const payload: any = {
      post_id: postId,
      text: trimmedText
    };

    if (parentId) {
      payload.parent_comment_id = parentId;
    }

    // Create temp comment
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempComment = {
      _id: tempId,
      text: trimmedText,
      createdAt: new Date().toISOString(),
      user_id: userProfile?.user_id,
      user: userProfile,
      profile_photo_url: userProfile?.profile_photo_url,
      username: userProfile?.username || userProfile?.name || "You",
      replies: [],
      liked: false,
      likes_count: 0,
      isOptimistic: true, // Flag for styling
    };

    const currentParentId = parentId;
    const currentReplyTo = replyTo;

    // Optimistic update
    setLocalComments(prev => {
      const updated = [...prev];

      if (currentParentId) {
        // Add reply
        const parentIndex = updated.findIndex(c => c._id === currentParentId);
        if (parentIndex !== -1) {
          updated[parentIndex] = {
            ...updated[parentIndex],
            replies: [...(updated[parentIndex].replies || []), tempComment],
          };
        } else {
          // Parent not found, add as top-level
          updated.unshift(tempComment);
        }
      } else {
        // Add new comment at top
        updated.unshift(tempComment);
      }

      return updated;
    });

    // Clear input immediately
    setText("");
    setReplyTo(null);
    setParentId(null);

    // Scroll to show new comment
    setTimeout(() => {
      if (!currentParentId) {
        scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    }, 100);

    // Notify parent
    onCommentAdded?.();

    try {
      const res = await dispatch(addComment(payload)).unwrap();
      const serverComment = res?.data?.comment;

      if (!serverComment) {
        throw new Error("No comment returned");
      }

      // Replace temp with server comment
      setLocalComments(prev => {
        const updated = [...prev];

        if (currentParentId) {
          // Replace temp reply
          const parentIndex = updated.findIndex(c => c._id === currentParentId);
          if (parentIndex !== -1) {
            updated[parentIndex] = {
              ...updated[parentIndex],
              replies: (updated[parentIndex].replies || []).map(r =>
                r._id === tempId ? { ...serverComment, isOptimistic: false } : r
              ),
            };
          }
        } else {
          // Replace temp comment
          const tempIndex = updated.findIndex(c => c._id === tempId);
          if (tempIndex !== -1) {
            updated[tempIndex] = { ...serverComment, isOptimistic: false };
          }
        }

        return updated;
      });

      // Background refresh
      setTimeout(() => {
        dispatch(getPostDetails(postId));
        dispatch(fetchComments({ post_id: postId, page: 1, limit: 50 }));
      }, 500);

    } catch (error) {
      console.log("Send comment failed:", error);

      // Remove failed comment
      setLocalComments(prev => {
        if (currentParentId) {
          return prev.map(c =>
            c._id === currentParentId
              ? {
                ...c,
                replies: (c.replies || []).filter(r => r._id !== tempId),
              }
              : c
          );
        }
        return prev.filter(c => c._id !== tempId);
      });

      // Restore input
      setText(trimmedText);
      setReplyTo(currentReplyTo);
      setParentId(currentParentId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = useCallback(async (
    item: any,
    isReply = false,
    parentCommentId?: string
  ) => {
    const target_type = isReply ? "reply" : "comment";
    const target_id = item._id;

    // Don't allow liking temp comments
    if (target_id.toString().startsWith('temp_')) {
      return;
    }

    // Find current state
    let currentItem = item;
    if (isReply && parentCommentId) {
      const parent = localComments.find(c => c._id === parentCommentId);
      currentItem = parent?.replies?.find((r: any) => r._id === target_id) || item;
    } else {
      currentItem = localComments.find(c => c._id === target_id) || item;
    }

    const willLike = !currentItem.liked;
    const prevLiked = currentItem.liked;
    const prevCount = currentItem.likes_count || 0;

    // Optimistic update
    setLocalComments(prev => {
      return prev.map(c => {
        if (!isReply) {
          if (c._id === target_id) {
            return {
              ...c,
              liked: willLike,
              likes_count: willLike ? prevCount + 1 : Math.max(0, prevCount - 1),
            };
          }
          return c;
        } else {
          if (c._id === parentCommentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r: any) =>
                r._id === target_id
                  ? {
                    ...r,
                    liked: willLike,
                    likes_count: willLike
                      ? (r.likes_count || 0) + 1
                      : Math.max(0, (r.likes_count || 0) - 1),
                  }
                  : r
              ),
            };
          }
          return c;
        }
      });
    });

    try {
      if (willLike) {
        await dispatch(addLike({ target_type, target_id })).unwrap();
      } else {
        await dispatch(unLike({ target_type, target_id })).unwrap();
      }

      // Background refresh
      setTimeout(() => {
        dispatch(fetchComments({ post_id: postId, page: 1, limit: 50 }));
      }, 300);

    } catch (error) {
      console.log("Like error:", error);

      // Rollback
      setLocalComments(prev => {
        return prev.map(c => {
          if (!isReply) {
            if (c._id === target_id) {
              return { ...c, liked: prevLiked, likes_count: prevCount };
            }
            return c;
          } else {
            if (c._id === parentCommentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r: any) =>
                  r._id === target_id
                    ? { ...r, liked: prevLiked, likes_count: prevCount }
                    : r
                ),
              };
            }
            return c;
          }
        });
      });
    }
  }, [localComments, dispatch, postId]);

  const handleReplyPress = (name: string, id: string) => {
    setReplyTo(name);
    setParentId(id);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setParentId(null);
  };

  const renderReply = useCallback((reply: any, parentCommentId: string) => {
    const isTemp = reply._id.toString().startsWith('temp_');

    return (
      <View key={reply._id} style={styles.replyRow}>

        <FastImage
          source={
            reply?.profile_photo_url
              ? {
                uri: reply?.profile_photo_url,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }
              : Icons.placeholder
          }
          resizeMode={FastImage.resizeMode.cover}
          style={[styles.replyAvatar, isTemp && styles.optimisticAvatar]}
        />
        <View style={styles.replyBlock}>
          <View style={styles.nameRow}>
            <Text style={[Typography.black13Bold, isTemp && styles.optimisticText]}>
              {reply?.username || "User"}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[Typography.black11Bold, { color: Colors.gray40 }]}>
              {getTimeAgo(reply.createdAt)}
            </Text>
            {isTemp && (
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <Text style={[Typography.black11Medium, { marginTop: 2 }, isTemp && styles.optimisticText]}>
            {reply.text}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => handleLikeToggle(reply, true, parentCommentId)}
              disabled={isTemp}
            >

              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>
                Like {reply.likes_count || 0}
              </Text>
            </TouchableOpacity>
            <Text style={styles.divider}>|</Text>
            <TouchableOpacity
              onPress={() => handleReplyPress(reply?.username || "User", parentCommentId)}
              disabled={isTemp}
            >
              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>
                Reply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleLikeToggle, handleReplyPress]);

  const renderItem = useCallback(({ item }: any) => {
    const checkUserid = item?.user_id === userProfile?.user_id;

    const isTemp = item._id.toString().startsWith('temp_');

    return (
      <View style={styles.commentRow}>
        <FastImage
          style={styles.avatar}
          source={
            checkUserid && userProfile?.profile_photo_url
              ? {
                uri: userProfile.profile_photo_url,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }
              : item?.profile_photo_url
                ? {
                  uri: item.profile_photo_url,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }
                : Icons.placeholder
          }
          resizeMode={FastImage.resizeMode.cover}
        />

        <View style={styles.commentBlock}>
          <View style={styles.nameRow}>
            <Text style={[Typography.black13Bold, isTemp && styles.optimisticText]}>
              {item.username || (checkUserid && userProfile?.username) || "User"}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[Typography.black11Bold, { color: Colors.gray40 }]}>
              {getTimeAgo(item.createdAt)}
            </Text>
            {isTemp && (
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <Text style={[Typography.black11Medium, { marginTop: 2 }, isTemp && styles.optimisticText]}>
            {item.text}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => handleLikeToggle(item, false)}
              disabled={isTemp}
            >

              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>
                Like  {item.likes_count || 0}
              </Text>
            </TouchableOpacity>
            <Text style={styles.divider}>|</Text>
            <TouchableOpacity
              onPress={() => handleReplyPress(item.username || "User", item._id)}
              disabled={isTemp}
            >
              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>
                Reply
              </Text>
            </TouchableOpacity>
          </View>

          {Array.isArray(item.replies) && item.replies.length > 0 && (
            <View style={styles.repliesWrap}>
              <View style={styles.connector} />
              <View style={styles.repliesCol}>
                {item.replies.map((r: any) => renderReply(r, item._id))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }, [userProfile, handleLikeToggle, handleReplyPress, renderReply]);

  const listFooter = commentLoading && !refreshing ? (
    <View style={{ paddingVertical: 18, alignItems: "center" }}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  ) : null;

  const listEmpty = !commentLoading && !refreshing ? (
    <View style={styles.emptyContainer}>
      <Image source={Icons.comment} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>
        {postType?.toLocaleUpperCase() === "QA" ? "No answers yet" : "No comments yet"}
      </Text>
      <Text style={styles.emptySubtext}>
        Be the first to comment!
      </Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollViewRef}
        data={localComments}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {replyTo && (
          <View style={styles.replyingToBar}>
            <Text style={styles.replyingText}>Replying to {replyTo}</Text>
            <TouchableOpacity onPress={cancelReply}>
              <Image source={Icons.cross} style={styles.replyingCloseIcon} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Image
            source={
              userProfile?.profile_photo_url
                ? { uri: userProfile.profile_photo_url }
                : Icons.placeholder
            }
            style={styles.inputAvatar}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[Typography.black12Medium, { margin: 0, padding: 0 }]}
              placeholder={replyTo ? `Reply to ${replyTo}...` : "Add a comment..."}
              placeholderTextColor="#A0A0A0"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || submitting}
              style={[
                styles.sendButton,
                (!text.trim() || submitting) && styles.sendDisabled
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image source={Icons.send} style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PostDetailCommentSection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border10,
  },
  optimisticAvatar: {
    opacity: 0.6,
  },
  commentBlock: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  dot: {
    fontSize: 12,
    color: "#565656",
  },
  optimisticText: {
    opacity: 0.6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  optimisticIcon: {
    opacity: 0.4,
  },
  divider: {
    fontSize: 12,
    color: Colors.gray40,
  },
  repliesWrap: {
    flexDirection: "row",
    marginTop: 12,
  },
  connector: {
    width: 20,
    marginLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#E8E8E8",
  },
  repliesCol: {
    flex: 1,
    paddingLeft: 8,
  },
  replyRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border10,
  },
  replyBlock: {
    flex: 1,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    tintColor: Colors.gray40,
    opacity: 0.4,
    marginBottom: 12,
  },
  emptyText: {
    ...Typography.black16Bold,
    color: Colors.secondaryText,
    marginBottom: 4,
  },
  emptySubtext: {
    ...Typography.black13Medium,
    color: Colors.gray40,
  },
  replyingToBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F7F7F7",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  replyingText: {
    ...Typography.black13Bold,
    color: Colors.primary,
  },
  replyingCloseIcon: {
    width: 16,
    height: 16,
    tintColor: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border10,
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.comentInput,
    borderRadius: Spacing.modalBorderRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    backgroundColor: "#CFCFCF",
  },
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: "#fff",
  },
  emojiOverlay: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  emoji: {
    fontSize: 28,
    marginHorizontal: 8,
  },
});