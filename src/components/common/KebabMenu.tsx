import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";

import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { Typography } from "../../theme/typography";

const KebabMenu = ({ visible, onClose }) => {
  const menuItems = [
    { id: 1, title: "Send Message", icon: Icons.message },
    { id: 2, title: "Follow User", icon: Icons.notification },
    { id: 3, title: "Block User", icon: Icons.blockUser },
    { id: 4, title: "Unfriend User", icon: Icons.unfriend },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Dim background */}
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

      {/* Popup Box */}
      <View style={styles.popupBox}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.row}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={[Typography.black14Regular, { marginLeft: 10 }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

export default KebabMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  popupBox: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderRadius: 12,
    width: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
});
