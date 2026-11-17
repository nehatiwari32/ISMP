import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icons } from "../../../assets/icons";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const TAB_HEIGHT = 70;
const ITEM_HEIGHT = height - HEADER_HEIGHT - TAB_HEIGHT;

/* ---------- MOCK DATA ---------- */
const DATA = [
  {
    id: "1",
    user: "Ram Charan",
    time: "11 hours ago",
    location: "Valasaravakkam",
    caption: "Travel isn't just about reaching a place, it's about discovering...",
    likes: "60k",
    comments: "2.3k",
    shares: "2.3k",
    avatar: "https://i.pravatar.cc/100?img=12",
    image:
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=900",
  },
  {
    id: "2",
    user: "Ram Charan",
    time: "11 hours ago",
    location: "Valasaravakkam",
    caption: "Travel isn't just about reaching a place, it's about discovering...",
    likes: "60k",
    comments: "2.3k",
    shares: "2.3k",
    avatar: "https://i.pravatar.cc/100?img=12",
    image:
      "https://images.unsplash.com/photo-1604908177522-432c77fefc06?w=900",
  },
];

const VibeScreen = () => {
  const navigation = useNavigation()
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ---------------- HEADER ---------------- */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={Icons.arrowLeft} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.vibeChip}>
            <Text style={styles.vibeText}>Vibe</Text>
            <Image source={Icons.downArrow} style={styles.downIcon} />
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.appName}>App Name</Text>
          <TouchableOpacity>
            <Image source={Icons.addIcon} style={styles.addIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------- REELS ---------------- */}
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View style={[styles.reelItem, { height: ITEM_HEIGHT }]}>
            {/* Background Image / Video */}
            <Image source={{ uri: item.image }} style={styles.reelImage} />

            {/* Right Actions */}
            <View style={styles.rightActions}>
              <Action icon={Icons.like} count={item.likes} />
              <Action icon={Icons.message1} count={item.comments} />
              <Action icon={Icons.postShare} count={item.shares} />
              <Action icon={Icons.mute} isMute={true} />
              <Action icon={Icons.more} />
            </View>

            {/* Bottom Info */}
            <View style={styles.bottomInfo}>
              <View style={styles.userRow}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>{item.user}</Text>
                  <Text style={styles.meta}>
                    {item.time} · {item.location}
                  </Text>
                </View>
              </View>

              <Text style={styles.caption}>{item.caption}</Text>

              <View style={styles.scrollUp}>
                <Text style={styles.scrollIcon}>⌃</Text>
              </View>
            </View>
          </View>
        )}
      />

    </SafeAreaView>
  );
};

/* ---------- SMALL COMPONENTS ---------- */
const Action = ({ icon, count, isMute }: any) => (
  <View style={styles.action}>
    {isMute ?
      <View style={styles.muteBGIcon}>
        <Image source={icon} style={{ height: 16, width: 16, objectFit: "contain" }} tintColor={'#fff'} />
      </View>
      :
      <Image source={icon} style={styles.actionIcon} />
    }

    {count && <Text style={styles.actionCount}>{count}</Text>}
  </View>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },

  backIcon: {
    height: 24,
    width: 24,
    objectFit: "contain"
  },

  vibeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },

  vibeText: { ...Typography.black14Bold, color: "#fff" },
  downIcon: { height: 12, width: 12, objectFit: "contain", tintColor: "#fff" },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  appName: { ...Typography.black12Bold, color: Colors.primary },

  addBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 4,
  },

  addIcon: { height: 26, width: 26, objectFit: "contain" },

  reelItem: {
    width,
    backgroundColor: "#000",
  },

  reelImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 160,
    alignItems: "center",
  },

  action: { marginBottom: 20, alignItems: "center" },
  muteBGIcon: { height: 30, width: 30, backgroundColor: Colors.primary, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: 0.8 },
  actionIcon: { height: 24, width: 24, objectFit: "contain", tintColor: "#fff" },

  actionCount: { color: "#fff", fontSize: 12 },

  bottomInfo: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },

  userName: { color: "#fff", fontWeight: "700" },

  meta: { color: "#ddd", fontSize: 12 },

  caption: { color: "#fff", fontSize: 13 },

  scrollUp: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollIcon: { color: "#fff", fontSize: 20 },

  bottomTab: {
    height: TAB_HEIGHT,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: { alignItems: "center" },
});

export default VibeScreen;
