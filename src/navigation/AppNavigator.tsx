// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import SplashScreen from "../screens/SplashScreen";

import {
  fetchBusinessUserProfile,
  fetchPublicUserProfile,
  fetchSeetings,
} from "../redux/slices/profileSlice";
import { AddBasicDetails, LocationPermission, PrivacyPolicy, TermsAndConditionsScreen } from "../screens";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch<any>();

  const [isLoading, setIsLoading] = useState(true);

  const { token, isProfileComplete, user } = useSelector(
    (state: any) => state.auth
  );

  useEffect(() => {
    const initApp = async () => {
      try {
        if (token) {
          await dispatch(fetchSeetings());

          if (user?.user_type === "business") {
            await dispatch(fetchBusinessUserProfile());
          } else {
            await dispatch(fetchPublicUserProfile());
          }
        }
      } catch (error) {
        console.log("Init error:", error);
      } finally {
        // Splash minimum time
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    initApp();
  }, [token, user]);
 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : token && isProfileComplete === true ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}

      {/* Common Screens */}
      <Stack.Screen
        name="TermsAndConditionsScreen"
        component={TermsAndConditionsScreen}
      />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />

      <Stack.Screen name="AddBasicDetails" component={AddBasicDetails} />
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermission}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
