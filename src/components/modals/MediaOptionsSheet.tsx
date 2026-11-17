import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";

interface Props {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onClose: () => void;
}

const MediaOptionsSheet: React.FC<Props> = ({
  visible,
  onCamera,
  onGallery,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Choose option</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Image source={Icons.cross} style={styles.crossIcon} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Camera */}
          <TouchableOpacity style={styles.optionRow} onPress={onCamera}>
            <Image source={Icons.camera} style={styles.optionIcon} />
            <Text style={styles.optionText}>Camera</Text>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity style={styles.optionRow} onPress={onGallery}>
            <Image source={Icons.gallery} style={styles.optionIcon} />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MediaOptionsSheet;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DADADA",
    alignSelf: "center",
    marginVertical: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  title: {
    ...Typography.black16Bold,
    color: Colors.secondaryText,
  },

  crossIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.secondaryText,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  optionIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
    marginRight: 14,
  },

  optionText: {
    ...Typography.black16Medium,
    color: Colors.primary,
  },
});

