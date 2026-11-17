import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
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
  Animated,
  Easing,
  Pressable
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { RootState } from "../../redux/store";
import { addComment, fetchComments, addLike, unLike, fetchPost } from "../../redux/slices/postSlice";
import { getTimeAgo, REACTED_EMOJIS } from "../../utils/helper";
import { Spacing, Typography } from "../../theme/typography";
import FastImage from "react-native-fast-image";

type Props = {
  visible?: boolean;
  onClose?: () => void;
  postId: string;
  heightRatio?: number;
  onCommentAdded?: () => void;
  isModal?: boolean;
  mediaId?: string;
};

const CommentSheetModal: React.FC<Props> = ({
  visible,
  onClose,
  postId,
  onCommentAdded,
  heightRatio = 0.72,
  isModal = true,
  mediaId
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
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // localComments holds the UI-state (optimistic + server comments)
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [_, forceUpdate] = useState(0);

  const translateY = useRef(new Animated.Value(600)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // 1) fetch comments when modal opens
  useEffect(() => {
    if (postId) {
      setLocalComments([]);
      dispatch(fetchComments({ post_id: postId, page: 1, limit: 100 }) as any);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(600);
      backdrop.setValue(0);
    }
  }, [postId]);

  // 2) keep localComments initialised from server comments (only when localComments empty)
  useEffect(() => {
    // If localComments empty and server comments exist, populate it.
    if ((!localComments || localComments.length === 0) && Array.isArray(comments) && comments.length > 0) {
      setLocalComments(comments);
    }
  }, [comments]);

  // keep time labels refreshing
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(v => v + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && onClose());
  };

  const handleLoadMore = () => {
    if (!commentLoading && hasMoreComments) {
      dispatch(
        fetchComments({ post_id: postId, page: commentPage + 1, limit: 10 }) as any
      );
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSubmitting(true);

    const payload: any = { post_id: postId, text: text.trim() };
    if (parentId) payload.parent_comment_id = parentId;
    if (mediaId) payload.media_id = mediaId;

    // temporary optimistic comment
    const tempComment = {
      _id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      user: userProfile,
      profile_photo_url: userProfile?.profile_photo_url,
      username: userProfile?.name || "You",
      replies: [],
      liked: false,
      likes_count: 0,
    };

    const tempId = tempComment._id;

    setLocalComments(prev => {
      let updated = Array.isArray(prev) ? [...prev] : [];

      if (parentId) {
        // reply optimistic: try to find parent in local or server list
        const parentIndex = updated.findIndex(c => c._id === parentId);
        if (parentIndex !== -1) {
          updated[parentIndex] = {
            ...updated[parentIndex],
            replies: [...(updated[parentIndex].replies || []), tempComment],
          };
        } else {
          // fallback: check server comments for parent
          const serverParent = comments.find(c => c._id === parentId);
          if (serverParent) {
            updated.push({
              ...serverParent,
              replies: [...(serverParent.replies || []), tempComment],
            });
          } else {
            // parent not found - append as top-level (rare)
            updated = [tempComment, ...updated];
          }
        }
      } else {
        updated = [tempComment, ...updated];
        onCommentAdded && onCommentAdded();
      }

      return updated;
    });

    try {
      const res = await dispatch(addComment(payload)).unwrap();
      const serverComment = res?.data?.comment;
      const parent = res?.data?.parent_comment_id;

      if (!serverComment) throw new Error("No comment returned from server");

      setLocalComments(prev => {
        let updated = Array.isArray(prev) ? [...prev] : [];

        if (parent) {
          updated = updated.map(c =>
            c._id === parent
              ? {
                ...c,
                replies: [
                  ...(c.replies || []).filter(r => r._id !== tempId),
                  serverComment,
                ],
              }
              : c
          );
          if (isModal === true) {
            dispatch(fetchPost({ page: 1, limit: 50 }))
          }

          dispatch(
            fetchComments({ post_id: postId, page: 1, limit: 50 }) as any
          );
        } else {
          // remove temp by tempId and add server comment at top
          updated = updated.filter(c => c._id !== tempId);
          updated = [serverComment, ...updated];
        }

        return updated;
      });
    } catch (e) {
      console.log("Comment send failed:", e);
      // Optionally remove temp comment or mark as failed
    } finally {
      setText("");
      setReplyTo(null);
      setParentId(null);
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async (item: any, isReply = false, parentId?: string) => {

    const target_type = isReply ? "reply" : "comment";
    const target_id = item._id;

    // Choose base array to read from: prefer localComments (optimistic), fallback to server comments
    const baseArray = (Array.isArray(localComments) && localComments.length > 0) ? localComments : comments || [];

    // Find the current item in baseArray
    let foundItem: any = null;
    if (isReply && parentId) {
      const parent = baseArray.find((c: any) => c._id === parentId);
      foundItem = parent?.replies?.find((r: any) => r._id === target_id) ?? null;
    } else {
      foundItem = baseArray.find((c: any) => c._id === target_id) ?? null;
    }

    // If not found in baseArray, fallback to the passed `item`
    if (!foundItem) {
      foundItem = item;
    }

    // Decide intent: willLike = the action we want to perform
    const willLike = !foundItem?.liked;

    // OPTIMISTIC UPDATE: ensure localComments contains a baseline (if empty, seed from server comments)
    setLocalComments(prev => {
      const baseline = (Array.isArray(prev) && prev.length > 0) ? [...prev] : (Array.isArray(comments) ? [...comments] : []);

      // If baseline empty, push the clicked item so we can update it (edge-case)
      if (baseline.length === 0 && item) {
        baseline.push(item);
      }

      const updated = baseline.map((c: any) => {
        if (!isReply || !parentId) {
          // comment like/unlike
          if (c._id === target_id) {
            return {
              ...c,
              liked: willLike,
              likes_count: willLike ? (Number(c.likes_count || 0) + 1) : Math.max(0, Number(c.likes_count || 0) - 1),
            };
          }
          return c;
        } else {
          // reply like/unlike inside parentId
          if (c._id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r: any) =>
                r._id === target_id
                  ? {
                    ...r,
                    liked: willLike,
                    likes_count: willLike ? (Number(r.likes_count || 0) + 1) : Math.max(0, Number(r.likes_count || 0) - 1),
                  }
                  : r
              ),
            };
          }
          return c;
        }
      });

      return updated;
    });

    // API call using willLike (guaranteed correct)
    try {
      if (willLike) {
        await dispatch(addLike({ target_type, target_id }) as any);
      } else {
        await dispatch(unLike({ target_type, target_id }) as any);
      }
    } catch (err) {


      // If API fails, rollback optimistic change by re-toggling
      setLocalComments(prev => {
        return prev.map((c: any) => {
          if (!isReply || !parentId) {
            if (c._id === target_id) {
              return {
                ...c,
                liked: !willLike,
                likes_count: !willLike ? (Number(c.likes_count || 0) + 1) : Math.max(0, Number(c.likes_count || 0) - 1),
              };
            }
            return c;
          } else {
            if (c._id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r: any) =>
                  r._id === target_id
                    ? {
                      ...r,
                      liked: !willLike,
                      likes_count: !willLike ? (Number(r.likes_count || 0) + 1) : Math.max(0, Number(r.likes_count || 0) - 1),
                    }
                    : r
                ),
              };
            }
            return c;
          }
        });
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  const handleReplyPress = (name: string, id: string) => {
    setReplyTo(name);
    setParentId(id);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setParentId(null);
  };

  /** ------------------ Render Replies ------------------ */
  const renderReply = (reply: any, parentCommentId: string) => (

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
        style={[styles.replyAvatar]}
      />

      <View style={styles.replyBlock}>
        <View style={styles.nameRow}>
          <Text style={Typography.black13Bold}>{reply?.username || "User"}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={[Typography.black11Bold, { color: Colors.gray40 }]}>{getTimeAgo(reply.createdAt)}</Text>
        </View>
        <Text style={[Typography.black11Medium, { marginTop: 2 }]}>{reply.text}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => handleLikeToggle(reply, true, parentCommentId)}
          >
            <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>Like {reply.likes_count || 0}</Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>
          <TouchableOpacity onPress={() => handleReplyPress(reply?.username || "User", parentCommentId)}>
            <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  /** ------------------ Render Comments ------------------ */
  const renderItem = ({ item }: any) => {
    const checkUserid = item?.user_id == userProfile?.user_id

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
            <Text style={Typography.black13Bold}>{item.username ? item.username : checkUserid && userProfile?.username}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[Typography.black11Bold, { color: Colors.gray40 }]}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={[Typography.black11Medium, { marginTop: 2 }]}>{item.text}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => handleLikeToggle(item, false)}
            >
              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>Like {item.likes_count || 0}</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>|</Text>
            <TouchableOpacity onPress={() => handleReplyPress(item.username || "User", item._id)}>
              <Text style={[Typography.black13Medium, { color: Colors.gray40 }]}>Reply</Text>
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
    )
  };

  const renderCommentsUI = () => (
    <>
      <FlatList
        ref={scrollViewRef}
        data={localComments}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !commentLoading ? <Text style={styles.empty}>{postType?.toLocaleUpperCase() === "QA" ? "No answers yet" : 'No comments yet'}</Text> : null
        }
        keyboardShouldPersistTaps="handled"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.fixedInputWrapper}>

          {replyTo && (
            <View style={styles.replyingToBar}>
              <Text style={styles.replyingText}>Replying to {replyTo}</Text>
              <TouchableOpacity onPress={cancelReply}>
                <Image source={Icons.cross} style={styles.replyingCloseIcon} />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputRow,]}>
            <Image
              source={userProfile?.profile_photo_url ? { uri: userProfile.profile_photo_url } : Icons.placeholder}
              style={styles.inputAvatar}
            />

            <View style={styles.inputWrap}>
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
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || submitting}
            style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendDisabled, { top: replyTo ? 46 : 14 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Image source={Icons.send} style={styles.sendIcon} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {isModal === true &&
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomBtn} onPress={() => setShowEmojis(!showEmojis)}>
            <Image source={Icons.emoji} style={styles.bottomIcon} />
            <Text style={[Typography.black14Medium, { color: Colors.secondaryText }]}>Emoji</Text>
          </TouchableOpacity>
        </View>}
      {showEmojis && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowEmojis(false)}  // 👈 BAR CLOSE ON OUTSIDE TOUCH
        >
          {/* STOP PROPAGATION so inside tap does NOT close */}
          <Pressable style={styles.emojiBar} onPress={(e) => e.stopPropagation()}>
            {REACTED_EMOJIS.slice(0, 6).map((e) => (
              <TouchableOpacity key={e.symbol} onPress={() => handleEmojiSelect(e.symbol)}>
                <Text style={styles.emoji}>{e.symbol}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      )}
    </>
  );

  const listFooter = commentLoading ? (
    <View style={{ paddingVertical: 18, alignItems: "center" }}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  ) : null;

  const sheetHeight = `${Math.round(heightRatio * 100)}%`;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backdrop,
              { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={Typography.black16Bold}>{postType?.toLocaleUpperCase() === "QA" ? "Answers" : "Comments"}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Image source={Icons.cross} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          {renderCommentsUI()}
        </Animated.View>
      </Modal>
    </>
  );
};

