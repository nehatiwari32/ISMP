
export interface LoginFormValues {
  full_name: string;
  email_or_phone_number: string;
  user_type: "public" | "business";
  introducer_id: string;
  isAdult: boolean;
  isAgree: boolean;
  password: string;
  gender: string
}

export interface LoginProps {
  values: LoginFormValues;
  errors: any;
  touched: any;
  handleChange: (field: string) => (text: string) => void;
  setFieldValue: (field: string, value: any) => void;
  loginWithOtp: boolean;
  setLoginWithOtp: (value: boolean) => void;
}

export interface SignUpProps {
  values: LoginFormValues;
  errors: any;
  touched: any;
  scrollRef: any;
  handleChange: (field: string) => (text: string) => void;
  setFieldValue: (field: string, value: any) => void;
}



export interface PaginationParams {
  post_id?: string;
  story_id?: string;
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  target_type?: string;
  target_id?: any;
  category_id?: string;
  locality_ids?: any;
  activity_name?: string;
  status?: boolean;
  locality_info_category?: string;
  locality_problem_category?: string;
  friend_id?: string;
}

export interface User {
  _id?: string;
  full_name?: string;
  email_or_phone_number?: string;
  user_type?: string;
  introducer_id?: string;
  language_id?: string;
  user_id?: string;
}

export interface Languages {
  _id?: string;
  name?: string;
  code?: string;
}

export interface CityState {
  _id?: string;
  state_name?: string;
  state_id?: string;
  district_name?: string;
  district_id?: string;
  locality_name?: string;
  pincode?: string;
  locality_id?: string;
}

export interface StateCityParams {
  type: string;
  search: string
}

export type TempSignup = {
  full_name: string;
  email_or_phone_number: string;
  user_type: "public" | "business";
  introducer_id?: string;
  isAgree: boolean;
  gender: "male" | "female" | "others";
};

export type PermissionData = {
  _id: string;
  user_id: string;
  location_access?: boolean;
  notification_access?: boolean;
  sms_access?: boolean;
  contacts_access?: boolean;
  gallery_access?: boolean;
  camera_access?: boolean;
  files_access?: boolean;
};

export type Localities = {
  _id: string;
  latitude: string;
  longitude?: string;
  pincode?: string;
  state?: string;
  district?: string;
  is_default?: boolean;
};

export interface AuthState {
  token: string | null;
  user: User | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  otpData: any;
  login: boolean;
  languages: Languages[];
  selectedLanguage: Languages | null;
  tempSignupData: TempSignup | null,
  permissionData: PermissionData | null;
  localities: Localities[];
  isProfileComplete: boolean;
  cityState: CityState | any;
  content: null;
  appData: null
}

export interface MediaItem {
  url: string;
  type: "image" | "video" | "audio";
  thumbnail_url?: string;
}

export interface CreatePostPayload {
  text: string;
  hashtags?: string[];
  media?: MediaItem[];
  visibility?: any;
  link?: string;
  locality?: string;
}

export interface PostState {
  loading: boolean;
  success: boolean;
  error: string | null;
  posts: any[];
  hasMorePost: boolean;
  hasMoreComments: boolean;
  comments: any;
  commentLoading: boolean;
  commentPage: number;
  postType: string;
  selectLocality: null;
  localCategories: any;
  localityInfoList: any;
  totalPostCount: number,
  totalPeople: number,
  otherUserData: any | null,
  friendPosts: any,
  loadingFriendPosts: boolean,
  hasMoreFriendPosts: boolean,
  friendPostsPage: number
}

export interface UploadFilePayload {
  file: any; // can be image, video, or audio (local URI)
  type: "user" | "post" | "product" | string;
}

export interface UploadResponse {
  url: string;
  type: string;
  thumbnail_url?: string;
}

export interface DefaultLocation {
  _id: string;
  latitude: number;
  longitude: number;
  pincode: string;
  state: string;
  district: string;
  is_default: boolean;
}

