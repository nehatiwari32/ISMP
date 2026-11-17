import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
} from "react-native";

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ImagePicker from "react-native-image-crop-picker";

import { requestPermission } from "../utils/permission";
import { MAX_SELECTION } from "../utils/helper";
import { Icons } from "../assets/icons";
import { Colors } from "../theme/colors";
import { Spacing } from "../theme/typography";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 50) / 3;

interface MediaPickerProps {
  setSelectedMedia: any;
  selectedMedia: any;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ setSelectedMedia, selectedMedia }) => {
  const [media, setMedia] = useState<any[]>([]);
  const [albums] = useState(["Recent", "Favorites", "Videos", "WhatsApp"]);
  const [selectedAlbum, setSelectedAlbum] = useState("Recent");
  const [showAlbumModal, setShowAlbumModal] = useState(false);

  /* ---------------- Load Media ---------------- */
  const loadMediaFromCameraRoll = async (albumName: string = "Recent") => {
    const hasPermission = await requestPermission(albumName);

    if (!hasPermission) {
      console.warn("⚠️ Permission not granted");
      return;
    }

    try {
      let assetType: "Photos" | "Videos" | "All" = "Photos";
      if (albumName === "Videos") {
        assetType = "Videos";
      } else if (albumName === "Recent") {
        assetType = "All";
      }

      let groupName: string | undefined = undefined;
      if (albumName === "WhatsApp") {
        groupName = Platform.OS === "android" ? "WhatsApp Images" : "WhatsApp";
      } else if (albumName === "Favorites" && Platform.OS === "ios") {
        groupName = "Favorites";
      }

      console.log("Loading media:", { assetType, groupName, albumName });

      const result = await CameraRoll.getPhotos({
        first: 100,
        assetType,
        groupName,
      });

      console.log("Fetched media count:", result.edges.length);

      const formattedMedia = result.edges.map((edge, index) => ({
        id: `media-${index}-${Date.now()}`,
        uri: edge.node.image.uri,
        type: edge.node.type,
        width: edge.node.image.width,
        height: edge.node.image.height,
        duration: edge.node.image.playableDuration || 0,
        fileName: edge.node.image.filename || `photo-${index}.jpg`,
        mime: edge.node.type === 'video' ? 'video/mp4' : 'image/jpeg',
      }));

      setMedia(formattedMedia);
    } catch (error) {
      console.log("Error loading media:", error);
      Alert.alert("Error", "Failed to load photos. Please try again.");
    }
  };

  useEffect(() => {
    loadMediaFromCameraRoll("Recent");
  }, []);

  /* ---------------- Toggle Select ---------------- */
  const toggleSelect = (item: any) => {
    const exists = selectedMedia.some((m) => m.id === item.id);

    if (exists) {
      // remove
      setSelectedMedia((prev) => prev.filter((m) => m.id !== item.id));
    } else {
      if (selectedMedia.length >= MAX_SELECTION) {
        return Alert.alert("Limit", `You can select up to ${MAX_SELECTION}`);
      }
      setSelectedMedia((prev) => [...prev, item]);
    }
  };

  /* ---------------- Open Camera ---------------- */
  const openCamera = async () => {
    try {
      const result = await ImagePicker.openCamera({
        cropping: false,
        mediaType: "any",
      });

      const item = {
        id: `cam-${Date.now()}`,
        uri: result.path,
        type: result.mime,
        mime: result.mime,
      };

      setMedia((prev) => [item, ...prev]);
      setSelectedMedia((prev) => [...prev, item]);
    } catch (e) { }
  };

  const handleAlbumChange = (album: string) => {
    setSelectedAlbum(album);
    setShowAlbumModal(false);
    setSelectedMedia([]); // Reset selection when album changes
    loadMediaFromCameraRoll(album);
  };

  /* ---------------- Media Tile Renderer ---------------- */
  const renderItem = ({ item, index }: any) => {
    // Camera tile first
    if (index === 0) {
      return (
        <TouchableOpacity style={styles.cameraTile} onPress={openCamera}>
          <Image source={Icons.cameraRotate} style={styles.cameraIcon} />
        </TouchableOpacity>
      );
    }

    const isSelected = selectedMedia.some((m) => m.id === item.id);
    const number = selectedMedia.findIndex((m) => m.id === item.id) + 1;

    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => toggleSelect(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.mediaImage} />

        {/* Selection Bubble */}
        <View
          style={[
            styles.circle,
            isSelected && { backgroundColor: Colors.secondary },
          ]}
        >
          {isSelected && <Text style={styles.circleText}>{number}</Text>}
        </View>

        {isSelected && <View style={styles.overlay} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contentWrapper}>
      <TouchableOpacity
        style={styles.albumSelector}
        onPress={() => setShowAlbumModal(true)}
      >
        <Text style={styles.albumText}>{selectedAlbum}</Text>
        <Image source={Icons.downArrow} style={styles.dropdownIcon} />
      </TouchableOpacity>

      <Modal
        visible={showAlbumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlbumModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAlbumModal(false)}
        >
          <View style={styles.modalContent}>
            {albums.map((album, index) => (
              <TouchableOpacity
                key={index}
                style={styles.albumOption}
                onPress={() => handleAlbumChange(album)}
              >
                <Text style={styles.albumOptionText}>{album}</Text>
                {selectedAlbum === album && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <FlatList
        data={[{ isCamera: true }, ...media]}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

export default MediaPicker;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  albumSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  albumText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  dropdownIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: 100,
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 200,
    paddingVertical: 8,
  },
  albumOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  albumOptionText: {
    fontSize: 15,
    color: Colors.primaryText,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "700",
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  cameraTile: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    objectFit: 'contain'
  },
  circle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  circleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },


});
