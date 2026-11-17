import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors } from "../../../theme/colors";
import { ViewContainer } from "../../../components";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import { Spacing, Typography } from "../../../theme/typography";

const NotificationScreen = ({ navigation }) => {
  const [notifications] = useState([
    {
      id: "1",
      type: "Deal Expiring Soon",
      message: "Your 50% off Electronics coupon expires in 3 hours. Use Code: SAVE50",
      actions: ["Urgent", "View Deals"],
      time: "2h ago",
      icon: Icons.offer,
    },
    {
      id: "2",
      type: "New Followers",
      message: "Sarah Johnson started following you",
      actions: ["Follow Back", "View"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "3",
      type: "Activity Update",
      message: "Sarah Johnson liked your story",
      actions: ["View"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "4",
      type: "Group Invitation",
      message: "You’ve been invited to join 'Local Business Network'",
      actions: ["Accept", "Decline"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "5",
      type: "Event Reminder",
      message: "Networking Event starts in 2 hours at Downtown Hall",
      actions: ["View"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "6",
      type: "LMS Post",
      message: "Congrats! You booked a new offer.",
      actions: ["View"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "7",
      type: "New Friend Request",
      message: "Karanveer Bose sent you a friend request",
      actions: ["Accept", "Decline"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
    {
      id: "8",
      type: "Support a Fundraiser",
      message: "Help raise funds for 'School Library Project'",
      actions: ["Donate Now"],
      time: "2h ago",
      icon: Icons.placeholder,
    },
  ]);

  const handleActionPress = (type, action) => {
    console.log(`Action: ${action} on ${type}`);
    // You can navigate or trigger an API here
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={item.icon} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={Typography.black14Medium}>{item.type}</Text>
          <Text style={[Typography.black10Regular, { marginTop: 2, color: Colors.secondaryText }]}>{item.message}</Text>
        </View>
        <Text style={[Typography.black10Regular, { marginLeft: 8, color: '#4F4F4F' }]}>{item.time}</Text>
      </View>

      {item.actions?.length > 0 && (
        <View style={styles.actionRow}>
          {item.actions.map((btn, index) => {
            const isPrimary = ["Urgent", "Accept", "Follow Back", "Donate Now"].includes(btn);
            const isDecline = ["Decline"].includes(btn);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleActionPress(item.type, btn)}
                activeOpacity={0.8}
                style={[
                  isPrimary
                    ? styles.primaryBtn
                    : isDecline
                      ? styles.declineBtn
                      : styles.secondaryBtn,
                ]}
              >
                <Text
                  style={[Typography.black13Bold,
                  isPrimary
                    ? styles.primaryText
                    : isDecline
                      ? styles.declineText
                      : styles.secondaryText,
                  ]}
                >
                  {btn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image source={Images.emptyNotification} style={styles.bellIcon} />
      <Text style={styles.emptyTitle}>No Notifications Yet</Text>
      <Text style={styles.emptySubtitle}>
        You have no notifications right now.{"\n"}Come back later.
      </Text>
    </View>
  );

  return (
    <ViewContainer contentContainerStyle={{ paddingHorizontal: 0 }} headerTitle="Notifications">
      <View style={styles.container}>
        {notifications.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ViewContainer>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: '4%'

  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    width: 30,
    height: 30,
    objectFit: 'contain',
    marginRight: 10,
  },
  type: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  message: {
    fontSize: 10,
    color: "#555",
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: "#999",
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  declineBtn: {
    borderColor: "#ccc",
  },
  secondaryBtn: {
    borderColor: Colors.primary,
  },

  primaryText: {
    color: "#fff",
  },
  declineText: {
    color: "#555",
  },
  secondaryText: {
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  bellIcon: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#777",
    lineHeight: 20,
  },
});
