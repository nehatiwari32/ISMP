import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";

import { Colors } from "../../../theme/colors";
import {
  InputField,
  ViewContainer,
  AddCategoryModal,
  ProgressBar,
  CustomButton,
  MultipleOptionsDropdown,
  CompletionModal,
  MediaOptionsSheet,
} from "../../../components";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import { calculateProfileProgress, cleanObject, formatAddress } from "../../../utils/helper";
import {
  getCategories,
  uploadMedia,
  bulkMedia,
  resetProfileData,
  fetchPublicUserProfile,
  setProfileProgress,
  updateBusinessProfile,
  updateProfile,
  fetchBusinessUserProfile,
} from "../../../redux/slices/profileSlice";
import { Spacing, Typography } from "../../../theme/typography";
import { ProfileSchema } from "../../../utils/validation";
import { getLoginProfile, updateProfileCompleted } from "../../../redux/slices/authSlice";
import { useMediaUpload } from "../../../utils/useMediaUpload";
import Video from "react-native-video";

const SetBusinessProfileScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.auth);
  const { categories, profileProgress } = useSelector((state: any) => state.profile);

  const isBusinessUser = user?.user_type === "business";

  const defaultPhone = /^[0-9]{10}$/.test(user?.email_or_phone_number || "")
    ? user?.email_or_phone_number
    : ""
  const defaultEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user?.email_or_phone_number || "")
    ? user?.email_or_phone_number
    : ""

  // UI-only states (not form fields)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<
    "profile" | "cover" | "gallery" | null
  >(null);

  const { pickSingle, pickMultiple } = useMediaUpload({
    dispatch,
    uploadAction: uploadMedia,
    bulkUploadAction: bulkMedia,
  });

  const [initialValues, setInitialValues] = useState<any>({
    name: user?.full_name || "",
    userId: user?.user_id || "",
    email: defaultEmail,
    phone: defaultPhone,

    // business-only / optional
    companyName: "",
    companyDescription: "",
    introducer: user?.introducer_id || "",
    websiteUrl: "",
    mission_vision: "",

    // media
    profilePhoto: null as string | null,
    coverPhoto: null as string | null,
    galleryMedia: [] as string[],
    selectedCategories: [] as string[],

  });

  useFocusEffect(
    useCallback(() => {
      const steps = {
        step1: false,
        step2: false,
        step3: false,
      };

      const newProgress = calculateProfileProgress(
        user.addresses,
        steps
      );

      dispatch(setProfileProgress(newProgress));

      // optional cleanup
      return () => { };
    }, [user.addresses])
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getCategories());
      dispatch(getLoginProfile());

      return () => { };
    }, [dispatch])
  );

  const removeGalleryAt = (index: number, values: any, setFieldValue: any) => {
    const next = (values?.galleryMedia || []).filter((_: any, i: number) => i !== index);
    setFieldValue("galleryMedia", next);
  };

  // ---------- Submit Handler ----------
  const handleFormSubmit = async (values: any, isDraft: boolean = false) => {

    const payload = isBusinessUser
      ? {
        name: values.name,
        company_name: values.companyName,
        business_images: values.galleryMedia || [],
        company_description: values.companyDescription,
        introducer_name: values.introducer,
        whatsapp_number: values.phone,
        business_profile_photo_url: values.profilePhoto,
        business_cover_photo_url: values.coverPhoto,
        business_categories: values.selectedCategories || [],
        website_url: values.websiteUrl || "",
        mission_vision: values.mission_vision || ""
      }
      : {
        name: values.name,
        phone_number: values.phone,
        description: values.companyDescription,
        profile_photo_url: values.profilePhoto,
        cover_photo_url: values.coverPhoto,
      };
    if (values.phone && values.phone !== defaultPhone) {
      if (isBusinessUser) {
        payload.whatsapp_number = values.phone;
      } else {
        payload.phone_number = values.phone;
      }
    }

    // Add email ONLY if changed
    if (values.email && values.email !== defaultEmail) {
      payload.email = values.email;
    }

    if (isBusinessUser) {
      await dispatch(updateBusinessProfile(cleanObject(payload)))
    } else {
      await dispatch(updateProfile(cleanObject(payload)))
    }

    if (!isDraft) {
      navigation.navigate("InterestsScreen");
    } else {
      setShowCompletionModal(true)
    }
  };

  const isVideo = (url: string) => {
    return url.endsWith(".mp4") || url.includes("video");
  };

  // ---------- Render ----------
  return (
    <ViewContainer
      headerTitle={isBusinessUser ? "Set Business Profile" : "Set User Profile"}
      scrollable={false}
      containerStyle={{ paddingHorizontal: 0 }}
      safeAreaBottom={showPicker}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={(values) => handleFormSubmit(values, false)}
        >
          {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {/* Progress */}
                <ProgressBar step={profileProgress} />

                {/* Cover Photo */}
                <TouchableOpacity
                  style={styles.cover}
                  activeOpacity={0.85}
                  onPress={() => {
                    setUploadTarget("cover");
                    setShowPicker(true);
                  }}
                  disabled={uploadingCover}
                >
                  {uploadingCover ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                  ) : values.coverPhoto ? (
                    <Image source={{ uri: values.coverPhoto }} style={styles.coverImg} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Image source={Icons.camera} style={styles.uploadIcon} />
                      <Text style={[Typography.black14Medium, { color: Colors.primary }]}>Upload Cover Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Profile Photo */}
                <View style={styles.avatarWrap}>
                  {uploadingProfile ? (
                    <View style={[styles.avatarIcon, styles.avatarLoading]}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  ) : values.profilePhoto ? (
                    <Image source={{ uri: values.profilePhoto }} style={styles.avatarIcon} />
                  ) : (
                    <Image source={Images.userPlaceholder} style={styles.avatarIcon} />
                  )}
                  <TouchableOpacity
                    style={styles.avatarCam}
                    onPress={() => {
                      setUploadTarget("profile");
                      setShowPicker(true);
                    }}
                    disabled={uploadingProfile}
                  >
                    <Image source={Icons.fillCamera} style={styles.camIcon} />
                  </TouchableOpacity>
                </View>

                {/* Form */}
                {isBusinessUser ? (
                  <View style={styles.form}>
                    <InputField
                      label="Name*"
                      placeholder="Enter your name"
                      value={values.name}
                      onChangeText={handleChange("name")}
                      error={touched.name && errors.name}
                    />
                    <InputField
                      label="Company Name"
                      placeholder="Enter company name"
                      value={values.companyName}
                      onChangeText={handleChange("companyName")}
                    />
                    <InputField
                      label="User ID/User name"
                      placeholder="Enter user ID"
                      value={values.userId}
                      onChangeText={handleChange("userId")}
                      error={touched.userId && errors.userId}
                      editable={false}
                      disabledColor={Colors.border}

                    />

                    {/* Gallery Upload */}
                    <Text style={[Typography.black14Regular, { color: Colors.secondaryText }]}>Business Images (optional) </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {/* {(values.galleryMedia || []).map((uri, index) => (
                        <View key={index} style={styles.galleryBox}>
                          <Image source={{ uri }} style={styles.galleryThumb} />
                          <TouchableOpacity
                            style={styles.crossBtn}
                            onPress={() => removeGalleryAt(index, values, setFieldValue)}
                          >
                            <Text style={styles.crossText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))} */}
                      {values?.galleryMedia.map((uri: string, index: number) => (
                        <View key={index} style={styles.galleryBox}>
                          {isVideo(uri) ? (
                            <Video
                              source={{ uri }}
                              style={styles.galleryThumb}
                              resizeMode="cover"
                              paused
                            />
                          ) : (
                            <Image
                              source={{ uri }}
                              style={styles.galleryThumb}
                            />
                          )}

                          <TouchableOpacity
                            style={styles.crossBtn}
                            onPress={() => removeGalleryAt(index, values, setFieldValue)}
                          >
                            <Text style={styles.crossText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                    </ScrollView>

                    <TouchableOpacity
                      style={styles.uploadBox}
                      onPress={() => {
                        setUploadTarget("gallery");
                        setShowPicker(true);
                      }}
                      disabled={uploadingGallery}
                    >
                      {uploadingGallery ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Image source={Icons.upload} style={styles.uploadSmall} />
                          <Text style={[Typography.black14Medium, { color: '#A3A3A3' }]}>
                            Upload from Gallery
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <MultipleOptionsDropdown
                      label="Business"
                      placeholder="Select Category"
                      data={categories}
                      selectedValue={values.selectedCategories}
                      onSelect={(arr) => setFieldValue("selectedCategories", arr)}
                      showAddNew
                      onAddNew={() => setShowAddCategoryModal(true)}
                      expanded={openCategory}
                      setExpanded={(v) => {
                        setOpenCategory(v);
                      }}
                    />

                    <AddCategoryModal
                      visible={showAddCategoryModal}
                      onClose={() => setShowAddCategoryModal(false)}
                      type={'business'}
                    />

                    <InputField
                      label="Website URL (optional)"
                      placeholder="https://www.example.com"
                      value={values.websiteUrl}
                      onChangeText={handleChange("websiteUrl")}
                    />

                    <InputField
                      label="Company Description"
                      placeholder="Tell us about your business..."
                      value={values.companyDescription}
                      onChangeText={handleChange("companyDescription")}
                      multiline
                      numberOfLines={4}
                    />

                    <InputField
                      label="Introducer Name (optional)"
                      placeholder="Enter Introducer Name"
                      value={values.introducer}
                      onChangeText={handleChange("introducer")}
                    />

                    <InputField
                      label="Mission Vision"
                      placeholder="Enter Mission Vision"
                      value={values.mission_vision}
                      onChangeText={handleChange("mission_vision")}
                    />

                    <InputField
                      label="WhatsApp Number"
                      placeholder="Enter WhatsApp number"
                      value={values.phone}
                      keyboardType={'numeric'}
                      maxLength={10}
                      onChangeText={handleChange("phone")}
                      leftComponent={<Text style={Typography.black14Regular}>+91</Text>}
                      leftMargin={{ marginRight: 0 }}
                      disabledColor={defaultPhone ? Colors.border : '#fff'}
                      editable={defaultPhone ? false : true}
                      error={touched.phone && errors.phone}
                    />
                    <InputField
                      label="Email Id"
                      placeholder="Enter email address"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      error={touched.email && errors.email}
                      editable={defaultEmail ? false : true}
                      disabledColor={defaultEmail ? Colors.border : '#fff'}
                    />
                  </View>
                ) : (
                  <View style={styles.form}>
                    <InputField
                      label="Name*"
                      placeholder="Enter your name"
                      value={values.name}
                      onChangeText={handleChange("name")}
                      error={touched.name && errors.name}
                    />
                    <InputField
                      label="Mobile Number"
                      placeholder="Enter mobile number"
                      value={values.phone}
                      onChangeText={handleChange("phone")}
                      keyboardType={'numeric'}
                      maxLength={10}
                      leftComponent={<Text style={Typography.black14Regular}>+91</Text>}
                      leftMargin={{ marginRight: 0 }}
                      disabledColor={defaultPhone ? Colors.border : '#fff'}
                      editable={defaultPhone ? false : true}
                      error={touched.phone && errors.phone}
                    />
                    <InputField
                      label="Email"
                      placeholder="Enter email address"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      error={touched.email && errors.email}
                      editable={defaultEmail ? false : true}
                      disabledColor={defaultEmail ? Colors.border : '#fff'}
                    />

                    <InputField
                      label="User ID/User name"
                      placeholder="Enter user ID"
                      value={values.userId}
                      onChangeText={handleChange("userId")}
                      error={touched.userId && errors.userId}
                      editable={false}
                      disabledColor={Colors.border}
                    />

                    <InputField
                      label="Description (Optional)"
                      placeholder="Write here.."
                      value={values.companyDescription}
                      onChangeText={handleChange("companyDescription")}
                      multiline
                    />
                  </View>
                )}

                {/* Locality block */}
                <Text style={[Typography.black14Medium, { color: '#828692' }]}>Locality</Text>
                {user?.addresses?.map((item) => {
                  return (
                    <>
                      <View style={[styles.rowContainer]}>
                        <View />
                        <Text
                          style={[Typography.black14Bold, { color: Colors.primary }]}
                          onPress={() => navigation.navigate("ManualLocation", { backScreen: 'SetBusinessProfile', editAddress: item })}
                        >
                          Change Locality
                        </Text>
                      </View>
                      <View style={styles.addressContainer} key={item?.id}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Image source={Icons.greenMap} style={styles.locationIcon} />
                          <Text style={[Typography.black12Medium, { color: '#383838' }]}>
                            Pincode 1 (Auto-detected)
                          </Text>
                        </View>
                        <Text
                          style={[
                            Typography.black14Bold,
                            { color: '#383838', marginTop: 6 },
                          ]}
                        >
                          {formatAddress(item)}
                        </Text>
                      </View>
                    </>
                  )
                })}
                <TouchableOpacity
                  style={styles.addLocalityButton}
                  onPress={() => navigation.navigate("ManualLocation", { backScreen: 'SetBusinessProfile' })}
                >
                  <Text style={styles.addLocalitySymbol}>+</Text>
                  <Text style={styles.addLocalityText}>Add Your Locality / Pincode</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Bottom Buttons */}
              <View style={styles.bottom}>

                <View style={styles.rowContainer}>
                  <CustomButton
                    title="Save and Do Later"
                    onPress={() => handleFormSubmit(values, true)}
                    buttonStyle={{
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: Colors.primary,
                      width: "48%",
                    }}
                    textColor={Colors.primary}
                  />
                  <CustomButton
                    title="Continue"
                    onPress={handleSubmit}
                    buttonStyle={{ width: "48%" }}
                  />
                </View>
              </View>
              <MediaOptionsSheet
                visible={showPicker}
                onClose={() => setShowPicker(false)}

                onCamera={async () => {
                  setShowPicker(false);

                  if (uploadTarget === "profile") {
                    await pickSingle({
                      from: "camera",
                      type: "user",
                      setLoading: setUploadingProfile,
                      onUploaded: (url: string) =>
                        setFieldValue("profilePhoto", url),
                    });
                  }

                  if (uploadTarget === "cover") {
                    await pickSingle({
                      from: "camera",
                      type: "user",
                      setLoading: setUploadingCover,
                      onUploaded: (url: string) =>
                        setFieldValue("coverPhoto", url),
                    });
                  }
                }}

                onGallery={async () => {
                  setShowPicker(false);
                  if (uploadTarget === "profile") {
                    await pickSingle({
                      from: "gallery",
                      type: "user",
                      setLoading: setUploadingProfile,
                      onUploaded: (url: string) =>
                        setFieldValue("profilePhoto", url),
                    });
                  }

                  if (uploadTarget === "cover") {
                    await pickSingle({
                      from: "gallery",
                      type: "user",
                      setLoading: setUploadingCover,
                      onUploaded: (url: string) =>
                        setFieldValue("coverPhoto", url),
                    });
                  }

                  if (uploadTarget === "gallery") {
                    await pickMultiple({
                      type: "user",
                      setLoading: setUploadingGallery,

                      onImagesUploaded: (imageUrls: string[]) => {
                        setFieldValue("galleryMedia", [
                          ...(values.galleryMedia || []),
                          ...imageUrls,
                        ]);
                      },

                      onVideosUploaded: (videoUrls: string[]) => {
                        setFieldValue("galleryMedia", [
                          ...(values.galleryMedia || []),
                          ...videoUrls,
                        ]);
                      },
                    });
                  }
                }}
              />

            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
      {showCompletionModal === true &&
        <CompletionModal
          visible={showCompletionModal}
          progress={profileProgress}
          onContinue={() => setShowCompletionModal(false)}
          onCompleteNow={() => {
            dispatch(updateProfileCompleted(true));
            dispatch(resetProfileData());
            if (isBusinessUser) {
              dispatch(fetchBusinessUserProfile())
            } else {
              dispatch(fetchPublicUserProfile());
            }
            setShowCompletionModal(false)
          }}
        />}
    </ViewContainer>
  );
};

export default SetBusinessProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.screenHorizontalPadding, backgroundColor: Colors.lightBg, paddingTop: 10 },
  scroll: { paddingBottom: 100, flexGrow: 1 },
  cover: {
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 10,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  rowContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  coverImg: { width: "100%", height: "100%", borderRadius: 10 },
  uploadIcon: { width: 22, height: 22, resizeMode: "contain", marginBottom: 6 },
  uploadText: { color: Colors.primary, fontWeight: "600" },
  avatarWrap: { alignItems: "center", marginTop: -40, marginBottom: 10 },
  avatarIcon: { width: 80, height: 80, borderRadius: 40 },
  avatarLoading: { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" },
  avatarCam: { position: "absolute", right: "36%", bottom: 0 },
  camIcon: { width: 34, height: 34, resizeMode: "contain" },
  form: { marginTop: 10 },
  label: { fontSize: 14, color: Colors.secondaryText, marginTop: 12, marginBottom: 6 },
  galleryBox: { position: "relative", marginTop: 10, marginRight: 10, overflow: "visible", },
  galleryThumb: { width: 80, height: 80, borderRadius: 8 },
  crossBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  crossText: { ...Typography.black14Bold, color: "#fff", textAlign: 'center' },
  uploadBox: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
  },
  change: { color: Colors.secondary, fontWeight: "600" },
  uploadSmall: { width: 16, height: 16, marginRight: 8, resizeMode: "contain" },
  uploadGalleryText: { ...Typography.black14Regular, color: Colors.secondaryText },
  genderRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  genderBtnActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  genderIcon: { width: 18, height: 18, marginRight: 8, tintColor: Colors.primaryLight, resizeMode: "contain" },
  genderText: { color: Colors.primaryLight, fontWeight: "600" },
  genderTextActive: { color: "#fff" },
  errorText: { color: "red", marginTop: -4, marginBottom: 8, marginLeft: 2, fontSize: 12 },
  mapBg: {
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  locateBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  gps: { width: 16, height: 16, tintColor: Colors.primary, marginRight: 8, resizeMode: "contain" },
  locateText: { color: Colors.primary, fontWeight: "700" },
  addressContainer: {
    backgroundColor: Colors.gray10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Spacing.modalBorderRadius,
    marginTop: 8
  },
  locationIcon: { height: 24, width: 24, marginRight: 8, objectFit: 'contain' },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingHorizontal: Spacing.screenHorizontalPadding
  },
  calendarIcon: { width: 18, height: 18, tintColor: Colors.primary },
  addLocalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addLocalitySymbol: {
    ...Typography.black20Regular,
    color: Colors.secondary,
    marginRight: 4,
  },
  addLocalityText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
});