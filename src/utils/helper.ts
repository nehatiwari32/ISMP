import { Alert, Dimensions, Linking, PixelRatio, Platform, ToastAndroid } from 'react-native';
import moment from 'moment';
import RNFS from "react-native-fs";

import { Icons } from '../assets/icons';
import { Colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MAX_SELECTION = 10;
export const MAX_IMAGE_SELECTION = 5;
export const MAX_VIDEO_SELECTION = 2;

export const DESCRIPTION_LIMIT = 250;
const BASE_WIDTH = 375;

export const scaleFont = (fontSize: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = fontSize * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const getTimeAgo = (dateString: string) => {
  if (!dateString) return "";
  const now = moment();
  const date = moment(dateString);
  const diffSeconds = now.diff(date, "seconds");
  const diffMinutes = now.diff(date, "minutes");
  const diffHours = now.diff(date, "hours");
  const diffDays = now.diff(date, "days");
  const diffMonths = now.diff(date, "months");
  const diffYears = now.diff(date, "years");

  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};


export const formatFullDate = (dateString: any) => {
  if (!dateString) return "";
  return moment(dateString).format("DD MMMM YYYY");
};

export const capitalizeFirstLetter = (text: string = "") => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const extractUrl = (value) => {
  const match = value.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
};

export const convertToHTML = (text: string, formatting: any, backgroundColor?: string | null) => {
  let html = text;

  // Bold
  if (formatting.bold) {
    html = `<b>${html}</b>`;
  }

  // Italic
  if (formatting.italic) {
    html = `<i>${html}</i>`;
  }

  // Color (text color)
  if (formatting.color && formatting.color !== '#000000') {
    html = `<span style="color:${formatting.color}">${html}</span>`;
  }

  // ⭐ Background Color + Alignment wrapper
  if (backgroundColor || (formatting.align && formatting.align !== "left")) {
    const styles: string[] = [];

    if (backgroundColor) {
      styles.push(`background-color:${backgroundColor}`);
      styles.push('padding:16px');
      styles.push('border-radius:8px');
      styles.push('min-height:150px');
      styles.push('display:flex');
      styles.push('align-items:center');
      styles.push('justify-content:center');
    }

    if (formatting.align && formatting.align !== "left") {
      styles.push(`text-align:${formatting.align}`);
    }

    html = `<div style="${styles.join(';')}">${html}</div>`;
  }

  return html;
};

export const openDocument = async (url) => {
  try {
    const extension = url.split('.').pop().split('?')[0];
    const fileName = `download_${Date.now()}.${extension}`;
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    const download = await RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
    }).promise;

    if (download.statusCode === 200) {
      if (Platform.OS === "android") {
        ToastAndroid.show("📁 File downloaded", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "File has been downloaded");
      }
      console.log("FILE SAVED TO:", path);
    } else {
      console.log("Download failed:", download.statusCode);
    }
  } catch (error) {
    console.log("Download error:", error);
  }
};

export interface InviteData {
  share_text: string;
  share_url: string;
}

export const buildInviteMessage = (data: InviteData) => {
  if (!data) return "";

  // ✅ Text + URL both included (safe)
  return `${data.share_text}\n${data.share_url}`;
};

