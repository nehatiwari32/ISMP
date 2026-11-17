import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiServices";
import apiUrls from "../../api/endpoints";
import { CategoryWithEvents, EventState, PaginationParams } from "../../utils/interfaces";

/* -------------------------------------------------
   INITIAL STATE
-------------------------------------------------- */
const initialState: EventState = {
  loading: false,
  error: null,
  success: false,
  eventCategories: [],
  page: 1,
  limit: 10,
  total: 0,
  hasMore: false,
};

/* -------------------------------------------------
   FETCH EVENT LIST (WITH PAGINATION)
-------------------------------------------------- */
export const fetchEventList = createAsyncThunk(
  "event/fetchEventList",
  async (params: PaginationParams = {}, { rejectWithValue }) => {
    console.log('params>>>>>', params);

    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.eventList(params),
      });

      return {
        data: res?.data,
        page: params.page || 1,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch events"
      );
    }
  }
);

/* -------------------------------------------------
   VIEW EVENT
-------------------------------------------------- */
export const viewEvent = createAsyncThunk(
  "event/viewEvent",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.viewEvent(eventId),
      });
      return res?.data;
    } catch (err: any) {
      console.log('errrr>>>>>', err);

      return rejectWithValue(
        err?.data || err?.message || "Failed to view event"
      );
    }
  }
);

/* -------------------------------------------------
   CREATE EVENT
-------------------------------------------------- */
export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addEvent(),
        data: payload,
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to create event"
      );
    }
  }
);

/* -------------------------------------------------
   DELETE EVENT
-------------------------------------------------- */
export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "DELETE",
        ...apiUrls.deleteEvent(eventId),
      });

      return res;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to delete event"
      );
    }
  }
);

/* -------------------------------------------------
   EVENT SLICE
-------------------------------------------------- */
const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    resetEventState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.eventCategories = [];
      state.page = 1;
      state.hasMore = false;
      state.total = 0;
    },
  },

  extraReducers: (builder) => {
    /* ---------------- Fetch Event List ---------------- */
    builder.addCase(fetchEventList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchEventList.fulfilled, (state, action) => {
      const { data, page } = action.payload;
      const { categories, pagination } = data;

      state.loading = false;

      if (page === 1) {
        state.eventCategories = categories || [];
      } else {
        // Merge categories for pagination
        const existingCategories = [...state.eventCategories];
        categories?.forEach((newCat: CategoryWithEvents) => {
          const existingIndex = existingCategories.findIndex(
            (cat) => cat.category._id === newCat.category._id
          );
          if (existingIndex >= 0) {
            existingCategories[existingIndex].items = [
              ...existingCategories[existingIndex].items,
              ...newCat.items,
            ];
          } else {
            existingCategories.push(newCat);
          }
        });
        state.eventCategories = existingCategories;
      }

      state.page = pagination?.page || page;
      state.limit = pagination?.limit || 10;
      state.total = pagination?.total || 0;
      state.hasMore = state.eventCategories.reduce((acc, cat) => acc + cat.items.length, 0) < state.total;
    });

    builder.addCase(fetchEventList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ---------------- View Event ---------------- */
    builder.addCase(viewEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(viewEvent.fulfilled, (state) => {
      state.loading = false;
    });

    builder.addCase(viewEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ---------------- Create Event ---------------- */
    builder.addCase(createEvent.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });

    builder.addCase(createEvent.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });

    builder.addCase(createEvent.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteEvent.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { resetEventState } = eventSlice.actions;
export default eventSlice.reducer;