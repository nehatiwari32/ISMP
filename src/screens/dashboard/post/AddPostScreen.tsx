import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AudioRecord from "react-native-audio-record";
import { pick } from "@react-native-documents/picker";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";

import {
  GradientAvatar,
  LocationDropdown,
  PostComposer,
  PostTabs,
  StoryComposer,
  ViewContainer,
} from "../../../components";

import { createPost, fetchPost } from "../../../redux/slices/postSlice";
import { createStory, fetchStories } from "../../../redux/slices/storySlice";

import { convertToHTML, extractUrl } from "../../../utils/helper";

import {
  addLocalFile,
  resetUploadState,
  uploadMedia,
} from "../../../redux/slices/profileSlice";

import { requestAudioPermission } from "../../../utils/permission";
import { RootState } from "../../../redux/store";
import { Icons } from "../../../assets/icons";
import { getStateCity } from "../../../redux/slices/authSlice";

const AddPostScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { uploadedFiles, userProfile } = useSelector((s: RootState) => s.profile);
  const route = useRoute()
  const { type } = route.params || ""

  /* ---------------- STATE ---------------- */
  const [activeTab, setActiveTab] = useState<"Post" | "Story">(type || "Post");
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [caption, setCaption] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<any>(null);
  const maxRecordingTimer = useRef<any>(null);

  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    color: Colors.primaryText,
    align: "left" as "left" | "center" | "right",
  });

  const [location, setLocation] = useState({
    isGlobal: true,
    localities: ["global"],
    visible_to: null,
    friend_ids: [],
  });

  /* ---------------- INIT AUDIO ---------------- */
  useEffect(() => {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: "audio.wav",
    });
    return () => AudioRecord.stop();
  }, []);

  /* ---------------- RESET FORM ---------------- */
  const resetScreen = () => {
    setCaption("");
    setSelectedMedia([]);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
    setShowLocationDropdown(false);
    setSelection({ start: 0, end: 0 });

    if (isRecording) AudioRecord.stop();
    clearInterval(recordingTimer.current);
    clearTimeout(maxRecordingTimer.current);

    setIsRecording(false);
    setRecordingDuration(0);

    setCurrentFormatting({
      bold: false,
      italic: false,
      color: Colors.primaryText,
      align: "left",
    });

    dispatch(resetUploadState());

    setLocation({
      isGlobal: true,
      localities: ["global"],
      visible_to: null,
      friend_ids: [],
    });
  };

  /* ---------------- AUDIO RECORD ---------------- */
  const startAudioRecording = async () => {
    const permission = await requestAudioPermission();
    if (!permission) return;

    await AudioRecord.start();
    setIsRecording(true);
    setRecordingDuration(0);

    recordingTimer.current = setInterval(() => {
      setRecordingDuration((p) => p + 1);
    }, 1000);

    maxRecordingTimer.current = setTimeout(stopAudioRecording, 8000);
  };

  const stopAudioRecording = async () => {
    if (!isRecording) return;

    clearInterval(recordingTimer.current);
    clearTimeout(maxRecordingTimer.current);

    const audioPath = await AudioRecord.stop();
    setIsRecording(false);

    if (recordingDuration < 5) {
      Alert.alert("Error", "Audio must be at least 5 seconds long");
      return;
    }

    const uri = Platform.OS === "ios" ? audioPath : `file://${audioPath}`;

    const uploadRes = await dispatch(
      uploadMedia({
        file: { uri, type: "audio/wav", fileName: `audio_${Date.now()}.wav` },
        type: "user",
      })
    ).unwrap();

    dispatch(
      addLocalFile({
        uri: uploadRes?.data,
        type: "audio",
        status: "uploaded",
        id: `aud-${Date.now()}`,
      })
    );
  };

  /* ---------------- DOCUMENT PICKER ---------------- */
  const openDocumentPicker = async () => {
    try {
      setDocumentLoading(true);

      const result = await pick({ type: ["application/pdf"], mode: "open" });
      if (!result?.[0]) return;
      const file = result[0];

      const uploadRes = await dispatch(
        uploadMedia({
          file: { uri: file.uri, fileName: file.name, type: file.type },
          type: "user",
        })
      ).unwrap();

      dispatch(
        addLocalFile({
          id: `doc-${Date.now()}`,
          uri: uploadRes?.data,
          type: "document",
          status: "uploaded",
          name: file.name,
          fileSize: file.size,
        })
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  /* ---------------- LOCATION LABEL ---------------- */
  const getLocationLabel = () => {
    if (location.isGlobal) return "Global";
    const count = location.localities.length;
    return count === 1 ? "1 State" : `${count} States`;
  };

  /* ---------------- POST: BUILD PAYLOAD ---------------- */
  const buildPostPayload = () => {
    const media = uploadedFiles
      .filter((f) => f.status === "uploaded" || f.url)
      .map((f) => ({
        url: f.url || f.uri,
        type: f.type,
      }));

    return {
      media,
      localities: location.localities,
      ...(location.isGlobal && { type: "global" }),
      ...(location.visible_to && {
        visible_to: location.visible_to,
        visibility: location.friend_ids,
      }),
    };
  };

  /* ---------------- STORY UPLOAD (SINGLE IMAGE) ---------------- */
  const createStoryWithMedia = async () => {
    if (selectedMedia.length === 0 && !caption.trim()) {
      Alert.alert("Validation", "Please add image or text");
      return;
    }
    setIsCreatingPost(true);

    try {
      let uploadedFile = null;

      if (selectedMedia.length > 0) {
        const file = selectedMedia[0]; // ONLY FIRST IMAGE

        const uploadRes = await dispatch(
          uploadMedia({
            file: {
              uri: file.uri,
              type: file.mime || file.type,
              fileName: file.fileName || `story_${Date.now()}.jpg`,
            },
            type: "user",
          })
        ).unwrap();

        uploadedFile = {
          url: uploadRes?.data?.url,
          type: file.mime?.includes("video") ? "video" : "image",
        };
      }

      const payload = {
        media: uploadedFile ? [uploadedFile] : [],
        text: caption.trim(),
        localities: location.localities,
        ...(location.visible_to && {
          visible_to: location.visible_to,
          visibility: location.friend_ids,
        }),
      };

      const res = await dispatch(createStory(payload));
      console.log('res>>>>>', res);
      if (res?.payload?.text) {
        dispatch(fetchStories({ page: 1, limit: 10 }));
        resetScreen();
        navigation.navigate("BottomTabs", { screen: "Home" });
      }
    } catch (err) {
      console.log('err>>>>>', err);

      Alert.alert("Error", "Failed to upload story");
    } finally {
      setIsCreatingPost(false);
    }
  };

  /* ---------------- CREATE POST ---------------- */
  const createPostWithMedia = async () => {
    const extractedUrl = extractUrl(caption);
    const cleanText = extractedUrl
      ? caption.replace(extractedUrl, "").trim()
      : caption.trim();

    const payload: any = {
      ...buildPostPayload(),
      hashtags: cleanText
        .split(/\s+/)
        .filter((w) => w.startsWith("#"))
        .map((h) => h.slice(1)),
    };

    if (cleanText) payload.text = convertToHTML(cleanText, currentFormatting);
    if (extractedUrl) payload.link = extractedUrl;

    if (!cleanText && !extractedUrl && payload.media.length === 0) {
      Alert.alert("Validation", "Please add media or text");
      return;
    }

    setIsCreatingPost(true);

    const res = await dispatch(createPost(payload));
    const code = Number(res?.payload?.statusCode);

    if (code === 200 || code === 201) {
      dispatch(fetchPost({ page: 1, limit: 10 }));
      resetScreen();
      navigation.navigate("BottomTabs", { screen: "Home" });
    }

    setIsCreatingPost(false);
  };

  /* ---------------- HEADER RIGHT BUTTON ---------------- */
  const rightBtn =
    isCreatingPost ? (
      <ActivityIndicator size="small" color={Colors.primary} />
    ) : activeTab === "Post" ? (
      "Post"
    ) : selectedMedia.length > 0 ? (
      "Post"
    ) : (
      ""
    );

  /* ---------------- FINAL UI ---------------- */
  return (
    <ViewContainer
      headerTitle={activeTab === "Post" ? "Create Post" : "Your Story"}
      rightText={rightBtn}
      onRightPress={
        activeTab === "Post" ? createPostWithMedia : createStoryWithMedia
      }
      containerStyle={{ paddingHorizontal: 0 }}
    >
      {(activeTab === "Post" ||
        (activeTab === "Story" && selectedMedia.length > 0)) && (
          <View style={styles.rowContainer}>
            <View style={styles.userSection}>
              <GradientAvatar
                source={
                  userProfile?.profile_photo_url
                    ? { uri: userProfile.profile_photo_url }
                    : Icons.placeholder
                }
                size={34}
                borderWidth={1}
              />
              <Text style={styles.userName}>{userProfile?.name}</Text>
            </View>

            {/* LOCATION SELECTOR */}
            <View>
              <TouchableOpacity
                style={styles.visibilityTag}
                onPress={() => {
                  dispatch(getStateCity({ type: "state" }));
                  setShowLocationDropdown((p) => !p);
                }}
              >
                <Image source={Icons.mapPin} style={styles.mapIcon} />
                <Text style={styles.visibilityText}>{getLocationLabel()}</Text>
                <Image source={Icons.fillArrow} style={styles.arrowIcon} />
              </TouchableOpacity>

              {showLocationDropdown && (
                <Pressable
                  onPress={() => setShowLocationDropdown(false)}
                  style={styles.dropdownOverlay}
                >
                  <Pressable
                    style={styles.dropdownContainer}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <LocationDropdown
                      visible={showLocationDropdown}
                      onClose={() => setShowLocationDropdown(false)}
                      defaultValue={location}
                      onSelect={setLocation}
                    />
                  </Pressable>
                </Pressable>
              )}
            </View>
          </View>
        )}

      {activeTab === "Post" ? (
        <PostComposer
          caption={caption}
          setCaption={setCaption}
          openDocumentPicker={openDocumentPicker}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          currentFormatting={currentFormatting}
          setCurrentFormatting={setCurrentFormatting}
          selection={selection}
          setSelection={setSelection}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          startAudioRecording={startAudioRecording}
          stopAudioRecording={stopAudioRecording}
          documentLoading={documentLoading}
          showProfile={false}
          backgroundColor={backgroundColor} // ⭐ NEW PROP
          setBackgroundColor={setBackgroundColor}
        />
      ) : (
        <StoryComposer
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          caption={caption}
          setCaption={setCaption}
        />
      )}

      <PostTabs active={activeTab} onChange={(t) => setActiveTab(t as any)} />
    </ViewContainer>
  );
};

export default AddPostScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    alignItems: "center",
  },
  userSection: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  userName: { ...Typography.black14Bold },
  visibilityTag: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 6,
    alignItems: "center",
  },
  visibilityText: {
    ...Typography.black12Medium,
    color: Colors.primary,
  },
  mapIcon: { width: 14, height: 14, objectFit: 'contain' },
  arrowIcon: { width: 12, height: 12, objectFit: 'contain' },
  dropdownOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    right: -2,
    bottom: 0,
    zIndex: 9999
  },
  dropdownContainer: { position: "absolute", right: 0 },
});
