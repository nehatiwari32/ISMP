import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { MAX_IMAGE_SELECTION, MAX_VIDEO_SELECTION, uploadMultipleFiles, uploadSingleFile } from "./helper";
import { Alert } from "react-native";
import { requestCameraPermission } from "./permission";

export const useMediaUpload = ({
  dispatch,
  uploadAction,
  bulkUploadAction,
}: any) => {
  const pickSingle = async ({
    from,
    type,
    setLoading,
    onUploaded,
  }: any) => {
    if (from === "camera") {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;
    }
    setLoading(true);

    try {
      const res =
        from === "camera"
          ? await launchCamera({ mediaType: "photo", quality: 0.7 })
          : await launchImageLibrary({ mediaType: "photo", quality: 0.7 });

      if (res.didCancel || !res.assets?.length) return;

      const url = await uploadSingleFile({
        file: res.assets[0],
        type,
        dispatch,
        uploadAction,
      });

      if (url) onUploaded(url);
    } finally {
      setLoading(false);
    }
  };

  const pickMultiple = async ({
    type,
    setLoading,
    onImagesUploaded,
    onVideosUploaded,
  }: any) => {
    setLoading(true);

    try {
      const res = await launchImageLibrary({
        mediaType: "mixed", // 👈 photos + videos
        selectionLimit: 0, // unlimited selection UI
        quality: 0.7,
      });

      if (res.didCancel || !res.assets?.length) return;

      const images = res.assets.filter(
        (a: any) => a.type?.startsWith("image")
      );
      const videos = res.assets.filter(
        (a: any) => a.type?.startsWith("video")
      );

      /* ---------- VALIDATION ---------- */
      if (images.length > MAX_IMAGE_SELECTION) {
        Alert.alert(
          "Limit exceeded",
          `You can upload only ${MAX_IMAGE_SELECTION} images`
        );
        return;
      }

      if (videos.length > MAX_VIDEO_SELECTION) {
        Alert.alert(
          "Limit exceeded",
          `You can upload only ${MAX_VIDEO_SELECTION} videos`
        );
        return;
      }

      /* ---------- UPLOAD IMAGES ---------- */
      if (images.length) {
        const imageUrls = await uploadMultipleFiles({
          files: images,
          type,
          dispatch,
          bulkUploadAction,
        });

        if (imageUrls.length && onImagesUploaded) {
          onImagesUploaded(imageUrls);
        }
      }

      /* ---------- UPLOAD VIDEOS ---------- */
      if (videos.length) {
        const videoUrls = await uploadMultipleFiles({
          files: videos,
          type,
          dispatch,
          bulkUploadAction,
        });

        if (videoUrls.length && onVideosUploaded) {
          onVideosUploaded(videoUrls);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { pickSingle, pickMultiple };
};