export const sendInviteSMS = async (
  phone: string,
  inviteData: any
) => {
  try {
    const message = buildInviteMessage(inviteData);

    if (!message) {
      Alert.alert("Error", "Invite message is empty");
      return;
    }

    const smsUrl =
      Platform.OS === "android"
        ? `sms:${phone}?body=${encodeURIComponent(message)}`
        : `sms:${phone}&body=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(smsUrl);
    if (!supported) {
      Alert.alert("Error", "SMS app not available");
      return;
    }

    await Linking.openURL(smsUrl);
  } catch (error) {
    Alert.alert("Error", "Failed to open SMS app");
  }
};

export const calculateProfileProgress = (

  addresses: any[] = [],
  profileSteps: {
    step1?: boolean;
    step2?: boolean;
    step3?: boolean;
  }
) => {
  const pincodes = addresses.length;
  const { step1, step2, step3 } = profileSteps

  if (pincodes === 0) return 20;

  if (pincodes >= 1 && !step1 && !step2 && !step3) return 40;

  if (pincodes >= 1 && step1 && !step2 && !step3) return 60;

  if (pincodes >= 1 && step1 && step2 && !step3) return 80;

  if (pincodes >= 1 && step1 && step2 && step3 && pincodes < 3) return 90;

  if (pincodes >= 3 && step1 && step2 && step3) return 100;

  return 20;
};

export const formatAddress = (item) => {
  const parts = [];

  if (item?.locality_name) parts.push(item.locality_name);
  if (item?.district) parts.push(item.state_name);
  if (item?.state) parts.push(item.district_name);

  const mainAddress = parts.join(", ");

  const pincodeText = item?.pincode ? `Pincode: ${item.pincode}` : "";

  return `${mainAddress}${mainAddress && pincodeText ? " — " : ""}${pincodeText}`;
};

export const cleanObject = (obj: any) => {
  const cleaned: any = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === "" || value === null || value === undefined) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return;
    cleaned[key] = value;
  });

  return cleaned;
};

export const formatCount = (count: number = 0): string => {
  if (count < 1000) return `${count}`;

  if (count < 1_000_000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }

  if (count < 1_000_000_000) {
    const m = count / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }

  const b = count / 1_000_000_000;
  return `${b % 1 === 0 ? b : b.toFixed(1)}B`;
};


export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const dateNum = date.getDate();
  return `${day}, ${month} ${dateNum}`;
};

export const BASE_MENU_ORDER = [
  "SAVE",
  "SEARCH",
  "ADD_USER",
  "UNFRIEND",
  "FOLLOW",
  "UNFOLLOW",
  "BLOCK",
  "WHY_SEEING",
  "NOT_INTERESTED",
  "SEND_MESSAGE",
  "REPORT",
] as const;

export const getMenuOptionMap = ({
  savedState,
  friendState,
  followingState,
  blockState,
}: any) => ({
  SAVE: {
    show: true,
    label: savedState ? "Unsave Post" : "Save",
    icon: Icons.save,
    color: Colors.primaryText,
  },

  SEARCH: {
    show: true,
    label: "Search",
    icon: Icons.search,
    color: Colors.primaryText,
  },

  ADD_USER: {
    show: !friendState && !blockState,
    label: "Add User",
    icon: Icons.addUser,
    color: Colors.primaryText,
  },

  UNFRIEND: {
    show: friendState && !blockState,
    label: "Unfriend User",
    icon: Icons.unfriend,
    color: Colors.primaryText,
  },

  FOLLOW: {
    show: !followingState && !blockState,
    label: "Follow User",
    icon: Icons.notification,
    color: Colors.primaryText,
  },

  UNFOLLOW: {
    show: followingState && !blockState,
    label: "Unfollow User",
    icon: Icons.unfollowUser,
    color: Colors.primaryText,
  },

  BLOCK: {
    show: true,
    label: blockState ? "Unblock User" : "Block User",
    icon: Icons.blockUser,
    color: Colors.primaryText,
  },

  WHY_SEEING: {
    show: true,
    label: "Why seeing this Post?",
    icon: Icons.whySeeing,
    color: Colors.primaryText,
  },

  NOT_INTERESTED: {
    show: true,
    label: "Not Interested",
    icon: Icons.notInterested,
    color: "#FF6B6B",
  },

  SEND_MESSAGE: {
    show: true,
    label: "Send Message",
    icon: Icons.sendMessage,
    color: Colors.primaryText,
  },

  REPORT: {
    show: true,
    label: "Report",
    icon: Icons.report,
    color: "#FF4444",
  },
});

export const addressCleanObject = (obj: any) => {
  const cleaned = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Keep pincode even if empty
    if (key === "pincode") {
      cleaned[key] = value;
      return;
    }

    if (value === "" || value === null || value === undefined) return;

    cleaned[key] = value;
  });

  return cleaned;
}

export const saveCredentials = async (email: string, password: string) => {
  try {
    await AsyncStorage.setItem("remember_credentials", JSON.stringify({ email, password }));
  } catch (err) {
    console.log("Save error", err);
  }
};

export const getCredentials = async () => {
  try {
    const data = await AsyncStorage.getItem("remember_credentials");
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.log("Fetch error", err);
    return null;
  }
};

export const clearCredentials = async () => {
  try {
    await AsyncStorage.removeItem("remember_credentials");
  } catch (err) {
    console.log("Remove error", err);
  }
};

export const buildQuery = (params: Record<string, any>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Special handling for arrays
      if (Array.isArray(value) && value.length > 0) {
        query.append(key, JSON.stringify(value));
      }
      // For other values
      else if (!Array.isArray(value)) {
        query.append(key, String(value));
      }
    }
  });

  return query.toString();
};

export const uploadSingleFile = async ({
  file,
  type,
  dispatch,
  uploadAction,
}: {
  file: any;
  type: string;
  dispatch: any;
  uploadAction: any;
}) => {
  const localPath = file.uri.replace("file://", "");
  const destPath = `${RNFS.TemporaryDirectoryPath}/${file.fileName || Date.now()}.jpg`;

  try {
    await RNFS.copyFile(localPath, destPath);

    const result = await dispatch(
      uploadAction({
        file: { ...file, uri: "file://" + destPath },
        type,
      })
    ).unwrap();

    await RNFS.unlink(destPath).catch(() => { });

    return result?.data?.url || null;
  } catch (err) {
    console.error("Upload error", err);
    Alert.alert("Error", "Failed to upload image");
    return null;
  }
};

export const uploadMultipleFiles = async ({
  files,
  type,
  dispatch,
  bulkUploadAction,
}: {
  files: any[];
  type: string;
  dispatch: any;
  bulkUploadAction: any;
}) => {
  try {
    const copiedFiles: any[] = [];

    for (const file of files) {
      const localPath = file.uri.replace("file://", "");
      const destPath = `${RNFS.TemporaryDirectoryPath}/${file.fileName || Date.now()}.jpg`;

      await RNFS.copyFile(localPath, destPath);
      copiedFiles.push({ ...file, uri: "file://" + destPath });
    }

    const result = await dispatch(
      bulkUploadAction({ files: copiedFiles, type })
    ).unwrap();

    for (const f of copiedFiles) {
      await RNFS.unlink(f.uri.replace("file://", "")).catch(() => { });
    }

    return result?.data?.urls || [];
  } catch (err) {
    console.error("Bulk upload error", err);
    Alert.alert("Error", "Failed to upload images");
    return [];
  }
};

// 👇 Export screen values (used in layouts)
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const topTabs = [
  { label: "Global", icon: Icons.globe, isArrow: true },
  { label: "Identity", icon: Icons.identity },
  { label: "Near Me", icon: Icons.location, },
  { label: "Localz", icon: Icons.locality, isArrow: true },
  { label: "Friends", icon: Icons.fnds },
  { label: "Market", icon: Icons.market },
  { label: "Karma", icon: Icons.karma },
  { label: "QA", icon: Icons.QA, isArrow: true },
  { label: "Fund", icon: Icons.fund },
  { label: "Professional", icon: Icons.professional },
  { label: "Community", icon: Icons.community },
  { label: "Groups", icon: Icons.group },
  { label: "Help People", icon: Icons.help, isArrow: true },
  { label: "Earn", icon: Icons.earn },
  { label: "Trending", icon: Icons.trending },
];

export const permissionArray =
  [
    {
      key: "location",
      label: "Location Access",
      desc: "Auto-detect your current location.",
      icon: Icons.location,
    },
    {
      key: "notification",
      label: "Notification Access",
      desc: "Get alerts and updates instantly.",
      icon: Icons.notification,
    },
    {
      key: "sms",
      label: "SMS Access",
      desc: "Send verification codes.",
      icon: Icons.message,
    },
    {
      key: "contacts",
      label: "Contacts Access",
      desc: "Find and connect with your friends.",
      icon: Icons.contact,
    },
    {
      key: "gallery",
      label: "Gallery Access",
      desc: "Upload photos and videos from your gallery.",
      icon: Icons.gallery,
    },
    {
      key: "camera",
      label: "Camera Access",
      desc: "Take photos or record videos directly.",
      icon: Icons.camera,
    },
    {
      key: "files",
      label: "Files Access",
      desc: "Share and save files easily within the app.",
      icon: Icons.file,
    },
  ]

export const relationStatus = [
  { id: 1, label: "Single", value: "single" },
  { id: 2, label: "Married", value: "married" },
  { id: 3, label: "Divorced", value: "divorced" },
  { id: 3, label: "Prefer Not to Say", value: "prefer_not_to_say" },
]

export const EMOJI_CATEGORIES = {
  Smileys: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
  Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  Gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤝", "🙏"],
  Animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆"],
  Food: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒"],
  Objects: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋", "⛸️"],
};

export const REACTED_EMOJIS = [
  { symbol: "👍", name: "Thumbs up" },
  { symbol: "😂", name: "Funny" },
  { symbol: "😢", name: "Sad" },
  { symbol: "😮", name: "Surprised" },
  { symbol: "👏", name: "Clap" },
  { symbol: "😡", name: "Angry" },
];

export const backgroundColors = [
  '#000000', // Black (default)
  '#FF6B00', // Orange
  '#00FFFF', // Cyan
  '#FFFF00', // Yellow
  '#0099FF', // Blue
  '#999999', // Gray
];

export const menuOptions = [
  { icon: Icons.save, label: "Save", color: Colors.primaryText },
  { icon: Icons.search, label: "Search", color: Colors.primaryText },
  { icon: Icons.addUser, label: "Add User", color: Colors.primaryText },
  { icon: Icons.unfriend, label: "Unfriends User", color: Colors.primaryText },
  { icon: Icons.notification, label: "Follow User", color: Colors.primaryText },
  { icon: Icons.unfollowUser, label: "Unfollow User", color: Colors.primaryText },
  { icon: Icons.blockUser, label: "Block User", color: Colors.primaryText },
  { icon: Icons.whySeeing, label: "Why seeing this Post?", color: Colors.primaryText },
  { icon: Icons.notInterested, label: "Not Interested", color: "#FF6B6B" },
  { icon: Icons.sendMessage, label: "Send Message", color: Colors.primaryText },
  { icon: Icons.report, label: "Report", color: "#FF4444" },
];

export const ProfileSections = [
  {
    key: "membership",
    title: "My Membership",
    icon: Icons.specialist,
    items: [
      { label: "Locality", screen: "LocalityScreen" },
      { label: "My Locality Head", screen: "MyLocalityHeadScreen" },
    ],
  },
  {
    key: "switchAccount",
    title: "Switch Account",
    icon: Icons.userSwitch,
    items: [
      { label: "Switch to Business Account", screen: "SwitchBusinessScreen" },
      { label: "Become Partner User", screen: "PartnerUserScreen" },
      { label: "Become Premium User", screen: "PremiumUserScreen" },
    ],
  },
  {
    key: "help",
    title: "Help",
    icon: Icons.user,
    items: [
      { label: "FAQ", screen: "FAQScreen" },
      { label: "Support", screen: "SupportScreen" },
      { label: "Community Guidelines", screen: "CommunityGuidelines" },
    ],
  },
  {
    key: "account",
    title: "Account Setting",
    icon: Icons.user,
    items: [
      { label: "User Profile Settings", screen: "UserProfileSettingsScreen" },
      { label: "Security", screen: "SecurityScreen" },
      { label: "Language Selection", screen: "LanguageScreen" },
      { label: "Notifications", screen: "NotificationSettingsScreen" },
      { label: "Posting Settings", screen: "PostingSettingsScreen" },
      { label: "Your Story", screen: "YourStoryScreen" },
      { label: "General", screen: "GeneralSettingsScreen" },
      { label: "My Localities", screen: "MyLocalityScreen" },
    ],
  },
  {
    key: "content",
    title: "Content Pages",
    icon: Icons.content,
    items: [
      { label: "About Us", screen: "AboutUsScreen", type: "about" },
      { label: "Terms & Condition", screen: "TermsAndConditionsScreen", type: "terms" },
      { label: "Community Guidelines", screen: "CommunityGuidelines", type: "guidelines" },
    ],
  },
];

export const menuItems = [
  { id: 1, title: "Send Message", icon: Icons.sendMessage },
  { id: 2, title: "Follow User", icon: Icons.notification },
  { id: 3, title: "Block User", icon: Icons.blockUser },
  { id: 4, title: "Unfriend User", icon: Icons.unfriend },
];

export const postCategoryData = [
  { id: 1, count: 14, title: "Groups Post", icon: Icons.group },
  { id: 2, count: 50, title: "Communities Post", icon: Icons.communityPost },
  { id: 3, count: 24, title: "Global Post", icon: Icons.globe },
  { id: 4, count: 10, title: "Locality Post", icon: Icons.locality1 },
  { id: 5, count: 24, title: "Identity", icon: Icons.identity },
  { id: 6, count: 30, title: "Profession Conn.", icon: Icons.professional },
  { id: 7, count: 12, title: "Karma Posts", icon: Icons.karma },
  { id: 8, count: 10, title: "Events", icon: Icons.event },
  { id: 9, count: 23, title: "Help", icon: Icons.help },
  { id: 10, count: 16, title: "Que/Ans Post", icon: Icons.QA },
  { id: 11, count: 10, title: "Localz Problems", icon: Icons.locazPrblm },
  { id: 12, count: 12, title: "Localz Info", icon: Icons.locazInfo },
  { id: 13, count: 10, title: "Market", icon: Icons.graph },
  { id: 14, count: 12, title: "Fund Raising", icon: Icons.fund },
  { id: 15, count: 22, title: "Earn", icon: Icons.earn },
  { id: 16, count: 22, title: "LMS Post", icon: Icons.lms },
  { id: 17, count: 10, title: "Vibez", icon: Icons.vibe },
];

export const chatHeader = [
  { label: "Friends Chat", value: "friends" },
  { label: "Other Chat", value: "other" },
  { label: "App Chat", value: "app" },
  { label: "Friend Request", value: "requests" },
]

export const SPECIAL_CHARS = ["@", "#", "_", "!", "$"];

export const degreeOptions = [
  { id: "btech", label: "B.Tech", value: "btech" },
  { id: "be", label: "B.E.", value: "be" },
  { id: "bsc", label: "B.Sc", value: "bsc" },
  { id: "ba", label: "B.A", value: "ba" },
  { id: "mba", label: "MBA", value: "mba" },
];
export const friendsTab = [
  { label: "Friend Request", value: "friend_request" },
  { label: "Suggestions", value: "suggestion" },
  { label: "Your Friends", value: "your_friends" },
  { label: "Contacts", value: "contact" },
]

export const eventsTab = [
  { label: "Categories", isIcon: true, value: "categories" },
  { label: "Near Me", value: "near me" },
  { showLabel: false, value: "near me" },
  { label: "Trending", value: "trending" },
  { label: "Suggestion", value: "suggestion" },
  { label: "Last chance", value: "last_chance" },
]

export const securityOptions = [
  { title: "Privacy Settings", route: "PrivacySettingScreen" },
  { title: "Change Password", route: "ChangePasswordScreen" },
  { title: "Two factor Authentication", route: "TwoFactorAuthScreen" },
  { title: "Permissions", route: "Permissions" },
];

export const privacySettings = [
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email Address" },
  { key: "profile", label: "User profile" },
  { key: "image", label: "Profile image" },
  { key: "school", label: "School" },
  { key: "college", label: "College" },
  { key: "location", label: "Location" },
  { key: "profession", label: "Profession" },
  { key: "work", label: "Work" },
  { key: "dob", label: "DOB" },
  { key: "identity", label: "Identity" },
  { key: "interests", label: "Interests" },
];

export const DROPDOWN_OPTIONS = {
  qa: [
    {
      id: "global",
      label: "Global",
      icon: Icons.globe,
      type: "global",
    },
    {
      id: "local",
      label: "Local",
      icon: Icons.location,
      type: "local",
    },
  ],

  localz: [
    {
      id: "locality_info",
      label: "Locality Information",
      icon: Icons.localityInfo,
      type: "locality_info",
    },
    {
      id: "locality_problems",
      label: "Locality Problem / News",
      icon: Icons.localityPrblm,
      type: "locality_problems",
    },
  ],
};