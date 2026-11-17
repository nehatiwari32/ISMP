import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Colors } from "../theme/colors";
import { EMOJI_CATEGORIES } from "../utils/helper";
import { Typography } from "../theme/typography";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState("Smileys");

  return (
    <View style={styles.container}>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.categoryWrapper}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>

            {/* Underline only for active */}
            {selectedCategory === category && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Emoji Grid */}
      <FlatList
        data={EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES]}
        numColumns={8}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emojiItem}
            onPress={() => onEmojiSelect(item)}
          >
            <Text style={styles.emojiText}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default EmojiPicker;

const styles = StyleSheet.create({
  container: {
    height: 280,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    maxHeight: 50,
  },

  categoryContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  categoryWrapper: {
    alignItems: "center",
    marginRight: 20,
  },

  categoryText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
  },

  categoryTextActive: {
    color: Colors.primary,
    ...Typography.black14Bold,
  },

  underline: {
    width: "80%",
    height: 2,
    backgroundColor: Colors.primary,
    marginTop: 4,
    borderRadius: 10,
  },

  emojiGrid: {
    padding: 12,
  },

  emojiItem: {
    width: "12.5%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emojiText: {
    fontSize: 26,
  },
});
