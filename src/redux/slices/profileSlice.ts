// src/redux/Slices/Profile/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PaginationParams, ProfileState, UploadFilePayload, UploadResponse, UserProfile } from "../../utils/interfaces";
import { apiRequest } from "../../api/apiServices";
import { MEDIA_BASE_URL } from '@env';
import apiUrls from "../../api/endpoints";
import { RootState } from "../store";

/* ----------------------- INITIAL STATE ----------------------- */
const initialState: ProfileState = {
  userProfile: null,
  profilePayload: {},
  loading: false,
  uploading: false,
  uploadedFiles: [],
  error: null,
  categories: [],
  FAQList: [],
  issueList: [],
  identityList: [],
  profileSettings: {},
  birthdayList: [],
  storyFiles: [],
  profileProgress: 20,
  progress: 0,
  degreeList: []
};

/* ----------------------- ASYNC THUNK ----------------------- */
export const uploadMedia = createAsyncThunk<
  UploadResponse,
  UploadFilePayload,
  { state: RootState }
>("profile/uploadMedia", async ({ file, type }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth?.token;
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type || "image/jpeg",
      name: file.fileName || `upload-${Date.now()}.jpg`,
    } as any);
    formData.append("type", type);
    const response = await fetch(`${MEDIA_BASE_URL}/${apiUrls.uploadFile()}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (err: any) {
    console.log("Upload error with fetch:", err);
    return rejectWithValue(err?.message || "Upload failed");
  }
});

export const bulkMedia = createAsyncThunk<
  UploadResponse[],
  { files: any[]; type: string },
  { state: RootState }
>("profile/bulkMedia", async ({ files, type }, { rejectWithValue, getState }) => {

  try {
    const token = getState().auth?.token;
    const formData = new FormData();
    files.forEach((file, i) => {
      formData.append("media", {
        uri: file.uri,
        type: file.type || file.mime || "image/jpeg",
        name: file.fileName || file.filename || `upload-${Date.now()}-${i}.jpg`,
      });
    });

    formData.append("type", type);

    const response = await fetch(`${MEDIA_BASE_URL}/${apiUrls.bulkUpload()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Bulk upload failed with status: ${response.status}`);
    }
    
    
    const result = await response.json();
    return result
  } catch (err: any) {
    console.log("Bulk upload error:", err);
    return rejectWithValue(err?.message || "Bulk upload failed");
  }
});


export const getCategories = createAsyncThunk(
  "profile/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getCategory(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  "profile/addCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addCategory(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const getIntrest = createAsyncThunk(
  "profile/getIntrest",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getIntrest(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const getBirthdayList = createAsyncThunk(
  "profile/getBirthdayList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getBirthdayList(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addIntrest = createAsyncThunk(
  "profile/addIntrest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addIntrest(),
        data: payload
      });
      return res // safely return array or data object
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const getProfession = createAsyncThunk(
  "profile/getProfession",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getProfession(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addProfession = createAsyncThunk(
  "profile/addProfession",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addProfession(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const getIdentity = createAsyncThunk(
  "profile/getIdentity",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getIdentity(),
      });
      return res?.data || []; // safely return array or data object
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const getDegree = createAsyncThunk(
  "profile/getDegree",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getDegreeList(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addDegree = createAsyncThunk(
  "profile/addDegree",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addDegree(),
        data: payload
      });
      return res || {};
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const updateEducation = createAsyncThunk(
  "profile/updateEducation",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.updateEducation(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const updateWork = createAsyncThunk(
  "profile/updateWork",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.updateWork(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const getFAQList = createAsyncThunk(
  "profile/getFAQList",
  async (payload: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getFAQ(),
      });
      return res?.data || []; // safely return array or data object
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const getSupportList = createAsyncThunk(
  "profile/getSupportList",
  async (payload: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getSupportList(payload),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addSupportTicket = createAsyncThunk(
  "profile/addSupportTicket",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addSupport(),
        data: payload
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const getIssueList = createAsyncThunk(
  "profile/getIssueList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getIssues(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const getOrganization = createAsyncThunk(
  "profile/getOrganization",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getOrganization(payload),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const addOrganization = createAsyncThunk(
  "profile/addOrganization",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.addOrganization(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err?.data);
    }
  }
);

export const fetchSeetings = createAsyncThunk(
  "profile/fetchSeetings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.fetchSeetings(),
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.changePSW(),
        data: payload
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const send2FAOtp = createAsyncThunk(
  "profile/send2FAOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.send2FAOtp(),
        data: payload,
      });
      return res?.data;
    } catch (err) {
      console.log('err>>>>', err);

      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const verify2FAOtp = createAsyncThunk(
  "profile/verify2FAOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.verify2FAOtp(),
        data: payload,
      });
      return res?.data;
    } catch (err) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const enableTwoFA = createAsyncThunk(
  "profile/enableTwoFA",
  async (payload, { rejectWithValue }) => {
    console.log('payload>>>', payload);

    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.enableTwoFactor(),
        data: payload,
      });
      return res?.data;
    } catch (err) {
      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const disableTwoFA = createAsyncThunk(
  "profile/disableTwoFA",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.disableTwoFactor(),
      });
      return res?.data;
    } catch (err) {
      console.log('error>>>>>', err);

      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  "profile/updateSettings",
  async (payload, { rejectWithValue }) => {
    console.log('payload>>>>', payload);
    
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.updateSettings(),
        data: payload
      });
      return res?.data || [];
    } catch (err: any) {
      console.log('errrrData>>>>', err);

      return rejectWithValue(err?.data || err?.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (payload, { rejectWithValue }) => {
    console.log('payload>>>>>', payload);
    
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.updateProfile(),
        data: payload
      });
      return res
    } catch (err: any) {
      console.log('err>>>>', err);

      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const fetchBusinessUserProfile = createAsyncThunk(
  "profile/fetchBusinessUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.businessProfile(),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to create post"
      );
    }
  }
);

export const fetchPublicUserProfile = createAsyncThunk(
  "profile/fetchPublicUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.publicProfile(),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to create post"
      );
    }
  }
);

export const updateBusinessProfile = createAsyncThunk(
  "profile/updateBusinessProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "PUT",
        ...apiUrls.updateBusinessProfile(),
        data: payload
      });
      return res
    } catch (err: any) {
      return rejectWithValue(err || "Failed to fetch languages");
    }
  }
);

/* ----------------------- SLICE ----------------------- */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {

    setProfileProgress(state, action) {
      state.profileProgress = action.payload;
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.progress = 0;
      state.error = null;
      state.uploadedFiles = [];
    },
    addLocalFile: (state, action) => {
      state.uploadedFiles.push(action.payload);
    },
    removeFile: (state, action) => {
      state.uploadedFiles.splice(action.payload, 1);
    },
    addStoryFile: (state, action) => {
      state.storyFiles.push(action.payload);
    },
    removeStoryFile: (state, action) => {
      state.storyFiles.splice(action.payload, 1);
    },
    setProfileField: (state, action) => {
      const cleanPayload = Object.fromEntries(
        Object.entries(action.payload).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      state.profilePayload = { ...state.profilePayload, ...cleanPayload };
    },
    resetProfileData: (state) => {
      state.profilePayload = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploading = false;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      .addCase(bulkMedia.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(bulkMedia.fulfilled, (state, action) => {
        state.uploading = false;
      })
      .addCase(bulkMedia.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getIdentity.pending, (state) => {
        state.error = null;
      })
      .addCase(getIdentity.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.identityList = action?.payload;
      })
      .addCase(getIdentity.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getDegree.pending, (state) => {
        state.error = null;
      })
      .addCase(getDegree.fulfilled, (state, action: PayloadAction<any[]>) => {
        const list = Array.isArray(action?.payload) ? action.payload : [];

        const degreeApiList = list.map(item => ({
          label: item?.degree || "",
          value: item?.degree || "",
        }));

        state.degreeList = degreeApiList;
      })
      .addCase(getDegree.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getFAQList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFAQList.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.FAQList = action?.payload?.items || [];
      })
      .addCase(getFAQList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getIssueList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIssueList.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.issueList = action?.payload?.items || [];
      })
      .addCase(getIssueList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBusinessUserProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchBusinessUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.userProfile = action.payload;
      })
      .addCase(fetchBusinessUserProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchSeetings.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchSeetings.fulfilled, (state, action: PayloadAction<any>) => {
        state.profileSettings = action.payload?.field_visibility;
      })
      .addCase(fetchSeetings.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(fetchPublicUserProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPublicUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.userProfile = action.payload;
      })
      .addCase(fetchPublicUserProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getBirthdayList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBirthdayList.fulfilled, (state, action) => {
        state.loading = false;
        state.birthdayList = action.payload || [];
      })
      .addCase(getBirthdayList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      ;
  },
});

export const { resetUploadState, removeFile, addLocalFile, addStoryFile, removeStoryFile, resetProfileData, setProfileField, setProfileProgress } = profileSlice.actions;
export default profileSlice.reducer;