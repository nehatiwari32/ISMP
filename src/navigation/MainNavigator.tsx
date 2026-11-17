import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import { Colors } from "../theme/colors";
import {
  AboutUsScreen,
  AllSuggestedFriends,
  CommunityGuidelinesScreen,
  CreatePostScreen,
  FAQScreen,
  MyLocalityScreen,
  NotificationScreen,
  PostDetails,
  ProfileScreen,
  PostingSettingsScreen,
  RaiseTicketScreen,
  ReferScreen,
  TicketsScreen,
  UserProfileSettings,
  FollowingList,
  FollowersList,
  BirthdayList,
  CouponPointsScreen,
  KarmaPointsScreen,
  PostCategoriesScreen,
  SearchUserScreen,
  AllRecentSearch,
  MessageScreen,
  FriendScreen,
  FriendPickerScreen,
  EditLocalityScreen,
  SecurityScreen,
  PrivacySettingScreen,
  ChangePasswordScreen,
  TwoFactorAuthScreen,
  Spirituality,
  AddEventScreen,
  EventDetailsScreen,
  RegisterNowScreen,
  OtherUserProfileScreen,
  FriendPostScreen,
  GivePermissions,
  BlockedUserScreen,
  BlockAnAccountScreen,
  MyPost,
  UpdateLocalityScreen,

} from "../screens";
import { useSelector } from "react-redux";
import { CompletionModal } from "../components";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import MySavedPost from "../screens/dashboard/profile/profileActions/MySavedPost";
import GlobalUploadIndicator from "../components/common/GlobalUploadIndicator";
import TagPostScreen from "../screens/dashboard/profile/profileActions/TagPostScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const navigation = useNavigation();


  const { userProfile } =
    useSelector((state: any) => state.profile);

  const [dismissedOnce, setDismissedOnce] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isBasicDetail, setIsBasicDetail] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (
      isFocused &&
      userProfile?.isProfileComplete == false &&
      !dismissedOnce
    ) {
      setIsBasicDetail(true);
      setShowCompletionModal(true);
    } else if (userProfile?.isProfileComplete == true && userProfile?.isInterest == false && userProfile?.isEduWork == false &&
      !dismissedOnce) {
      setShowCompletionModal(true);
    } else if (userProfile?.isProfileComplete == true && userProfile?.isInterest == true && userProfile?.isEduWork == false &&
      !dismissedOnce) {
      setShowCompletionModal(true);
    }

    else {
      setShowCompletionModal(false);
      setIsBasicDetail(false);
    }
  }, [isFocused, userProfile?.isProfileComplete, dismissedOnce]);


  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.backgroundLight}
        translucent={false}
      />
      <GlobalUploadIndicator />

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="PostingSettingsScreen" component={PostingSettingsScreen} />

        <Stack.Screen name="OtherUserProfileScreen" component={OtherUserProfileScreen} />
        <Stack.Screen name="PostDetails" component={PostDetails} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="ReferScreen" component={ReferScreen} />
        <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
        <Stack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} />
        <Stack.Screen name="FAQScreen" component={FAQScreen} />
        <Stack.Screen name="SupportScreen" component={TicketsScreen} />
        <Stack.Screen name="MyLocalityScreen" component={MyLocalityScreen} />
        <Stack.Screen name="UpdateLocalityScreen" component={UpdateLocalityScreen} />
        <Stack.Screen name="RaiseTicketScreen" component={RaiseTicketScreen} />
        <Stack.Screen name="UserProfileSettingsScreen" component={UserProfileSettings} />
        <Stack.Screen name="AllSuggestedFriends" component={AllSuggestedFriends} />
        <Stack.Screen name="FollowingList" component={FollowingList} />
        <Stack.Screen name="BlockedUserScreen" component={BlockedUserScreen} />
        <Stack.Screen name="BlockAnAccountScreen" component={BlockAnAccountScreen} />

        <Stack.Screen name="FollowersList" component={FollowersList} />
        <Stack.Screen name="BirthdayList" component={BirthdayList} />
        <Stack.Screen name="CouponPointsScreen" component={CouponPointsScreen} />
        <Stack.Screen name="KarmaPointsScreen" component={KarmaPointsScreen} />
        <Stack.Screen name="PostCategoriesScreen" component={PostCategoriesScreen} />
        <Stack.Screen name="SearchUserScreen" component={SearchUserScreen} />
        <Stack.Screen name="AllRecentSearch" component={AllRecentSearch} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="FriendScreen" component={FriendScreen} />
        <Stack.Screen name="FriendPicker" component={FriendPickerScreen} />
        <Stack.Screen name="EditLocalityScreen" component={EditLocalityScreen} />
        <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
        <Stack.Screen name="PrivacySettingScreen" component={PrivacySettingScreen} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="TwoFactorAuthScreen" component={TwoFactorAuthScreen} />
        <Stack.Screen name="GivePermissions" component={GivePermissions} />
        <Stack.Screen name="Spirituality" component={Spirituality} />
        <Stack.Screen name="AddEventScreen" component={AddEventScreen} />
        <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
        <Stack.Screen name="RegisterNowScreen" component={RegisterNowScreen} />
        <Stack.Screen name="FriendPostScreen" component={FriendPostScreen} />
        <Stack.Screen name="MyPost" component={MyPost} />
        <Stack.Screen name="MySavedPost" component={MySavedPost} />
         <Stack.Screen name="TagPostScreen" component={TagPostScreen} />
      </Stack.Navigator>

      {showCompletionModal && (
        <CompletionModal
          visible={showCompletionModal}
          progress={userProfile?.percentageCompletion}
          onContinue={() => {
            if (isBasicDetail) {
              navigation.navigate("AddBasicDetails", { isBack: true });
            } else {
              (navigation as any).navigate("Main", { screen: "UserProfileSettingsScreen" });
            }

            setShowCompletionModal(false);
            setIsBasicDetail(false);
            setDismissedOnce(true);
          }}
          showBothBtn={false}
          disableBlur={true}
        />
      )}


    </>
  );
};

export default MainStack;