export default CommentSheetModal;

/* ----------------------- Styles (unchanged) ----------------------- */
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 17, fontWeight: "600", color: "#000" },
  closeIcon: { width: 20, height: 20, tintColor: "#000" },
  listPad: { paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 70 },
  commentRow: { flexDirection: "row", marginBottom: 18 },
  avatar: { width: 34, height: 34, borderRadius: 20 },
  commentBlock: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontWeight: "600", fontSize: 14, color: "#000" },
  nameSm: { fontWeight: "600", fontSize: 13, color: "#000" },
  dot: { fontSize: 12, color: "#565656" },
  time: { fontSize: 12, color: "#888" },
  comment: { marginTop: 2, fontSize: 14, color: "#333", lineHeight: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  heartIcon: { width: 18, height: 18, objectFit: 'contain' },
  likeCount: { fontSize: 13, color: "#555" },
  action: { fontSize: 13, color: Colors.primary, fontWeight: "500" },
  divider: { fontSize: 12, color: Colors.gray40 },
  repliesWrap: { flexDirection: "row", marginTop: 10 },
  connector: { width: 16, marginLeft: 6, borderLeftWidth: 1, borderLeftColor: "#E3E3E3" },
  repliesCol: { flex: 1, paddingLeft: 12 },
  replyRow: { flexDirection: "row", marginBottom: 12 },
  replyAvatar: { width: 30, height: 30, borderRadius: 15 },
  replyBlock: { flex: 1, marginLeft: 10 },
  replyText: { fontSize: 13, color: "#444", },
  empty: { textAlign: "center", color: "#999", marginTop: 24 },
  replyingToBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 6,
    backgroundColor: "#F7F7F7", borderTopWidth: 1, borderTopColor: "#EEE",
  },
  replyingText: { ...Typography.black13Bold, },
  replyingCloseIcon: { width: 16, height: 16, tintColor: "#666" },

  fixedInputWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    position: 'relative', // ✅ Important
  },
  inputAvatar: { width: 34, height: 34, borderRadius: 19, marginRight: 10 },
  inputWrap: {
    flex: 1, backgroundColor: Colors.comentInput, borderRadius: Spacing.modalBorderRadius,
    paddingHorizontal: 14, paddingVertical: 12, maxHeight: 110,
  },
  input: { fontSize: 14, color: "#000", padding: 0, margin: 0 },
  sendBtn: {
    width: 33, height: 33, borderRadius: 7, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    position: "absolute", right: 26,
  },
  sendDisabled: { backgroundColor: "#CFCFCF" },
  sendIcon: { width: 20, height: 20, tintColor: "#fff" },
  bottomBar: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 10 },
  overlay: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.01)", // invisible but touchable
    justifyContent: "center",
    zIndex: 9999
  },
  emojiBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    alignSelf: 'center'
  },
  emoji: { fontSize: 24, marginHorizontal: 6 },
  bottomBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.lightBg, padding: 10, borderRadius: Spacing.modalBorderRadius,
  },
  bottomIcon: { width: 18, height: 18 },
  bottomLabel: { fontSize: 13, color: "#555", fontWeight: "500" },
});
