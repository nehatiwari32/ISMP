import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  UIManager,
  ScrollView,
  ImageBackground,
  Modal,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BlurView } from "@react-native-community/blur";

import { Colors } from "../../../theme/colors";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import { CommonModal, CustomButton, CustomSwitch, GradientAvatar, LinkButton, ViewContainer } from "../../../components";
import { deleteAccount, setLogout } from "../../../redux/slices/authSlice";
import { ProfileSections } from "../../../utils/helper";
import { Typography } from "../../../theme/typography";
import { changePostType, setLocality } from "../../../redux/slices/postSlice";
import { fetchBusinessUserProfile, fetchPublicUserProfile } from "../../../redux/slices/profileSlice";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userProfile } = useSelector((state: any) => state.profile);
  const { user } = useSelector((state: any) => state.auth);

  const [darkMode, setDarkMode] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [delAccModal, setDelAccModal] = useState(false);
  const [switchModal, setSwitchModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(userProfile?.name);

  const [expanded, setExpanded] = useState(
    Object.fromEntries(ProfileSections.map(sec => [sec.key, true]))
  );

  useFocusEffect(
    useCallback(() => {

      if (user?.user_type === "business") {
        dispatch(fetchBusinessUserProfile());
      } else {
        dispatch(fetchPublicUserProfile());
      }

    }, [user?.user_type])
  );

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const stats = [
    { label: "Posts", value: userProfile?.post_count, navigation: "PostCategoriesScreen" },
    { label: "Friends", value: userProfile?.friend_count, navigation: "FriendScreen" },
    { label: "Followers", value: userProfile?.followers_count, navigation: "FollowersList" },
    { label: "Following", value: userProfile?.following_count, navigation: "FollowingList" },
    { label: "Likes", value: userProfile?.likes_count, navigation: "" },
  ];

  const gradientCards = [
    { value: "400", label: "Coupon Points", icon: Images.discount, navigation: "CouponPointsScreen" },
    { value: "1250", label: "Karma Points", icon: Images.karmaPoints, navigation: "KarmaPointsScreen" },
    { value: "20", label: "My Listings", icon: Images.listing },
    { value: "Birthday", label: "With You", icon: Images.birthday, navigation: "BirthdayList" },
    { value: "23", label: "View Chat", icon: Images.msg },
    { value: "1679", label: "All Post", icon: Images.userPost },
  ];

  const renderGradientBox = (item: any, index: number) => (
    <View key={index} style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate(item.navigation)}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={Images.gradientBg}
          style={[styles.gradientBox, { flex: 1 }]}
          imageStyle={styles.gradientBgImage}
        >
          <View>
            <Text style={[Typography.black16Bold, { color: '#444444' }]}>
              {item.value}
            </Text>
            <Text
              style={[
                Typography.black12Regular,
                { color: Colors.secondaryText, fontSize: 13 },
              ]}
            >
              {item.label}
            </Text>
          </View>

          <Image source={item.icon} style={styles.boxIcon} />
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );

  return (
    <ViewContainer
      isHeader
      headerTitle="Profile"
      containerStyle={{ paddingHorizontal: 0 }}
      safeAreaBottom={switchModal}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: Colors.lightBg, flex: 1 }}>

        <View>
          <Image source={userProfile?.cover_photo_url ? { uri: userProfile?.cover_photo_url } : Images.coverPhoto} style={styles.coverImage} />
          <View style={styles.avatarWrap}>
            <GradientAvatar source={userProfile?.profile_photo_url ? { uri: userProfile?.profile_photo_url } : Icons.placeholder} size={85} borderWidth={2} />
            <TouchableOpacity style={styles.cameraIcon}>
              <View style={styles.innerCameraicon}>
                <Image source={Icons.camera} style={styles.cameraImg} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity
            onPress={() => setSwitchModal(true)}
            activeOpacity={0.8}
            style={{ alignSelf: "center", }}
          >
            <View style={styles.centerRow}>
              <Text style={Typography.black14Bold}>{userProfile?.name}</Text>
              <Image source={Icons.downArrow} style={styles.smallArrow} />
            </View>
          </TouchableOpacity>
          <View style={styles.centerRow}>
            <Text style={[Typography.black14Regular, { color: Colors.secondaryText, textAlign: "center" }]}>{userProfile?.username}</Text>
            {/* <View style={styles.profileType}>
              <Text style={[Typography.black12Medium, { color: '#fff', textAlign: 'center' }]}>Business User</Text>
            </View> */}
          </View>
        </View>
        <View style={styles.badge}>
          <Image source={Icons.medal} style={styles.badgeIcon} />
          <Text style={[Typography.black12Medium, {
            color: Colors.secondary,
            flex: 1,
            flexShrink: 1,
            flexWrap: "wrap",
          }]}>
            You are Recognized as{" "}
            <Text style={[Typography.black12Bold, {
              color: Colors.secondary,
            }]}>BEST HUMAN</Text> in Your Locality
          </Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.statBox, i < stats.length - 1 && styles.statBorder]}
              onPress={() => navigation.navigate(item?.navigation)}
            >
              <Text style={Typography.black16Bold}>{item.value}</Text>
              <Text style={[Typography.black12Regular, { color: Colors.secondaryText }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.twoColumnContainer}>
          {gradientCards.slice(0, 2).map(renderGradientBox)}
        </View>

        <View style={styles.twoColumnContainer}>
          {gradientCards.slice(2, 4).map(renderGradientBox)}
        </View>

        <View style={styles.twoColumnContainer}>
          {gradientCards.slice(4, 6).map(renderGradientBox)}
        </View>

        <ImageBackground
          source={Images.gradientBg1}
          style={styles.adBox}
          imageStyle={styles.adBgImage}
        >
          <View>
            <Text style={[Typography.black16Bold, { color: '#444444' }]}>
              Advertisement
            </Text>

            <Text style={[Typography.black13Regular, { color: Colors.secondaryText }]}>
              Manage your Advertisement
            </Text>

            <Image source={Images.greenArrow} style={styles.adArrow} />
          </View>

          <Image source={Images.announce} style={styles.adIcon} />
        </ImageBackground>


        {ProfileSections.map((section) => (
          <View key={section.key}>

            {/* Section Header */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleExpand(section.key)}
            >
              <View style={styles.sectionLeft}>
                <Image source={section.icon} style={styles.sectionIcon} />
                <Text style={Typography.black16Medium}>{section.title}</Text>
              </View>

              <Image
                source={Icons.downArrow}
                style={[
                  styles.arrowIcon,
                  expanded[section.key] && styles.arrowRotated
                ]}
              />
            </TouchableOpacity>

            {/* Expanded Items */}
            {expanded[section.key] && (
              <>
                {section.items.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.sectionItemBox}
                    onPress={() => {
                      if (item.type) {
                        navigation.navigate(item.screen, {
                          type: item.type,
                          title: item.label,
                        });
                      } else {
                        navigation.navigate(item.screen);
                      }
                    }}
                  >
                    <Text style={Typography.black14Medium}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                {/* ⭐ Only show in Account Setting Section */}
                {section.key === "account" && (
                  <View style={{ marginVertical: 10 }}>
                    <CustomButton
                      title="Store in Google Drive"
                      onPress={() => console.log("Google Drive Backup")}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        ))}


        <View style={styles.darkModeBox}>
          <Text style={Typography.black14Medium}>Dark Mode</Text>
          <CustomSwitch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => setDelAccModal(true)}>
          <Image source={Icons.trashIcon} style={styles.deleteIcon} />
          <Text style={[Typography.black14Medium, { color: Colors.error }]}>Delete Account</Text>
        </TouchableOpacity>
        <View style={{ alignSelf: 'center', marginVertical: 20 }}>
          <LinkButton
            onPress={() => setLogoutModal(true)}
            title="Logout"
            leftIcon={Icons.logout}
            iconColor={Colors.error}
            textStyle={{ color: Colors.error }}
          />
        </View>
      </ScrollView>

      <CommonModal
        visible={logoutModal}
        image={Images.logout}
        title="Are you sure you want to logout?"
        btnRow
        btnRowTitle1="Logout"
        imgStyle={{ height: 130, objectFit: 'contain', marginBottom: 16, width: 140, alignSelf: 'center' }}
        btnRowTitle2="Cancel"
        onConfirm={() => setLogoutModal(false)}
        onClose={() => {
          dispatch(setLogout());
          dispatch(changePostType(''))
          dispatch(setLocality({}))
          setLogoutModal(false);
        }}
      />

      <CommonModal
        visible={delAccModal}
        image={Images.deleteAccount}
        title="Are you sure want to Delete your account?"
        body="Your entire Account will be deleted, you will lose all the data, Friends, Networking 
        Contacts, still you want to Proceed"
        btnRow
        btnRowTitle1="Continue"
        imgStyle={{ height: 130, objectFit: 'contain', marginBottom: 16, width: 140, alignSelf: 'center' }}
        btnRowTitle2="Delete Now"
        onConfirm={async () => {
          try {
            await dispatch(deleteAccount()).unwrap();

            dispatch(changePostType(''));
            dispatch(setLocality({}));
            dispatch(setLogout());
            setDelAccModal(false);

          } catch (error) {
            console.log('Delete account failed >>>', error);
            // optional: error toast
          }
        }}
        onClose={() => setDelAccModal(false)}
      />

      {switchModal && (
        <Modal
          visible={switchModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSwitchModal(false)}
        >
          <View style={[styles.modalWrapper]}>

            <BlurView
              style={styles.blurBackground}
              blurType="dark"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.4)"
            />

            {/* CLICK ANYWHERE TO CLOSE */}
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => setSwitchModal(false)}
            />

            {/* BOTTOM SHEET */}
            <View style={[styles.bottomSheet]}>
              <View style={styles.dragLine} />

              <Text
                style={[
                  Typography.black14Bold,
                  { color: Colors.gray30, marginBottom: 20 },
                ]}
              >
                SWITCH ACCOUNT
              </Text>

              {/* Account 1 */}
              <TouchableOpacity
                style={styles.accountRow}
                onPress={() => setSelectedUser(userProfile?.name)}
                activeOpacity={0.8}
              >
                <Image source={userProfile?.profile_photo_url ? { uri: userProfile?.profile_photo_url } : Icons.placeholder} style={styles.accountImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.black14Bold, { color: Colors.primaryText10 }]}>{userProfile?.name}</Text>
                  <Text
                    style={[
                      Typography.black14Regular,
                      { color: Colors.secondaryText },
                    ]}
                  >
                    {userProfile?.email}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    selectedUser === userProfile?.name && styles.radioOuterSelected,
                  ]}
                >
                  {selectedUser === userProfile?.name && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addAccountRow} activeOpacity={0.8}>
                <View style={styles.addCircle}>
                  <Text style={[Typography.black24Regular, { color: Colors.primary }]}>+</Text>
                </View>
                <Text style={[Typography.black14Bold, { color: Colors.primaryText10 }]}>Add Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </ViewContainer>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  coverImage: { width: "100%", height: 160 },
  avatarWrap: { position: "absolute", bottom: -40, alignSelf: "center" },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    height: 30,
    width: 30,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerCameraicon: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraImg: { width: 18, height: 18, tintColor: Colors.primary },

  centerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 },
  smallArrow: { width: 12, height: 6, objectFit: 'contain', tintColor: '#111827' },

  profileType: {
    backgroundColor: '#F3B14A',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 26
  },

  badge: {
    flexDirection: "row",
    alignSelf: "center",
    padding: 6,
    gap: 6,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 10,
    marginTop: 14,
    maxWidth: "90%",
    alignItems: "flex-start",
  },
  badgeIcon: { width: 18, height: 18, objectFit: 'contain' },

  statsRow: { flexDirection: "row", marginHorizontal: 24, marginVertical: 18 },
  statBox: { flex: 1, alignItems: "center" },
  statBorder: { borderRightWidth: 1, borderRightColor: "#E5E5E5" },

  twoColumnContainer: { flexDirection: "row", gap: 12, marginHorizontal: 20, },
  gradientBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },

  gradientBgImage: {
    resizeMode: "contain",
  },

  boxIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  adBox: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10
  },

  adBgImage: {
    borderRadius: 14,
    resizeMode: "cover",
  },
  adArrow: { objectFit: 'contain', height: 24, width: 39, marginTop: 4 },
  adIcon: { width: 74, height: 71, objectFit: 'contain' },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  sectionLeft: { flexDirection: "row", alignItems: "center" },
  sectionIcon: { width: 22, height: 22, marginRight: 10 },
  arrowIcon: { width: 14, height: 8, tintColor: Colors.secondaryText, objectFit: 'contain' },
  arrowRotated: { transform: [{ rotate: "180deg" }] },

  sectionItemBox: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  darkModeBox: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 12 },

  deleteBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.error,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: { width: 18, height: 18, marginRight: 8 },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    overflow: "visible",
  },

  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 2,
  },

  bottomSheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 3,
  },

  dragLine: {
    width: 55,
    height: 5,
    backgroundColor: "#D7D7D7",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 5
  },

  accountImg: {
    width: 35,
    height: 35,
    borderRadius: 21,
  },

  addAccountRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addCircle: {
    width: 35,
    height: 35,
    borderRadius: 19,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.secondary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },

});
