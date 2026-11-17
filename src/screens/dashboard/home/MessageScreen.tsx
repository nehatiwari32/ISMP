import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import ViewContainer from "../../../components/ViewContainer";
import { Colors } from "../../../theme/colors";
import { Typography, Spacing } from "../../../theme/typography";
import { Icons } from "../../../assets/icons";
import { AppTabBar, HomeHeader } from "../../../components";
import { chatHeader } from "../../../utils/helper";

const MessageScreen = () => {
  const [activeTab, setActiveTab] = useState("friends");

  // ⭐ Dummy data for stories row
  const stories = [
    { id: "0", name: "Happening", image: null, note: "Note..." },
    { id: "1", name: "Aarav Sharma", image: "https://randomuser.me/api/portraits/men/11.jpg" },
    { id: "2", name: "Priya Patel", image: "https://randomuser.me/api/portraits/women/21.jpg" },
    { id: "3", name: "Sneha Iyer", image: "https://randomuser.me/api/portraits/women/31.jpg" },
    { id: "4", name: "Vikram Singh", image: "https://randomuser.me/api/portraits/men/41.jpg" },
  ];

  // ⭐ Dummy chat list
  const chatList = [
    {
      id: 1,
      name: "Rajat Kumar",
      message: "Hello Nitin, Hope you are doing well!",
      time: "Today, 12:25",
      unread: 5,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      id: 2,
      name: "Nikita Thakur",
      message: "I'm all in on this!",
      time: "Today, 12:25",
      unread: 0,
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    },
    {
      id: 3,
      name: "Arjun Reddy",
      message: "This is great news!",
      time: "Today, 12:25",
      unread: 0,
      avatar: "https://randomuser.me/api/portraits/men/24.jpg",
    },
    {
      id: 4,
      name: "Sita Devi",
      message: "I'm excited about this!",
      time: "Today, 12:25",
      unread: 0,
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
    },
  ];

  // ⭐ Chat Item UI
  const renderChatItem = ({ item }) => (
    <View style={styles.chatCard}>
      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={Typography.black14Bold}>{item.name}</Text>
        <Text style={[Typography.black12Regular, { color: Colors.secondaryText }]} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={[Typography.black12Regular, { color: Colors.secondaryText }]}>
          {item.time}
        </Text>

        {item.unread > 0 && (
          <View style={styles.unreadDot}>
            <Text style={{ color: "#fff", fontSize: 10 }}>{item.unread}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ViewContainer isHeader={false} backgroundColor={Colors.backgroundLight} containerStyle={{ paddingHorizontal: 0 }}>
      <HomeHeader
        showOfferCard={false}
      />
      <View style={styles.wrapper}>

        {/* 🔍 Search Icon */}
        <View style={styles.chatWrapper}>
          <Text style={styles.chatTxt}>Chat</Text>
          <TouchableOpacity style={styles.searchIconWrapper}>
            <Image source={Icons.search} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>

        {/* ⭐ Stories Row */}
        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View style={{ alignItems: "center", marginRight: 20 }}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.storyAvatar} />
              ) : (
                <View style={styles.noteBubble}>
                  <Text style={Typography.black12Regular}>Note...</Text>
                </View>
              )}
              <Text numberOfLines={1} style={styles.storyName}>
                {item.name}
              </Text>
            </View>
          )}
        />

        {/* ⭐ Chat Category Tabs */}
        <View style={styles.tabsRow}>
          <AppTabBar
            tabs={chatHeader}
            active={activeTab}
            onChange={(val) => {
              setActiveTab(val);
            }}
          />
        </View>

        {/* ⭐ Chat List */}
        <FlatList
          data={chatList}
          showsVerticalScrollIndicator={false}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* ⭐ Floating + Button */}
        <TouchableOpacity style={styles.floatingBtn}>
          <Text style={styles.floatingPlus}>+</Text>
        </TouchableOpacity>

      </View>
    </ViewContainer>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 16,
    backgroundColor: Colors.lightBg
  },
  chatWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  chatTxt: {
    ...Typography.black16Bold
  },

  // Search Icon
  searchIconWrapper: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.primary,
    objectFit: "contain",
  },

  // Stories
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storyName: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
    marginTop: 4,
    maxWidth: 70,
    textAlign: "center",
  },
  noteBubble: {
    width: 60,
    height: 35,
    backgroundColor: Colors.border10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tabs
  tabsRow: {
    marginVertical: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  activeTab: {
    backgroundColor: "#EAF5FF",
  },
  tabLabel: {
    fontSize: 13,
    color: "#555",
  },

  // Chat Card
  chatCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  unreadDot: {
    backgroundColor: Colors.primary,
    height: 20,
    width: 20,
    borderRadius: 10,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  // Floating button
  floatingBtn: {
    position: "absolute",
    right: 25,
    bottom: 25,
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  floatingPlus: {
    ...Typography.black24Regular,
    fontSize: 34,
    color: "#fff",
  },
});
