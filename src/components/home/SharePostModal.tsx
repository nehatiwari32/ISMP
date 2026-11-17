import React from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Images } from "../../assets/images";
import { Icons } from "../../assets/icons";

const { height } = Dimensions.get("window");

const SharePostModal = ({ visible, onClose }: any) => {
  const friends = [
    { id: "1", name: "Rajat Kumar", avatar: Icons.placeholder },
    { id: "2", name: "Aarav Singh", avatar: Icons.placeholder },
    { id: "3", name: "Meera Patel", avatar: Icons.placeholder },
    { id: "4", name: "Nisha Verma", avatar: Icons.placeholder },
    { id: "5", name: "Vikram Joshi", avatar: Icons.placeholder },
  ];

  const shareOptions = [
    { id: "1", label: "Add to Story", icon: Images.addStory },
    { id: "2", label: "Copy Link", icon: Images.copyLink },
    { id: "3", label: "Gmail", icon: Images.gmail },
    { id: "4", label: "Messages", icon: Images.message },
    { id: "5", label: "WhatsApp", icon: Images.whatsapp },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContainer}>
          {/* Header Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>SHARE POST</Text>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <Image source={Icons.search} style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>

          {/* Friends List */}
          <Text style={styles.sectionTitle}>Send to your Friends & Groups</Text>
          <FlatList
            data={friends}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <Image source={item.avatar} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{item.name}</Text>
              </View>
            )}
          />

          {/* Share To */}
          <Text style={styles.sectionTitle}>Share to</Text>
          <View style={styles.shareRow}>
            {shareOptions.map((item) => (
              <View key={item.id} style={styles.shareItem}>
                <Image source={item.icon} style={styles.shareIcon} />
                <Text style={styles.shareLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SharePostModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayBg: { flex: 1 },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    minHeight: height * 0.45,
  },
  handle: {
    alignSelf: "center",
    width: 50,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchIcon: { width: 16, height: 16, tintColor: "#aaa", marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: "#000" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
  },
  friendItem: {
    alignItems: "center",
    marginRight: 16,
    marginTop: 10,
  },
  friendAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 6,
  },
  friendName: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    width: 70,
  },
  shareRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  shareItem: {
    alignItems: "center",
    width: "25%",
    marginTop: 12,
  },
  shareIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    marginBottom: 6,
    resizeMode: "contain",
  },
  shareLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});
