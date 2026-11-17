import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';

type PermResult = 'granted' | 'blocked' | 'denied';

async function askLocationPermission(): Promise<PermResult> {
  try {
    const fine = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    })!;

    // For Android, check coarse too
    const coarse = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
      : null;

    // Check and request FINE location
    let fineRes = await check(fine);
    console.log('🔍 Fine Location Status:', fineRes);

    if (fineRes !== RESULTS.GRANTED) {
      fineRes = await request(fine);
      console.log('📝 Fine Location After Request:', fineRes);
    }

    // For Android, also check COARSE
    let coarseRes = RESULTS.GRANTED;
    if (coarse) {
      coarseRes = await check(coarse);
      if (coarseRes !== RESULTS.GRANTED) {
        coarseRes = await request(coarse);
      }
    }

    // Check if either is granted
    const granted = fineRes === RESULTS.GRANTED || coarseRes === RESULTS.GRANTED;
    if (granted) return 'granted';

    // Check if blocked (permanently denied)
    if (fineRes === RESULTS.BLOCKED || coarseRes === RESULTS.BLOCKED) {
      return 'blocked';
    }

    return 'denied';
  } catch (error) {
    console.log('⚠️ Permission Check Error:', error);
    return 'denied';
  }
}

export async function ensureLocationPermissionOrOpenSettings(): Promise<boolean> {
  const res = await askLocationPermission();
  console.log('✅ Permission Result:', res);

  if (res === 'granted') return true;

  if (res === 'blocked') {
    // Don't auto-open settings, let the component handle it
    return false;
  }

  return false;
}

export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    // Small delay to ensure permissions are settled
    setTimeout(() => {
      console.log('📡 Starting location fetch...');

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location fetched successfully');
          resolve(position);
        },
        (error) => {
          console.log('❌ Geolocation Error:', error.code, error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased to 20 seconds
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    }, 500); // Reduced delay
  });
}

export const requestPermission = async (albumName: string = "Recent"): Promise<boolean> => {
  try {
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        const imageStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        const videoStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

        let finalImage = imageStatus;
        let finalVideo = videoStatus;

        // Request image permission if not granted
        if (imageStatus !== RESULTS.GRANTED) {
          finalImage = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        }

        // Request video permission when viewing Videos album
        if (albumName === "Videos" && videoStatus !== RESULTS.GRANTED) {
          finalVideo = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
        }

        // If permanently blocked
        if (finalImage === RESULTS.BLOCKED || (albumName === "Videos" && finalVideo === RESULTS.BLOCKED)) {
          Alert.alert(
            "Permission Required",
            "Please allow photo/video access in Settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => openSettings() },
            ]
          );
          return false;
        }

        // Accept LIMITED access as well
        const hasImageAccess = finalImage === RESULTS.GRANTED || finalImage === RESULTS.LIMITED;
        const hasVideoAccess = finalVideo === RESULTS.GRANTED || finalVideo === RESULTS.LIMITED || albumName !== "Videos";

        return hasImageAccess && hasVideoAccess;
      } else {
        // Android 12 or below
        const storage = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        return storage === RESULTS.GRANTED;
      }
    } else {
      // iOS
      const iosPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return iosPermission === RESULTS.GRANTED || iosPermission === RESULTS.LIMITED;
    }
  } catch (error) {
    console.log("Permission error:", error);
    return false;
  }
};

export const requestAudioPermission = async (): Promise<boolean> => {
  try {
    const permission =
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.RECORD_AUDIO
        : PERMISSIONS.IOS.MICROPHONE;

    const checkResult = await check(permission);
    console.log("Permission check result:", checkResult);

    // Already granted
    if (checkResult === RESULTS.GRANTED) {
      return true;
    }

    // Denied means user never granted → we should request now
    if (checkResult === RESULTS.DENIED) {
      const requestResult = await request(permission);
      console.log("Permission request result:", requestResult);
      return requestResult === RESULTS.GRANTED;
    }

    // Blocked → must open settings
    if (checkResult === RESULTS.BLOCKED) {
      Alert.alert(
        "Microphone Permission Required",
        "Please enable microphone permission from settings to record audio.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
      return false;
    }

    // For any other case, request normally
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;

  } catch (err) {
    console.log("Permission Error:", err);
    return false;
  }
};


export const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ]);

    return (
      granted['android.permission.CAMERA'] === 'granted'
    );
  } catch (err) {
    return false;
  }
};

export const requestOtpPermission = async () => {
  // ✅ iOS: OTP autofill handled by system
  if (Platform.OS === "ios") {
    return true;
  }

  const permission = PERMISSIONS.ANDROID.RECEIVE_SMS;

  // 1️⃣ Check current permission status
  const result = await check(permission);

  // ✅ Already granted
  if (result === RESULTS.GRANTED) {
    return true;
  }

  // ❌ Permanently denied (Don't ask again)
  if (result === RESULTS.BLOCKED) {
    Alert.alert(
      "Permission Required",
      "To auto-read OTP, please enable SMS permission from settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => openSettings(),
        },
      ]
    );
    return false;
  }

  // 2️⃣ Ask for permission
  const req = await request(permission);

  // ✅ Granted after request
  if (req === RESULTS.GRANTED) {
    return true;
  }

  // ❌ Denied
  Alert.alert(
    "Permission Required",
    "SMS permission is required to auto-read OTP. You can enable it from settings.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => openSettings(),
      },
    ]
  );

  return false;
};