import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";

import {
  CustomButton,
  MultipleOptionsDropdown,
  ViewContainer,
  AddCategoryModal,
  CompletionModal,
  InputField,
} from "../../../components";
import ProgressBar from "../../../components/ProgressBar";
import {
  fetchBusinessUserProfile,
  fetchPublicUserProfile,
  getIdentity,
  getIntrest,
  getProfession,
  resetProfileData,
  setProfileProgress,
  updateBusinessProfile,
  updateProfile,
} from "../../../redux/slices/profileSlice";
import { InterestsSchema } from "../../../utils/validation";
import { updateProfileCompleted } from "../../../redux/slices/authSlice";
import { calculateProfileProgress, cleanObject } from "../../../utils/helper";
import { Colors } from "../../../theme/colors";

const InterestsScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation();
  const { user } = useSelector((state: any) => state.auth);
  const { identityList, profileProgress } = useSelector((state: any) => state.profile);

  const isBusinessUser = user?.user_type === "business";

  const [interestList, setInterestList] = useState<any[]>([]);
  const [professionList, setProfessionList] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [openInterests, setOpenInterests] = useState(false);
  const [openProfession, setOpenProfession] = useState(false);
  const [modalType, setModalType] = useState<"interest" | "profession">("interest");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(false)

  const identityValue = identityList
    ?.map(item => item.identity_name)
    .join(", ");

  // ---------- Fetch Interest & Profession ----------
  useEffect(() => {
    const fetchLists = async () => {
      const steps = {
        step1: true,
        step2: false,
        step3: false,
      };

      const newProgress = calculateProfileProgress(user.addresses, steps);

      dispatch(setProfileProgress(newProgress));
      try {
        await dispatch(getIdentity());
        const interestRes = await dispatch(getIntrest()).unwrap();
        const professionRes = await dispatch(getProfession()).unwrap();
        setInterestList(interestRes || []);
        setProfessionList(professionRes || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchLists();
  }, [dispatch, showAddCategoryModal]);

  // ---------- Submit ----------
  const handleSubmitForm = async (values: any) => {
    setLoading(true)
    try {
      // 1️⃣ Build payload safely
      const profileData: any = {
        interests: values.interests,
        profession: values.profession,
      };

      if (values.identity?.trim()) {
        profileData.identity = values.identity.trim().toLowerCase();
      }

      const cleanedPayload = cleanObject(profileData);

      const action =
        user?.user_type === "business" ? updateBusinessProfile : updateProfile;

      const nextScreen =
        user?.user_type === "business" ? "BusinessTiming" : "EducationWork";

      // 3️⃣ Call API (unwrap gives direct response or throws error)
      const response: any = await dispatch(action(cleanedPayload)).unwrap();
      setLoading(false)
      // 4️⃣ Success handling
      if (response?.statusCode === 200 || response?.statusCode === "200") {
        navigation.navigate(nextScreen);
        return;
      }
    } catch (error: any) {
      setLoading(false)
      console.log("Update profile error:", error);
      Alert.alert(
        "Error",
        error ||
        error?.message ||
        error?.data ||
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <ViewContainer
      headerTitle="Interest"
      rightText="Skip"
      onRightPress={() => setShowCompletionModal(true)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={{
            interests: [] as string[],
            profession: [] as string[],
            identity: "",
          }}
          validationSchema={InterestsSchema}
          onSubmit={handleSubmitForm}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit }) => (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
              >
                {/* Progress */}
                <ProgressBar step={profileProgress} />

                {/* Interests - Max 3 categories, 3 subcategories each */}
                <MultipleOptionsDropdown
                  label="Interests*"
                  placeholder="Select interests"
                  data={interestList}
                  selectedValue={values.interests}
                  onSelect={(arr) => setFieldValue("interests", arr)}
                  showAddNew
                  onAddNew={() => {
                    setModalType("interest");
                    setShowAddCategoryModal(true);
                  }}
                  expanded={openInterests}
                  setExpanded={(v) => {
                    setOpenInterests(v);
                    if (v) {
                      setOpenProfession(false);
                    }
                  }}
                  maxCategories={4}
                  maxSubcategoriesPerCategory={3}
                  type="interest"
                />
                {touched.interests && errors.interests && (
                  <Text style={styles.errorText}>{errors.interests}</Text>
                )}

                {/* Profession - Max 2 categories, 2 subcategories each */}
                <MultipleOptionsDropdown
                  label="Profession*"
                  placeholder="Select profession"
                  data={professionList}
                  selectedValue={values.profession}
                  onSelect={(arr) => setFieldValue("profession", arr)}
                  showAddNew
                  onAddNew={() => {
                    setModalType("profession");
                    setShowAddCategoryModal(true);
                  }}
                  expanded={openProfession}
                  setExpanded={(v) => {
                    setOpenProfession(v);
                    if (v) {
                      setOpenInterests(false);
                    }
                  }}
                  maxCategories={2}
                  maxSubcategoriesPerCategory={2}
                  type="profession"
                />
                {touched.profession && errors.profession && (
                  <Text style={styles.errorText}>{errors.profession}</Text>
                )}

                {/* Identity */}
                {identityList?.length > 0 &&
                  <InputField
                    label="Identity"
                    placeholder="Select Identity"
                    value={identityValue}
                    editable={false}
                    disabledColor={Colors.border}
                  />}

                {/* Add Category Modal */}
                <AddCategoryModal
                  visible={showAddCategoryModal}
                  onClose={() => setShowAddCategoryModal(false)}
                  type={modalType}
                  title="Add Category"
                />
              </ScrollView>

              {/* Bottom Button */}
              <View style={styles.bottom}>

                <CustomButton
                  title={user?.user_type === "business" ? "Next" : "Submit"}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                />
              </View>
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

export default InterestsScreen;

const styles = StyleSheet.create({
  scroll: { paddingTop: 16, paddingBottom: 120 },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 8,
    marginLeft: 4,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
});