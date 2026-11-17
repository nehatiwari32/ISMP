import { buildQuery } from "../utils/helper";
import { PaginationParams, StateCityParams } from "../utils/interfaces";

export default {
  //Auth
  languages: () => ({ base: "auth", url: "auth/get-languages" }),
  login: () => ({ base: "auth", url: "auth/login" }),
  loginWithOtp: () => ({ base: "auth", url: "auth/login-with-otp" }),
  sendOtp: () => ({ base: "auth", url: "auth/send-otp" }),
  verifyOtp: () => ({ base: "auth", url: "auth/verify-otp" }),
  signup: () => ({ base: "auth", url: "auth/signup" }),
  signupResend: () => ({ base: "auth", url: "auth/signup/resend-otp" }),
  enableGhoast: () => ({ base: "auth", url: "auth/ghost-mode" }),
  forgotSendOtp: () => ({ base: "auth", url: "auth/forgot-password/send-otp" }),
  forgotVerifyOtp: () => ({ base: "auth", url: "auth/forgot-password/verify-otp" }),
  resetPassword: () => ({ base: "auth", url: "auth/forgot-password/reset" }),
  checkExistingId: () => ({ base: "auth", url: "auth/check-user-id" }),
  getLoginProfile: () => ({ base: "auth", url: "auth/get-profile" }),
  getCategory: () => ({ base: "auth", url: `profile/category/list` }),
  addCategory: () => ({ base: "auth", url: "profile/category/add" }),
  getIntrest: () => ({ base: "auth", url: `profile/interests/list` }),
  addIntrest: () => ({ base: "auth", url: "profile/interests/add" }),
  getIdentity: () => ({ base: "auth", url: "profile/identity/list" }),
  updateProfile: () => ({ base: "auth", url: "profile/update" }),
  getOrganization: (params: PaginationParams) => ({ base: "auth", url: `profile/institute/list?organization_type=${params.type}&search=${params.search}` }),
  addOrganization: () => ({ base: "auth", url: "profile/institute/add" }),
  updateEducation: () => ({ base: "auth", url: "profile/education" }),
  updateWork: () => ({ base: "auth", url: "profile/work" }),
  businessProfile: () => ({ base: "auth", url: 'profile/business/fetch' }),
  addProfession: () => ({ base: "auth", url: "profile/profession/add" }),
  getProfession: () => ({ base: "auth", url: 'profile/profession/list' }),
  publicProfile: () => ({ base: "auth", url: 'profile/fetch' }),
  updateBusinessProfile: () => ({ base: "auth", url: "profile/business/update" }),
  updateSettings: () => ({ base: 'auth', url: "profile-settings/update" }),
  fetchSeetings: () => ({ base: 'auth', url: "profile-settings/fetch" }),
  getPermission: () => ({ base: "auth", url: "permissions/fetch" }),
  updatePermission: () => ({ base: "auth", url: "permissions/update" }),
  signInWithOtpSend: () => ({ base: "auth", url: "auth/signin-with-otp" }),
  verifySinginSendOtp: () => ({ base: "auth", url: "auth/verify-signin-otp" }),
  basicDetails: () => ({ base: "auth", url: "auth/basic-details" }),
  randomSuggestion: () => ({ base: "auth", url: `address/suggested-users` }),
  getAppURLLink: () => ({ base: "auth", url: "permissions/share-app" }),
  getDegreeList: () => ({ base: "auth", url: "profile/degree/list" }),
  addDegree: () => ({ base: "auth", url: "profile/degree/add" }),

  getStateOrCity: (params: StateCityParams) => {
    let url = `address/locality?type=${params.type}`;

    if (params.search) {
      url += `&search=${params.search}`;
    }

    return { base: "auth", url };
  },

  addLocality: () => ({ base: "auth", url: "address/locality" }),
  addUserAddresses: () => ({ base: "auth", url: "address/locality/user-localities" }),
  updateLocality: (id: string) => ({ base: "auth", url: `address/locality/${id}` }),
  deleteLocality: (id: string) => ({ base: "auth", url: `address/locality/${id}` }),

  uploadFile: () => "upload-file",
  bulkUpload: () => "bulk-upload",

  //Like
  getLike: (params: PaginationParams) => ({ base: "like", url: `like?target_type=${params?.target_type}&target_id=${params?.target_id}&page=${params.page}&limit=${params?.limit}` }),
  likeURL: () => ({ base: "like", url: "like" }),
  emojiReaction: () => ({ base: "like", url: "emoji/react" }),

  //Comment
  commentURL: () => ({ base: "like", url: "comments" }),
  getCommentURL: (params?: PaginationParams) => {
    let url = "comments";

    if (params) {
      const queryParams = new URLSearchParams();

      if (params.post_id) queryParams.append("post_id", params.post_id);
      if (params.story_id) queryParams.append("story_id", params.story_id);
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));

      const queryString = queryParams.toString();
      if (queryString) url = `${url}?${queryString}`;
    }

    return { base: "like", url };
  },

  //Post
  createPost: () => ({ base: "post", url: "post" }),
  getPosts: (params: PaginationParams) => {
    return {
      base: "post",
      url: `posts?${buildQuery(params)}`,
    };
  },
  getOtherUserProfile: (userId: string) => ({ base: "post", url: `profile-details?user_id=${userId}` }),
  getHashtags: (params: PaginationParams) => {
    return {
      base: "post",
      url: `trending-hashtags?${buildQuery(params)}`,
    };
  },
  postDetails: (postId: string) => ({ base: "post", url: `post/view?post_id=${postId}` }),
  savePost: () => ({ base: "post", url: 'save' }),
  unSavedPost: () => ({ base: "post", url: 'unsave' }),
  notIntrested: () => ({ base: 'post', url: 'public/not-interested' }),
  reportPost: () => ({ base: 'post', url: 'public/report' }),
  getSavedPost: (params: PaginationParams) => ({ base: "post", url: `fetch?${buildQuery(params)}` }),
  locazInfo: (params: PaginationParams) => ({ base: "post", url: `locality-info/list?${buildQuery(params)}` }),
  locazCategory: (params: PaginationParams) => ({ base: "post", url: `locality-problem-categories?${buildQuery(params)}` }),
  eventList: (params: PaginationParams) => ({ base: "post", url: `events?${buildQuery(params)}` }),
  frndPost: (params: any) => ({ base: "post", url: `friend-posts?friend_id=${params?.friend_id}&type=${params?.type}` }),
  addEvent: () => ({ base: "post", url: `events` }),
  deleteEvent: (eventId: string) => ({ base: "post", url: `events?event_id=${eventId}` }),
  viewEvent: (eventId: string) => ({ base: "post", url: `events/view?event_id=${eventId}` }),

  //Social
  searchUser: (search: string) => ({ base: 'social', url: `search/users?q=${search}` }),
  recentSearchHistory: (params: PaginationParams) => ({ base: 'social', url: `recent-search?${buildQuery(params)}` }),
  deleteSearch: () => ({ base: 'social', url: "recent-search" }),
  suggestedFrnd: (params: PaginationParams) => ({
    base: "social",
    url: `suggested-friends?${buildQuery(params)}`,
  }),
  sendFrndRequest: () => ({ base: 'social', url: "friend-request/send" }),
  cancelFrndRequesst: () => ({ base: 'social', url: "friend-request/cancel" }),
  acceptFrndRequesst: () => ({ base: 'social', url: "friend-request/accept" }),
  rejectFrndRequesst: () => ({ base: 'social', url: "friend-request/reject" }),
  getFrndRequst: (params: PaginationParams) => ({ base: 'social', url: `friend-request?${buildQuery(params)}` }),
  getFrnd: (params: PaginationParams) => ({
    base: "social",
    url: `friends?${buildQuery(params)}`,
  }),

  removeSuggestedFrnd: () => ({ base: 'social', url: 'suggested-friends/remove' }),
  followUser: () => ({ base: 'social', url: 'follow' }),
  unfollowUser: () => ({ base: 'social', url: 'follow/remove' }),

  blockUser: () => ({ base: 'social', url: 'block' }),
  getFollowers: (params: PaginationParams) => ({ base: 'social', url: `followers?${buildQuery(params)}` }),
  getFollowingList: (params: PaginationParams) => ({ base: 'social', url: `following?${buildQuery(params)}` }),

  getStaticContent: (params: string) => ({ base: 'setting', url: `static-content?content_type=${params}` }),
  addSupport: () => ({ base: 'setting', url: "support" }),
  getIssues: () => ({ base: "setting", url: "support/issue-types" }),
  getFAQ: () => ({ base: 'setting', url: `faq?page=1&limit=100` }),
  getSupportList: (params: PaginationParams) => ({ base: 'setting', url: `support/list?${buildQuery(params)}` }),
  getBirthdayList: () => ({ base: 'setting', url: `birthdays` }),
  changePSW: () => ({ base: 'setting', url: `change-password` }),
  send2FAOtp: () => ({ base: 'setting', url: `send-otp` }),
  verify2FAOtp: () => ({ base: 'setting', url: `verify-otp` }),
  enableTwoFactor: () => ({ base: 'setting', url: `two-factor/enable` }),
  disableTwoFactor: () => ({ base: 'setting', url: `two-factor/disable` }),
  deleteAccount: () => ({ base: 'setting', url: 'account' }),

  createStory: () => ({ base: 'story', url: 'story/create' }),
  deleteStory: (id: string) => ({ base: 'story', url: `story/delete?story_id=${id}` }),
  getStory: (params: PaginationParams) => ({ base: 'story', url: `story/list?${buildQuery(params)}` }),
  viewStory: (storyId: string) => ({ base: 'story', url: `story/view?story_id=${storyId}` }),
  muteStory: () => ({ base: 'story', url: `story/mute` }),
  viewerList: (storyId: string) => ({ base: 'story', url: `story/viewers=${storyId}&page=1&limit=1000` }),

  getShareLink: (postId: string) => `home/share/link?post_id=${postId}`,
  sharePost: () => 'home/share/post',

  //Dashboard
  sharePostLink: () => "home/share/post",
  addEmojiReactions: () => 'home/emoji/react'
};