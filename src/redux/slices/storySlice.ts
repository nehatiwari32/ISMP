import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiServices";
import apiUrls from "../../api/endpoints";
import { StoryState, PaginationParams } from "../../utils/interfaces";

/* -------------------------------------------------
   INITIAL STATE
-------------------------------------------------- */
const initialState: StoryState = {
  loading: false,
  error: null,
  success: false,

  myStories: [],
  otherStories: [],
  mutedStories: [], // ✅ ADD THIS
  page: 1,
  hasMoreStory: false,
  
  // ✅ ADD THESE FOR VIEWER FUNCTIONALITY
  viewers: [],
  loadingViewers: false,
};

/* -------------------------------------------------
   FETCH STORIES (WITH PAGINATION)
-------------------------------------------------- */
export const fetchStories = createAsyncThunk(
  "story/fetchStories",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getStory(params),
      });

      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to fetch stories"
      );
    }
  }
);

/* -------------------------------------------------
   MUTE/UNMUTE STORY
-------------------------------------------------- */
export const muteStory = createAsyncThunk(
  "story/muteStory",
  async (payload: { muted_user_id: string; action: "mute" | "unmute" }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.muteStory(),
        data: payload
      });

      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to mute/unmute story"
      );
    }
  }
);

/* -------------------------------------------------
   VIEW STORY
-------------------------------------------------- */
export const viewStory = createAsyncThunk(
  "story/viewStory",
  async (storyId: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.viewStory(storyId),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to view story"
      );
    }
  }
);

/* -------------------------------------------------
   VIEW STORY VIEWERS LIST
-------------------------------------------------- */
export const viewerStoryList = createAsyncThunk(
  "story/viewerStoryList",
  async (storyId: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.viewerList(storyId),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to fetch viewers"
      );
    }
  }
);

/* -------------------------------------------------
   CREATE STORY
-------------------------------------------------- */
export const createStory = createAsyncThunk(
  "story/createStory",
  async (payload: { media: { url: string; type: string }[] }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.createStory(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to create story"
      );
    }
  }
);

/* -------------------------------------------------
   DELETE STORY
-------------------------------------------------- */
export const deleteStory = createAsyncThunk(
  "story/deleteStory",
  async (storyId: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "DELETE",
        ...apiUrls.deleteStory(storyId),
      });

      return { data: res?.data, storyId };
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to delete story"
      );
    }
  }
);

/* -------------------------------------------------
   STORY SLICE
-------------------------------------------------- */
const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    resetStoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.myStories = [];
      state.otherStories = [];
      state.mutedStories = []; // ✅ ADD THIS
      state.page = 1;
      state.hasMoreStory = false;
      state.viewers = []; // ✅ ADD THIS
      state.loadingViewers = false; // ✅ ADD THIS
    },
  },

  extraReducers: (builder) => {
    /* ---------------- Fetch Stories (Paginated) ---------------- */
    builder.addCase(fetchStories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchStories.fulfilled, (state, action) => {
      const { my_stories, other_stories, muted_stories, total, page } = action.payload;

      state.loading = false;

      if (page === 1) {
        // First page - replace all
        state.myStories = my_stories || [];
        state.otherStories = other_stories || [];
        state.mutedStories = muted_stories || []; // ✅ ADD THIS
      } else {
        // Subsequent pages - append only other_stories
        state.otherStories = [...state.otherStories, ...(other_stories || [])];
        // Muted stories usually don't paginate, but handle if API sends more
        if (muted_stories && muted_stories.length > 0) {
          state.mutedStories = [...state.mutedStories, ...muted_stories];
        }
      }

      state.page = page;
      state.hasMoreStory = state.otherStories.length < total;
    });

    builder.addCase(fetchStories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ---------------- Mute/Unmute Story ---------------- */
    builder.addCase(muteStory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(muteStory.fulfilled, (state) => {
      state.loading = false;
      // Stories will be refetched after mute/unmute action
    });

    builder.addCase(muteStory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ---------------- View Story ---------------- */
    builder.addCase(viewStory.pending, (state) => {
      // Optional: handle loading state
    });

    builder.addCase(viewStory.fulfilled, (state, action) => {
      // Optional: update view count locally if needed
    });

    builder.addCase(viewStory.rejected, (state, action) => {
      console.error("View story error:", action.payload);
    });

    /* ---------------- Get Story Viewers ---------------- */
    builder.addCase(viewerStoryList.pending, (state) => {
      state.loadingViewers = true;
    });

    builder.addCase(viewerStoryList.fulfilled, (state, action) => {
      state.loadingViewers = false;
      state.viewers = action.payload?.viewers || action.payload || [];
    });

    builder.addCase(viewerStoryList.rejected, (state, action) => {
      state.loadingViewers = false;
      console.error("Get viewers error:", action.payload);
    });

    /* ---------------- Create Story ---------------- */
    builder.addCase(createStory.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });

    builder.addCase(createStory.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      if (action.payload) {
        state.myStories.unshift(action.payload); // add at top of myStories
      }
    });

    builder.addCase(createStory.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload as string;
    });

    /* ---------------- Delete Story ---------------- */
    builder.addCase(deleteStory.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(deleteStory.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      const storyId = action.payload?.storyId;
      
      if (storyId) {
        // Remove from myStories
        state.myStories = state.myStories.filter((s) => s._id !== storyId);
      }
    });

    builder.addCase(deleteStory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetStoryState } = storySlice.actions;
export default storySlice.reducer;