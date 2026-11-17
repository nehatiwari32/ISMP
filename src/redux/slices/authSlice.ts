import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiServices";
import apiUrls from "../../api/endpoints";
import { AuthState, CityState, Languages, StateCityParams, TempSignup } from "../../utils/interfaces";

const initialState: AuthState = {
  token: null,
  user: null,
  refreshToken: null,
  loading: false,
  error: null,
  otpData: null,
  login: false,
  languages: [],
  selectedLanguage: null,
  tempSignupData: null,
  permissionData: null,
  localities: [],
  isProfileComplete: false,
  cityState: [],
  content: null,
  appData: null
};

export const getLanguages = createAsyncThunk(
  "auth/getLanguages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.languages(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const getLoginProfile = createAsyncThunk(
  "auth/getLoginProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getLoginProfile(),
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const getAppUrlLink = createAsyncThunk(
  "auth/getAppUrlLink",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getAppURLLink(),
      });
      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const getStaticContent = createAsyncThunk(
  "static/getContent",
  async (type: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getStaticContent(type),
      });

      return res?.data || {};
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to fetch content"
      );
    }
  }
);

export const getStateCity = createAsyncThunk(
  "auth/getStateCity",
  async (payload: StateCityParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getStateOrCity(payload),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const login = createAsyncThunk("auth/login", async (payload: any, { rejectWithValue }) => {
  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.login(), data: payload });
    return res;
  } catch (err: any) {
    return rejectWithValue(err.data || err.message);
  }
});

export const forgotSendOtp = createAsyncThunk(
  "auth/forgotSendOtp",
  async (payload: { email_or_phone_number: string }, { rejectWithValue }) => {
    try {
      const res = await apiRequest({ method: "POST", ...apiUrls.forgotSendOtp(), data: payload });
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.data || err.message);
    }
  }
);

export const forgotVerifyOtp = createAsyncThunk(
  "auth/forgotVerifyOtp",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiRequest({ method: "POST", ...apiUrls.forgotVerifyOtp(), data: payload });
      return res;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiRequest({ method: "POST", ...apiUrls.resetPassword(), data: payload });
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.data || err.message);
    }
  }
);

export const signinSignupSendOtp = createAsyncThunk("auth/signinSignupSendOtp", async (payload: any, { rejectWithValue }) => {

  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.signInWithOtpSend(), data: payload });
    return res;
  } catch (err: any) {
    return rejectWithValue(err.data || err.message);
  }
});

export const verifySinginSendOtp = createAsyncThunk("auth/verifySinginSendOtp", async (payload: any, { rejectWithValue }) => {

  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.verifySinginSendOtp(), data: payload });
    return res;
  } catch (err: any) {
    return rejectWithValue(err);
  }
});

export const addUserBasicDetails = createAsyncThunk("auth/addUserBasicDetails", async (payload: any, { rejectWithValue }) => {

  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.basicDetails(), data: payload });
    return res;
  } catch (err: any) {
    return rejectWithValue(err.data || err.message);
  }
});

export const checkExistingUserId = createAsyncThunk("auth/checkExistingUserId", async (payload: any, { rejectWithValue }) => {
  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.checkExistingId(), data: payload });
    return res;
  } catch (err: any) {
    return rejectWithValue(err.data || err.message);
  }
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (payload: any, { rejectWithValue }) => {
  console.log('payload', payload);
  try {
    const res = await apiRequest({ method: "POST", ...apiUrls.verifyOtp(), data: payload });
    return res;
  } catch (err: any) {
    console.log('errrrrrrrrrData', err);

    return rejectWithValue(err);
  }
});

