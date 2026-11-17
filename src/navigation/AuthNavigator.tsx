import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AuthScreen,
  SelectLanguageScreen,
  OtpVerificationScreen,
  CreateUserIdScreen,
  SuccessScreen,
  OtpLoginScreen,
  ForgetPassword,
  CreateNewPassword,
  LocationPermission,
  ManualLocation,
  GivePermissions,
  FriendRequestScreen,
  SetBusinessProfileScreen,
  BusinessTiming,
  EducationWorkScreen,
  InterestsScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="SelectLanguage"
  >
    <Stack.Screen name="SelectLanguage" component={SelectLanguageScreen} />
    <Stack.Screen name="AuthScreen" component={AuthScreen} />
    <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <Stack.Screen name="CreateUserId" component={CreateUserIdScreen} />
    <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
    <Stack.Screen name="LocationPermission" component={LocationPermission} />
    <Stack.Screen name="ManualLocation" component={ManualLocation} />
    <Stack.Screen name="FriendRequest" component={FriendRequestScreen} />
    <Stack.Screen name="SetBusinessProfile" component={SetBusinessProfileScreen} />
    <Stack.Screen name="InterestsScreen" component={InterestsScreen} />
    <Stack.Screen name="BusinessTiming" component={BusinessTiming} />
    <Stack.Screen name="EducationWork" component={EducationWorkScreen} />

    <Stack.Screen name="OtpLoginScreen" component={OtpLoginScreen} />
    <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
    <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
    <Stack.Screen name="GivePermissions" component={GivePermissions} />
  </Stack.Navigator>
);

export default AuthNavigator;