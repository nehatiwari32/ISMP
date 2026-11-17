import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AudioRecord from 'react-native-audio-record';
import { pick } from '@react-native-documents/picker';

import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { RootState } from "../../redux/store";
import { cleanObject, cleanTextForAPI, extractUrl } from "../../utils/helper";
import { Typography } from "../../theme/typography";
import LocationDropdown from "../home/LocationDropdown";
import { getStateCity } from "../../redux/slices/authSlice";
import { requestAudioPermission } from "../../utils/permission";
import PostComposer from "../post/PostComposer";
import { createPost, fetchPost, setCreating } from "../../redux/slices/postSlice";
import { uploadMedia, addLocalFile, resetUploadState } from "../../redux/slices/profileSlice";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  modalHeight?: any;
  closingHeight?: any;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  modalHeight = '80%',
  closingHeight = '14%'
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { uploading, uploadedFiles } = useSelector((state: RootState) => state.profile);

  const { cityState } = useSelector((state: RootState) => state.auth);
  const { postType } = useSelector((s: RootState) => s.post);

  const [documentLoading, setDocumentLoading] = useState(false);

  const [caption, setCaption] = useState("");

  const handleCaptionChange = (text: string) => {
    if (text.length <= 200) {
      setCaption(text);
    } else {
      Alert.alert("Character Limit Exceeded", "Post text cannot exceed 200 characters.");
    }
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [location, setLocation] = useState({
    isGlobal: true,
    localities: ["global"],
    visible_to: null,
    friend_ids: [],
  });

  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    color: Colors.primaryText,
    align: 'left' as 'left' | 'center' | 'right',
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<any>(null);
  const maxRecordingTime = useRef<any>(null);

  React.useEffect(() => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: 'audio_recording.wav',
    };

    AudioRecord.init(options);

    return () => {
      AudioRecord.stop();
    };
  }, []);

  const handleClose = () => {
    setCaption("");
    setBackgroundColor("")
    setCurrentFormatting({
      bold: false,
      italic: false,
      color: Colors.primaryText,
      align: "left",
    });

    setShowEmojiPicker(false);
    setShowColorPicker(false);
    setShowLocationDropdown(false);
    setDocumentLoading(false);

    if (isRecording) {
      AudioRecord.stop();
    }
    setIsRecording(false);
    setRecordingDuration(0);
    clearInterval(recordingTimer.current);
    clearTimeout(maxRecordingTime.current);

    dispatch(resetUploadState());

    setLocation({
      isGlobal: true,
      localities: ["global"],
      visible_to: null,
    });

    setSelection({ start: 0, end: 0 });
    onClose();
  };

  const startAudioRecording = async () => {
    try {
      const hasPermission = await requestAudioPermission();

      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Microphone permission is required to record audio');
        return;
      }

      // ✅ Ensure recorder is initialized before start()
      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        wavFile: "test_record.wav",
      });

      // ✅ NOW start recording (safe)
      await AudioRecord.start();

      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      maxRecordingTime.current = setTimeout(() => {
        stopAudioRecording();
      }, 8000);

    } catch (error) {
      console.log('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopAudioRecording = async () => {
    try {
      if (!isRecording) return;

      clearInterval(recordingTimer.current);
      clearTimeout(maxRecordingTime.current);

      const audioFile = await AudioRecord.stop();
      setIsRecording(false);

      // Check minimum duration
      if (recordingDuration < 5) {
        Alert.alert('Error', 'Audio must be at least 5 seconds long');
        setRecordingDuration(0);
        return;
      }

      // Prepare file for upload
      const audioUri = Platform.OS === 'ios'
        ? audioFile
        : `file://${audioFile}`;

      // Upload audio
      const uploadResult = await dispatch(
        uploadMedia({
          file: {
            uri: audioUri,
            type: 'audio/wav',
            fileName: `audio_${Date.now()}.wav`,
          },
          type: 'user',
        })
      ).unwrap();

      const uploaded = {
        uri: uploadResult?.data?.url,
        status: 'uploaded',
        id: `server-${Date.now()}`,
        type: 'audio',
      };

      dispatch(addLocalFile(uploaded));
      setRecordingDuration(0);

    } catch (error) {
      console.log('Stop recording error:', error);
      Alert.alert('Error', 'Failed to save recording');
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const openDocumentPicker = async () => {
    try {
      setDocumentLoading(true);
      const results = await pick({
        mode: 'open',
        type: ['application/pdf'],
        requestLongTermAccess: false,
      });
      const file = results[0];

      const fileName = file.name;
      const fileUri = file.uri;
      const fileType = file.type || "application/octet-stream";
      const fileSize = file.size;

      const uploadResult = await dispatch(
        uploadMedia({
          file: {
            uri: fileUri,
            type: fileType,
            fileName: fileName,
          },
          type: "user",
        })
      ).unwrap();

      const uploaded = {
        uri: uploadResult?.data?.url,
        status: "uploaded",
        id: `doc-${Date.now()}`,
        type: "document",
        name: fileName,
        fileSize: fileSize,
      };

      dispatch(addLocalFile(uploaded));

    } catch (error) {
      console.log('docerror>>>>', error);
    } finally {
      setDocumentLoading(false);
    }

  };

  React.useEffect(() => {
    return () => {
      if (isRecording) {
        AudioRecord.stop();
        clearInterval(recordingTimer.current);
        clearTimeout(maxRecordingTime.current);
      }
    };
  }, [isRecording]);

  /* ---------------- CREATE POST (Fire and Forget) ---------------- */
  const createPostWithMedia = async () => {
    dispatch(setCreating(true));

    handleClose();

    // 3️⃣ Background Logic
    (async () => {
      try {
        const successfulMedia = uploadedFiles.filter(
          (file) => file.status === "uploaded" || file.url
        );

        const extractedUrl = extractUrl(caption);
        const cleanedText = extractedUrl
          ? caption.replace(extractedUrl, "").trim()
          : caption.trim();

        const words = cleanedText.split(/\s+/);
        const hashtags = words
          .filter((word) => word.startsWith("#"))
          .map((tag) => tag.replace("#", ""));
        const mentions = words
          .filter((word) => word.startsWith("@"))
          .map((tag) => tag.replace("@", ""));

        let payload: any = {
          hashtags,
          mentions,
          media: successfulMedia.map((m) => ({
            url: m.url || m.uri,
            type: m.type,
            thumbnail_url: m.thumbnail_url,
          })),
          localities: location.localities,
          type: postType,
        };

        if (cleanedText && cleanedText.length > 0) {
          payload.text = cleanTextForAPI(cleanedText);
        }

        if (extractedUrl) {
          payload.link = extractedUrl;
        }

        if (location.visible_to) {
          payload.visible_to = location.visible_to;
          if (location?.friend_ids && location?.friend_ids.length > 0) {
            payload.visibility = location?.friend_ids;
          }
        }

        const res = await dispatch(createPost(cleanObject(payload)));

        if (createPost.fulfilled.match(res) || (res.payload && (res.payload.statusCode == 200 || res.payload.statusCode == 201))) {
          dispatch(fetchPost({ page: 1, limit: 10 }));
        }
      } catch (error) {
        console.log("Post Background Upload Error (Modal):", error);
        dispatch(setCreating(false));
      }
    })();
  };

  const getLocationDisplayText = () => {
    const parts = [];

    if (location.isGlobal) {
      parts.push("Global");
    } else {
      const count = location.localities.filter(l => l !== "global").length;
      if (count === 1) {
        const state = cityState?.find(s => s.state_id === location.localities[0]);
        parts.push(state?.state_name || "1 State");
      } else if (count > 1) {
        parts.push(`${count} States`);
      } else {
        parts.push("Global");
      }
    }

    if (location.visible_to) {
      const friendLabels = {
        all_friends: "All Friends",
        specific_friends: "Specific Friends",
        except_friends: "Friends Except"
      };
      parts.push(friendLabels[location.visible_to]);
    }

    return parts.join(" + ");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity onPress={handleClose} style={[styles.closeFloating, { top: closingHeight }]}>
          <Image source={Icons.cross} style={styles.closeIcon} />
        </TouchableOpacity>

        <View style={[styles.container, { height: modalHeight }]}>
          <View style={styles.handleBar} />
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Create Post</Text>

              <View style={styles.headerRight}>
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    style={styles.visibilityTag}
                    onPress={() => {
                      dispatch(getStateCity({ type: postType === 'pincode' ? "locality" : postType === 'district' ? "district" : "state" }));
                      setShowLocationDropdown(!showLocationDropdown)
                    }}
                  >
                    <Image source={Icons.mapPin} style={styles.mapIcon} />
                    <Text style={styles.visibilityText}>{getLocationDisplayText()}</Text>
                    <Image source={Icons.fillArrow} style={styles.arrowIcon} />
                  </TouchableOpacity>

                  {showLocationDropdown && (
                    <Pressable
                      onPress={() => setShowLocationDropdown(false)}
                      style={styles.dropdownOverlay}
                    >
                      <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={styles.dropdownContainer}
                      >
                        <LocationDropdown
                          visible={showLocationDropdown}
                          onClose={() => setShowLocationDropdown(false)}
                          onSelect={(selected) => setLocation(selected)}
                          defaultValue={location}
                        />
                      </Pressable>
                    </Pressable>
                  )}
                </View>

                <TouchableOpacity
                  onPress={createPostWithMedia}
                  disabled={isCreatingPost || uploading}
                >
                  {isCreatingPost ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.postText}>
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <PostComposer
              caption={caption}
              setCaption={handleCaptionChange}
              openDocumentPicker={openDocumentPicker}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              startAudioRecording={startAudioRecording}
              stopAudioRecording={stopAudioRecording}
              documentLoading={documentLoading}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              currentFormatting={currentFormatting}
              setCurrentFormatting={setCurrentFormatting}
              selection={selection}
              setSelection={setSelection}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
            />
          </>

        </View>
      </View>

    </Modal>
  );
};

export default CreatePostModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeFloating: {
    position: "absolute",
    zIndex: 20,
    height: 38,
    width: 38,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    height: 20,
    width: 20,
    tintColor: "#fff",
    resizeMode: "contain"
  },

  dropdownOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    right: -60,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
  },

  dropdownContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 999,
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  visibilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  visibilityText: {
    ...Typography.black12Medium,
    color: Colors.primary,
  },
  arrowIcon: {
    height: 12,
    width: 12,
    objectFit: 'contain'
  },
  mapIcon: {
    height: 14,
    width: 14,
    objectFit: 'contain',
  },
  title: {
    ...Typography.black16Bold
  },

  postText: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },

})