// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./slices/authSlice";
import postReducer from "./slices/postSlice";
import profileReducer from "./slices/profileSlice";
import friendReducer from "./slices/friendSlice";
import userActionReducer from "./slices/userActionSlice";
import storyReducer from "./slices/storySlice";
import eventReducer from"./slices/eventSlice";
import { setStore } from "./storeRef";

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  profile: profileReducer,
  friend: friendReducer,
  userAction: userActionReducer,
  story: storyReducer,
  event: eventReducer,

  // other reducers...
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// ✅ IMMEDIATELY set store after creation
setStore(store);

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;