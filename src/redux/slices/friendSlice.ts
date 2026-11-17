import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../api/apiServices';
import apiUrls from '../../api/endpoints';
import { PaginationParams } from '../../utils/interfaces';

// --------------------------------------
// 1️⃣ GET SUGGESTED FRIENDS
// --------------------------------------
export const getSuggestedFriends = createAsyncThunk(
  'friends/getSuggestedFriends',
  async (payload: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'GET',
        ...apiUrls.suggestedFrnd(payload),
      });
      console.log("getSuggestedFriends",res?.data);
      
      return res?.data || [];
    } catch (err: any) {
      console.log('error>>>', err);

      return rejectWithValue(err?.response?.data || err?.message);
    }
  },
);

// --------------------------------------
// 2️⃣ GET FRIEND LIST
// --------------------------------------
export const getFriends = createAsyncThunk(
  'friends/getFriends',
  async (payload: PaginationParams, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: 'GET',
        ...apiUrls.getFrnd(payload),
      });
      console.log("your frnd",res.data);
      
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  },
);

// --------------------------------------
// 3️⃣ SEND FRIEND REQUEST
// --------------------------------------
export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async (payload: { to_user_id: string }, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: 'POST',
        ...apiUrls.sendFrndRequest(),
        data: payload,
      });
      console.log('res?.data>>>', res?.data);
      return res?.data || {};
    } catch (err: any) {
      console.log('>>>errr', err);

      return rejectWithValue(err || err?.message);
    }
  },
);

// --------------------------------------
// 4️⃣ CANCEL FRIEND REQUEST
// --------------------------------------
export const cancelFriendRequest = createAsyncThunk(
  'friends/cancelFriendRequest',
  async (payload: { target_user_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'DELETE',
        ...apiUrls.cancelFrndRequesst(),
        data: payload,
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err || err?.message);
    }
  },
);

// --------------------------------------
// 5️⃣ ACCEPT FRIEND REQUEST
// --------------------------------------
export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptFriendRequest',
  async (payload: { request_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'POST',
        ...apiUrls.acceptFrndRequesst(),
        data: payload,
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err || err?.message);
    }
  },
);

// --------------------------------------
// 6️⃣ REJECT FRIEND REQUEST
// --------------------------------------
export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectFriendRequest',
  async (payload: { request_id: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'POST',
        ...apiUrls.rejectFrndRequesst(),
        data: payload,
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err || err?.message);
    }
  },
);

// --------------------------------------
// 7️⃣ GET INCOMING REQUEST LIST
export const getFriendRequestList = createAsyncThunk(
  'friends/getFriendRequestList',
  async (payload: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'GET',
        ...apiUrls.getFrndRequst(payload),
      });

      console.log('res freinds', res.data);

      // ✅ RETURN FULL DATA OBJECT
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  },
);

export const removeSuggestedFrnd = createAsyncThunk(
  'friends/removeSuggestedFrnd',
  async (payload: { target_user_id: any }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'POST',
        ...apiUrls.removeSuggestedFrnd(),
        data: payload,
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  },
);

export const randomSuggestedFrnd = createAsyncThunk(
  'friends/randomSuggestedFrnd',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: 'GET',
        ...apiUrls.randomSuggestion(),
      });
      return res?.data || [];
    } catch (err: any) {
      console.log('errr>>>>', err);

      return rejectWithValue(err?.data || err?.message);
    }
  },
);

// --------------------------------------
// INITIAL STATE
// --------------------------------------
const initialState = {
  loading: false,
  error: null,
  suggested: [],
  friends: [],
  requests: [],
  contacts: [],
};

// --------------------------------------
// SLICE
// --------------------------------------
const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearFriendData: state => {
      state.suggested = [];
      state.friends = [];
      state.requests = [];
    },
    removeSuggestedFriend: (state, action) => {
      state.suggested = state.suggested.filter(
        item => item.user_id !== action.payload,
      );
    },
    setUserContacts: (state, action) => {
      state.contacts = action.payload;
    },
  },

  extraReducers: builder => {
    builder

      // 🔹 Pending (all friends APIs)
      .addMatcher(
        action =>
          action.type.startsWith('friends/') &&
          action.type.endsWith('/pending'),
        state => {
          state.loading = true;
          state.error = null;
        },
      )

      .addMatcher(
        action =>
          action.type.startsWith('friends/') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;

          if (action.type.includes('getSuggestedFriends')) {
            state.suggested = action.payload.items || [];
          }

          if (action.type.includes('getFriends')) {
            state.friends = action.payload.items || [];
          }

          if (action.type.includes('getFriendRequestList')) {
            state.requests = action.payload.items || [];
          }
        },
      )

      // 🔹 Rejected
      .addMatcher(
        action =>
          action.type.startsWith('friends/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearFriendData, removeSuggestedFriend, setUserContacts } =
  friendSlice.actions;
export default friendSlice.reducer;
