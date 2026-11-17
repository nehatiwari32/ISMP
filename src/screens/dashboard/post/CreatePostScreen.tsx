import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "../../../theme/colors";
import { CreatePostModal, MediaPicker, ViewContainer } from "../../../components";
import { RootState } from "../../../redux/store";
import { addLocalFile, bulkMedia, resetUploadState } from "../../../redux/slices/profileSlice";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 50) / 3;


const CreatePostScreen = () => {
  const dispatch = useDispatch();
  const { uploading } = useSelector(
    (state: RootState) => state.profile
  );

  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  /* ----------------------------------------- */
  /* ✅ Upload Selected Media                  */
  /* ----------------------------------------- */
  const uploadSelectedMedia = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert("No Media Selected", "Please select at least one photo or video");
      return;
    }

    try {

      try {

        const result = await dispatch(
          bulkMedia({
            files: selectedMedia,   // ✅ Correct key
            type: "user"
          })
        ).unwrap();

        if (result?.data?.urls?.length) {
          result.data.urls.forEach((url: string, index: number) => {
            const original = selectedMedia[index];
            const mime = original.mime || original.type;

            const uploaded = {
              uri: url,
              status: "uploaded",
              id: `server-${Date.now()}-${index}`,
              type: mime?.includes("video")
                ? "video"
                : mime?.includes("image")
                  ? "image"
                  : "unknown",
            };

            dispatch(addLocalFile(uploaded));
            setShowCreatePostModal(true);
          });
        }
      } catch (error) {
        Alert.alert('Error', error)
        console.log('Upload failed for:', error);
      }

    } catch (error) {
      Alert.alert("Upload Error", "Failed to upload some files. Please try again.");
    }
  };

  /* ----------------------------------------- */
  /* ✅ Handle Next Button                     */
  /* ----------------------------------------- */
  const handleNext = () => {
    if (selectedMedia.length === 0) {
      Alert.alert("No Media Selected", "Please select at least one photo or video");
      return;
    }
    // Upload media first, then show post modal
    uploadSelectedMedia();
  };

  /* ----------------------------------------- */
  /* ✅ Remove Selected Media                  */
  /* ----------------------------------------- */
  const removeSelectedMedia = (mediaId: string) => {
    setSelectedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  return (
    <ViewContainer
      isHeader
      headerTitle="New Post"
      scrollable={false}
      containerStyle={styles.mainContainer}
    >
      <MediaPicker
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
      />

      {selectedMedia.length > 0 && (
        <View style={styles.bottomBar}>
          {/* Selected Media Preview Scroll */}
          <View style={styles.previewScrollContainer}>
            <FlatList
              horizontal
              data={selectedMedia}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.previewItem}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeSelectedMedia(item.id)}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.previewIndex}>{index + 1}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewScrollContent}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              uploading && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={uploading}
          >
            <Text style={styles.nextButtonText}>
              {uploading ? 'Uploading...' : `Next`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => {
          setShowCreatePostModal(false);
          dispatch(resetUploadState())
          setSelectedMedia([]);
        }}
      />
    </ViewContainer>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  selectionCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '10',
  },
  counterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
  gridContainer: {
    paddingHorizontal: 2,
    paddingBottom: 100,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  cameraTile: {
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  selectionCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  videoIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoIcon: {
    color: "#fff",
    fontSize: 10,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  previewScrollContainer: {
    flex: 1,
    marginRight: 12,
  },
  previewScrollContent: {
    paddingRight: 12,
  },
  previewItem: {
    position: "relative",
    marginRight: 8,
  },
  previewImage: {
    width: 86,
    height: 86,
    borderRadius: 8,
  },
  removeBtn: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.closeBg,
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  previewIndex: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 100,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

});