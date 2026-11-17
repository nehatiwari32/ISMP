// src/redux/slices/userActionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiServices";
import apiUrls from "../../api/endpoints";
import { PaginationParams } from "../../utils/interfaces";

// --------------------------------------------------------------------
// 🔹 SAVE POST
// --------------------------------------------------------------------
export const savePost = createAsyncThunk(
  "userAction/savePost",
  async (payload: { post_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.savePost(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 UNSAVE POST
// --------------------------------------------------------------------
export const unSavePost = createAsyncThunk(
  "userAction/unSavePost",
  async (payload: { post_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.unSavedPost(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 GET SAVED POSTS
// --------------------------------------------------------------------
export const getSavedPosts = createAsyncThunk(
  "userAction/getSavedPosts",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getSavedPost(payload),
      });
      return res?.data?.items || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 SHARE POST
// --------------------------------------------------------------------
export const sharePost = createAsyncThunk(
  "userAction/sharePost",
  async (payload: { post_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        url: apiUrls.sharePost(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 BLOCK USER
// --------------------------------------------------------------------
export const blockUser = createAsyncThunk(
  "userAction/blockUser",
  async (payload: { user_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.blockUser(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 REPORT POST
// --------------------------------------------------------------------
export const reportPost = createAsyncThunk(
  "userAction/reportPost",
  async (
    payload: { content_id: string; content_type: string },
    { rejectWithValue }
  ) => {
    console.log('payload>>>>', payload);

    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.reportPost(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 FOLLOW USER
// --------------------------------------------------------------------
export const followUser = createAsyncThunk(
  "userAction/followUser",
  async (payload: { follow_user_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.followUser(),
        data: payload,
      });

      return res?.data;
    } catch (err: any) {
      console.log('errrorrr>>>', err);

      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 UNFOLLOW USER
// --------------------------------------------------------------------
export const unFollowUser = createAsyncThunk(
  "userAction/unFollowUser",
  async (payload: { follow_user_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "DELETE",
        ...apiUrls.unfollowUser(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 NOT INTERESTED
// --------------------------------------------------------------------
export const notInterested = createAsyncThunk(
  "userAction/notInterested",
  async (payload: { post_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.notIntrested(),
        data: payload,
      });

      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 GET FOLLOWERS
// --------------------------------------------------------------------
export const getFollowers = createAsyncThunk(
  "userAction/getFollowers",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getFollowers(payload),
      });
      return res?.data?.items || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// 🔹 GET FOLLOWING
// --------------------------------------------------------------------
export const getFollowingList = createAsyncThunk(
  "userAction/getFollowingList",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getFollowingList(payload),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// 🔹 GET FOLLOWING
// --------------------------------------------------------------------
export const getSearchUser = createAsyncThunk(
  "userAction/getSearchUser",
  async (params: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.searchUser(params),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

// --------------------------------------------------------------------
// INITIAL STATE
// --------------------------------------------------------------------
const initialState = {
  loading: false,
  error: null,

  // followers API
  followers: [],
  followerPage: 1,
  followerTotal: 0,

  // following API
  following: [],
  followingPage: 1,
  followingTotal: 0,

  savedPosts: [],
};

// --------------------------------------------------------------------
// SLICE
// --------------------------------------------------------------------
const userActionSlice = createSlice({
  name: "userAction",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // ----------------------------------------------------------------
    // 📌 IMPORTANT: ALL addCase MUST COME BEFORE addMatcher
    // ----------------------------------------------------------------

    builder
      // ---- GET SAVED POSTS ----
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload;
      })

      // ---- GET FOLLOWERS ----
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
           const { page, items, total } = action.payload;

        if (page === 1) {
          state.followers = items;
        } else {
          state.followers = [...state.followers, ...items];
        }

        state.followerPage = page;
        state.followerTotal = total;
      })

      // ---- GET FOLLOWING ----
      .addCase(getFollowingList.fulfilled, (state, action) => {
        state.loading = false;

        const { page, items, total } = action.payload;

        if (page === 1) {
          state.following = items;
        } else {
          state.following = [...state.following, ...items];
        }

        state.followingPage = page;
        state.followingTotal = total;
      })

    // ----------------------------------------------------------------
    // 📌 MATCHERS ALWAYS LAST
    // ----------------------------------------------------------------
    builder
      // Pending
      .addMatcher(
        (action) =>
          action.type.startsWith("userAction/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // Rejected
      .addMatcher(
        (action) =>
          action.type.startsWith("userAction/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // Generic fulfilled (for simple actions)
      .addMatcher(
        (action) =>
          action.type.startsWith("userAction/") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export default userActionSlice.reducer;
