import axios from "axios";
import { AUTH_BASE_URL, POST_BASE_URL, LIKE_BASE_URL, COMMENT_BASE_URL, SOCIAL_BASE_URL, SETTINGS_BASE_URL, STORY_URL } from "@env";
import { getStore } from "../redux/storeRef";

// ---------- Helper: Create Instance ----------
const createAPI = (baseURL) => {

  const instance = axios.create({
    baseURL,
    timeout: 30000,
  });

  // Request Interceptor
  instance.interceptors.request.use(
    async (config) => {
      console.log('config>>>>', config);
      const store = getStore();
      const token = store?.getState()?.auth?.token;
      console.log('usingToken>>>>', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers["Content-Type"] = "application/json";
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      console.log('errorrr>>>>', error);

      if (!error.response) {
        throw { status: 0, data: "Network error" };
      }

      throw {
        status: error.response.status,
        data: error.response.data?.message || error.response.data,
      };
    }
  );

  return instance;
};

// --------- 3 API CLIENTS ----------
export const authAPI = createAPI(AUTH_BASE_URL);
export const postAPI = createAPI(POST_BASE_URL);
export const likeAPI = createAPI(LIKE_BASE_URL);
export const commentAPI = createAPI(COMMENT_BASE_URL);
export const userActionsAPI = createAPI(SOCIAL_BASE_URL);
export const settingsAPI = createAPI(SETTINGS_BASE_URL);
export const storyAPI = createAPI(STORY_URL);

// --------- Universal API Handler ----------
export const apiRequest = async ({ base, ...config }) => {
  let client = authAPI; // default

  if (base === "auth") client = authAPI;
  if (base === "post") client = postAPI;
  if (base === "like") client = likeAPI;
  if (base === "comment") client = commentAPI;
  if (base === "social") client = userActionsAPI;
  if (base === "setting") client = settingsAPI;
  if (base === "story") client = storyAPI;

  return await client(config);
};