export interface UserProfile {
  _id: string;
  user_id: string;
  cover_photo_url: string;
  description: string;
  dob: string;
  email: string;
  gender: string;
  is_status: string;
  name: string;
  phone_number: string;
  profile_photo_url: string;
  relationship: string;
  username: string;
  identity: string;
  interests: string[];
  profession: string[];
  default_location?: DefaultLocation;
}

export interface ProfileState {
  loading: boolean;
  uploading: boolean;
  progress: number;
  uploadedFiles: UploadResponse[];
  error: string | null;
  categories: any[];
  profilePayload: any;
  userProfile: UserProfile | null;
  FAQList: any;
  issueList: any;
  identityList: any;
  profileSettings: any;
  birthdayList: any;
  storyFiles: any;
  profileProgress: number;
  degreeList: any
}

export interface MediaFile {
  uri: string;
  id: string;
  type: "image" | "video" | "audio" | "document";
  status: "uploaded" | "pending";
  name?: string;
  fileSize?: number;
}

export interface FormattingState {
  bold: boolean;
  italic: boolean;
  color: string;
  align: "left" | "center" | "right";
}

export interface PostComposerProps {

  caption: string;
  setCaption: (t: string) => void;

  openDocumentPicker: () => void;

  isRecording: boolean;
  recordingDuration: number;
  startAudioRecording: () => void;
  stopAudioRecording: () => void;

  documentLoading: boolean;

  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;

  showColorPicker: boolean;
  setShowColorPicker: (v: boolean) => void;

  currentFormatting: FormattingState;
  setCurrentFormatting: any,

  selection: { start: number; end: number };
  setSelection: (sel: { start: number; end: number }) => void;
  showProfile?: boolean;

  backgroundColor: any
  setBackgroundColor: any
}

export interface StoryComposerProps {
  caption: string;
  setCaption: (t: string) => void;
  selectedMedia: any,
  setSelectedMedia: any,
  selectedMentions?: string[],
  setSelectedMentions?: (mentions: string[]) => void,
  selectedHashtags?: string[],
  setSelectedHashtags?: (hashtags: string[]) => void
}

export interface EmojiCount {
  [emoji: string]: number;
}

export interface StoryMedia {
  url: string;
  type: "image" | "video";
  thumbnail_url: string | null;
}

export interface StoryUser {
  name: string;
  username: string;
  profile_photo_url: string | null;
}

export interface LocalityDetail {
  _id: string;
  locality_name: string;
  pincode: string;
  state_id: string;
  state_name: string;
  district_id: string;
  district_name: string;
}

export interface StoryItem {
  _id: string;
  user_id: string;

  text: string | null;
  media: StoryMedia[];

  link: string | null;

  visibility: "public" | "friends" | "close_friends" | "private";
  visibility_ids: string[];

  localities: string[];
  tags: string[];

  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;

  emojis_count: EmojiCount;

  is_deleted: boolean;
  deleted_at: string | null;

  createdAt: string;
  updatedAt: string;

  user: StoryUser;
  localities_detail: LocalityDetail[];
}

export interface StoryState {
  loading: boolean;
  error: string | null;
  success: boolean;

  myStories: StoryItem[];
  otherStories: StoryItem[];
  mutedStories: StoryItem[];
  page: number;
  hasMoreStory: boolean;
}

export interface TabItem {
  label: string;
  value: string;
  showLabel?: boolean;
  isIcon?: boolean;
}

export interface EventCategory {
  _id: string;
  category_name: string;
}

export interface Event {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  latitude: number | null;
  longitude: number | null;
  event_type: string;
  entry_fee: number;
  media_url: string;
  localities: string[];
  terms_and_conditions: string;
  status: string;
  likes_count: number;
  emojis_count: any;
  views_count: number;
  shares_count: number;
  comments_count: number;
  reports_count: number;
  uninterested_count: number;
  createdAt: string;
  updatedAt: string;
  localities_detail: any[];
}

export interface CategoryWithEvents {
  category: EventCategory;
  items: Event[];
}

export interface EventState {
  loading: boolean;
  error: string | null;
  success: boolean;
  eventCategories: CategoryWithEvents[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}