export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.sendOtp(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.signup(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const resendSignupOtp = createAsyncThunk(
  "auth/resendSignupOtp",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.signupResend(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const getUserPermissions = createAsyncThunk(
  "auth/getUserPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getPermission(),
      });
      return res?.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.data || err?.message || "Failed to fetch languages");
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  "auth/updateUserPermissions",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "PUT",
        ...apiUrls.updatePermission(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const addLocality = createAsyncThunk(
  "auth/addLocality",
  async (payload: any, { rejectWithValue }) => {

    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.addLocality(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const addUserAddresses = createAsyncThunk(
  "auth/addUserAddresses",
  async (payload: any, { rejectWithValue }) => {
console.log('Payload>>>>>>>', payload);

    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.addUserAddresses(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);


export const updateLocality = createAsyncThunk(
  "auth/updateLocality",
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "PUT",
        ...apiUrls.updateLocality(id), // ID ONLY in URL
        data: data, // DATA WITHOUT id
      });

      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const deleteLocality = createAsyncThunk(
  "auth/deleteLocality",
  async (id: string, { rejectWithValue }) => {

    try {
      const response = await apiRequest({
        method: "DELETE",
        ...apiUrls.deleteLocality(id),
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const enableGhoastMode = createAsyncThunk(
  "auth/enableGhoastMode",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "POST",
        ...apiUrls.enableGhoast(),
        data: payload,
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.data || err.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "DELETE",
        ...apiUrls.deleteAccount(),
      });
      console.log('deleteAcccresponse>>>>>>>>>', response);
      return response;
    } catch (err: any) {
      console.log('deleteAcccErrr>>>>>>', err);
      
      return rejectWithValue(err.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.login = false;
      state.error = null;
      state.isProfileComplete = false;
    },
    setSelectedLanguage: (state, action: PayloadAction<Languages>) => {
      state.selectedLanguage = action.payload; // ✅ save globally
    },
    saveTempSignupData: (state, action) => {
      state.tempSignupData = action.payload as TempSignup;
    },
    clearTempSignupData: (state) => {
      state.tempSignupData = null;
    },
    updateProfileCompleted: (state, action) => {
      state.isProfileComplete = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLanguages.fulfilled, (state, action: PayloadAction<Languages[]>) => {
        state.loading = false;
        state.languages = action.payload || [];
      })
      .addCase(getLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAppUrlLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppUrlLink.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.appData = action.payload || [];
      })
      .addCase(getAppUrlLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getStateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStateCity.fulfilled, (state, action: PayloadAction<CityState[]>) => {
        state.loading = false;
        state.cityState = action.payload || [];
      })
      .addCase(getStateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getStaticContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(getStaticContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload?.data?.user || null;
        state.login = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const token = action.payload?.data?.token || null;
        state.token = token;
        const user = {
          _id: action.payload?.data?._id,
          full_name: action.payload?.data?.full_name,
          email_or_phone_number: action?.payload?.data?.email_or_phone_number,
          user_type: action?.payload?.data?.user_type,
          introducer_id: action?.payload?.data?.introducer_id,
          user_id: action?.payload?.data?.user_id,
          language_id: action?.payload?.data?.language_id,
        }
        state.user = user || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const token = action.payload?.data?.token || null;
        state.token = token;
        const user = {
          _id: action.payload?.data?._id,
          full_name: action.payload?.data?.full_name,
          email_or_phone_number: action?.payload?.data?.email_or_phone_number,
          user_type: action?.payload?.data?.user_type,
          introducer_id: action?.payload?.data?.introducer_id,
          user_id: action?.payload?.data?.user_id,
          language_id: action?.payload?.data?.language_id,
        }
        state.user = user || null;
        state.login = true;
        state.isProfileComplete = action.payload?.data?.isProfileComplete || false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signinSignupSendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signinSignupSendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signinSignupSendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getLoginProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoginProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getLoginProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifySinginSendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySinginSendOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const token = action.payload?.data?.token || null;
        state.token = token;
        const user = {
          _id: action.payload?.data?._id,
          full_name: action.payload?.data?.full_name,
          email_or_phone_number: action?.payload?.data?.email_or_phone_number,
          user_type: action?.payload?.data?.user_type,
          introducer_id: action?.payload?.data?.introducer_id,
          user_id: action?.payload?.data?.user_id,
          language_id: action?.payload?.data?.language_id,
        }
        state.user = user || null;
        state.login = true;
        state.isProfileComplete = action.payload?.data?.is_newUser === true ? false : true
      })
      .addCase(verifySinginSendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        const token = action.payload?.token || action.payload?.data?.token;
        state.token = token;
        state.user = action.payload?.data?.user || null;
        state.login = true;
      })

      .addCase(getUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionData = action.payload;
        state.error = null;
      })
      .addCase(getUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserPermissions.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLogout, setSelectedLanguage, saveTempSignupData, updateProfileCompleted, clearTempSignupData } = authSlice.actions;
export default authSlice.reducer;
