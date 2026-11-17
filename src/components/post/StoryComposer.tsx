import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";

import { Spacing, Typography } from "../../theme/typography";
import { Colors } from "../../theme/colors";
import { StoryComposerProps } from "../../utils/interfaces";
import MediaPicker from "../MediaPicker";
import GradientAvatar from "../GradientAvatar";
import { Icons } from "../../assets/icons";
import { fetchHashTags } from "../../redux/slices/postSlice";
import { getFriends } from "../../redux/slices/friendSlice";

const StoryComposer: React.FC<StoryComposerProps> = ({
  caption,
  setCaption,
  selectedMedia,
  setSelectedMedia,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const dispatch = useDispatch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<
    "hashtag" | "mention" | null
  >(null);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  /* 🔍 Detect # or @ */
  useEffect(() => {
    const text = caption;
    const position = cursorPosition;

    const lastHash = text.lastIndexOf("#", position - 1);
    const lastMention = text.lastIndexOf("@", position - 1);

    const hasSpaceAfterHash =
      lastHash >= 0 && text.slice(lastHash, position).includes(" ");
    const hasSpaceAfterMention =
      lastMention >= 0 && text.slice(lastMention, position).includes(" ");

    if (!hasSpaceAfterHash && lastHash > lastMention && lastHash >= 0) {
      setSuggestionType("hashtag");
      setShowSuggestions(true);
      fetchHashtagSuggestions();
    } else if (!hasSpaceAfterMention && lastMention >= 0) {
      setSuggestionType("mention");
      setShowSuggestions(true);
      fetchFriendSuggestions();
    } else {
      setShowSuggestions(false);
      setSuggestionType(null);
    }
  }, [caption, cursorPosition]);

  /* 🔹 Fetch hashtags */
  const fetchHashtagSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await dispatch(
        fetchHashTags({ page: 1, limit: 10 })
      ).unwrap();
      setHashtags(res?.items || []);
    } catch {
      setHashtags([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  /* 🔹 Fetch friends */
  const fetchFriendSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await dispatch(
        getFriends({ page: 1, limit: 10 })
      ).unwrap();
      setFriends(res?.items || []);
    } catch {
      setFriends([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  /* 🔹 Select suggestion */
  const handleSuggestionSelect = (item: any) => {
    const text = caption;
    const position = cursorPosition;

    if (suggestionType === "hashtag") {
      const index = text.lastIndexOf("#", position - 1);
      const updated =
        text.slice(0, index) + `#${item.name} ` + text.slice(position);
      setCaption(updated);
    } else {
      const index = text.lastIndexOf("@", position - 1);
      const updated =
        text.slice(0, index) +
        `@${item.name || item.username} ` +
        text.slice(position);
      setCaption(updated);
    }

    setShowSuggestions(false);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  /* 🔹 Render suggestion item */
  const renderSuggestionItem = ({ item }: any) => {
    if (suggestionType === "hashtag") {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSuggestionSelect(item)}
        >
          <Text style={styles.suggestionHash}>#</Text>
          <Text style={styles.suggestionText}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionSelect(item)}
      >
        <GradientAvatar
          source={
            item.profile_photo_url
              ? { uri: item.profile_photo_url }
              : Icons.placeholder
          }
          size={32}
        />
        <View style={styles.suggestionUserInfo}>
          <Text style={styles.suggestionText}>
            {item.name || item.username}
          </Text>
          {item.username && (
            <Text style={styles.suggestionUsername}>@{item.username}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {selectedMedia.length === 0 ? (
        <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding }}>
          <MediaPicker
            setSelectedMedia={setSelectedMedia}
            selectedMedia={selectedMedia}
          />
        </View>
      ) : (
        <View style={styles.postBox}>
          <TextInput
            ref={textInputRef}
            style={styles.captionInput}
            placeholder="Speak from your heart"
            placeholderTextColor="#828692"
            multiline
            value={caption}
            onChangeText={setCaption}
            onSelectionChange={(e) =>
              setCursorPosition(e.nativeEvent.selection.start)
            }
          />

          {/* ✅ FIXED SUGGESTIONS UI */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {loadingSuggestions ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={suggestionType === "hashtag" ? hashtags : friends}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(_, i) => String(i)}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.noSuggestionsText}>
                        {suggestionType === "hashtag"
                          ? "No hashtags found"
                          : "No friends found"}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          )}

          <Image
            source={{ uri: selectedMedia[0]?.uri }}
            style={styles.mediaImage}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default StoryComposer;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  postBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    margin: 16,
    padding: 12,
  },

  captionInput: {
    ...Typography.black14Medium,
    minHeight: 80,
  },

  mediaImage: {
    width: "100%",
    height: 300,
    marginTop: 10,
    borderRadius: 8,
  },

  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    maxWidth: 200
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },

  suggestionHash: {
    ...Typography.black13Bold,
    color: Colors.primary,
  },

  suggestionText: {
    ...Typography.black13Bold,
    flex: 1,
  },

  suggestionUserInfo: {
    flex: 1,
  },

  suggestionUsername: {
    ...Typography.black13Medium,
    color: Colors.secondaryText,
  },

  emptyContainer: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  noSuggestionsText: {
    ...Typography.black13Medium,
    color: Colors.secondaryText,
  },

  loadingBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
