import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Alert,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { Formik, FieldArray } from "formik";
import { useFocusEffect, useRoute } from "@react-navigation/native";

import { Colors } from "../../../theme/colors";
import { Icons } from "../../../assets/icons";
import { Spacing, Typography } from "../../../theme/typography";

import {
  fetchPublicUserProfile,
  getDegree,
  resetProfileData,
  setProfileProgress,
  updateBusinessProfile,
  updateEducation,
  updateProfile,
  updateWork,
} from "../../../redux/slices/profileSlice";
import { getLoginProfile, getStateCity, updateProfileCompleted } from "../../../redux/slices/authSlice";
import useOrganizationSearch from "../../../hooks/useOrganizationSearch";
import {
  AuthContainer,
  InputField,
  AddInstituteModal,
  SearchDropdown,
  CollegeRow,
  ProgressBar,
  SectionCard,
} from "../../../components";
import { calculateProfileProgress, cleanObject } from "../../../utils/helper";

const EducationWorkScreen = () => {
  const dispatch: any = useDispatch();
  const formikRef = useRef<any>(null);
  const route = useRoute()

  const { user } = useSelector((state: any) => state.auth);
  const { degreeList, profileProgress } = useSelector((state: any) => state.profile);

  const isBusinessUser = user?.user_type === "business";

  const [openSchool, setOpenSchool] = useState(true);
  const [openCollege, setOpenCollege] = useState(false);
  const [openWork, setOpenWork] = useState(false);

  const [showAddInstitute, setShowAddInstitute] = useState(false);
  const [organizationType, setOrganizationType] = useState<"school" | "college" | "company">("school");

  const [stateOptions, setStateOptions] = useState<any[]>([]);

  const [showError, setShowError] = useState(false);

  const schoolSearch10 = useOrganizationSearch("school");
  const schoolSearch12 = useOrganizationSearch("school");
  const companySearch = useOrganizationSearch("company");

  // ------------------------------------------------------------
  // FETCH STATES + DISTRICTS
  // ------------------------------------------------------------
  useFocusEffect(
    React.useCallback(() => {
      const steps = {
        step1: true,
        step2: true,
        step3: route?.params?.type === 'business' ? true : false,
      };
      const newProgress = calculateProfileProgress(
        user.addresses,
        steps
      );

      dispatch(setProfileProgress(newProgress));
      dispatch(getDegree());
      fetchStates();
    }, [])
  );

  const fetchStates = async () => {
    const res: any = await dispatch(getStateCity({ type: "state" })).unwrap();
    setStateOptions(
      res?.map((i: any) => ({ id: i.state_id, label: i.state_name, value: i.state_id }))
    );
  };

  const buildEducationPayload = (values) => {
    const school = values.school.map((s) =>
      cleanObject({
        tenth_grade: cleanObject({
          grade: s.sslcGrade,
          year_of_passing: s.sslcYear,
          organization_id: s.schoolOrgId10th,
          school_name: s.schoolName10th,
        }),
        twelfth_grade: cleanObject({
          organization_id: s.schoolOrgId12th,
          school_name: s.schoolName12th,
          grade: s.hscGrade,
          year_of_passing: s.hscYear,
        }),
      })
    );

    const colleges = values.college.map((c) =>
      cleanObject({
        organization_id: c.orgId,
        degree: c.degree,
        college_name: c.collegeName,
        year_of_passing: c.passingYear,
      })
    );

    return cleanObject({ school, colleges });
  };

  const buildWorkPayload = (values) => {
    return {
      experiences: values.experiences.map((e) =>
        cleanObject({
          organization_id: e.orgId,
          company_name: e.companyName,
          position: e.position,
          from_year: e.joiningYear,
          to_year: e.leavingYear,
          state: e.state,
          district: e.district,
        })
      ),
    };
  };

  const checkFormFilled = (v) => {
    return (
      v.school.some(
        (s) =>
          s.schoolName?.trim() ||
          s.sslcGrade?.trim() ||
          s.sslcYear?.trim() ||
          s.hscGrade?.trim() ||
          s.hscYear?.trim()
      ) ||
      v.college.some(
        (c) => c.collegeName?.trim() || c.degree?.trim() || c.passingYear?.trim()
      ) ||
      v.experiences.some(
        (e) => e.companyName?.trim() || e.position?.trim() || e.joiningYear?.trim()
      )
    );
  };

  const handleSubmitPress = () => {
    const values = formikRef.current?.values;

    if (!checkFormFilled(values)) {
      setShowError(true);
      return;
    }

    setShowError(false);
    formikRef.current?.handleSubmit();
  };

  return (
    <AuthContainer
      headerTitle="Education & Work"
      isRight
      showLogo={false}
      btnTitle="Submit"
      secondBGColor={Colors.lightBg}
      onPress={handleSubmitPress}
      rightTxt="Skip"
      onRightPress={() => {
        dispatch(updateProfileCompleted(true));
        dispatch(resetProfileData());
        dispatch(fetchPublicUserProfile());
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, paddingHorizontal: Spacing.screenHorizontalPadding }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <ProgressBar step={profileProgress} />

          {/* ------------------------------------------------------------
              FORM START
          ------------------------------------------------------------ */}
          <Formik
            innerRef={formikRef}
            initialValues={{
              school: [
                {
                  schoolName10th: "",
                  schoolOrgId10th: "",
                  sslcGrade: "",
                  sslcYear: "",
                  schoolName12th: "",
                  schoolOrgId12th: "",
                  hscGrade: "",
                  hscYear: "",
                },
              ],
              college: [
                { degree: "", collegeName: "", orgId: "", passingYear: "" },
              ],
              experiences: [
                { companyName: "", orgId: "", position: "", joiningYear: "", leavingYear: "", state: "", district: "" },
              ],
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                // 1️⃣ Education
                const eduPayload = cleanObject(buildEducationPayload(values));
                const eduRes: any = await dispatch(updateEducation(eduPayload)).unwrap();

                // 2️⃣ Work
                let workId = "";
                const hasWork = values.experiences.some(
                  (e) => e.companyName || e.position || e.joiningYear || e.leavingYear
                );
                if (hasWork) {
                  const workPayload = cleanObject(buildWorkPayload(values));
                  const workRes: any = await dispatch(updateWork(workPayload)).unwrap();
                  workId = workRes?.data?._id;
                }

                // 3️⃣ Profile update
                let payload = cleanObject({
                  education: eduRes?.data?._id,
                  work: workId,
                });

                if (isBusinessUser) {
                  dispatch(updateBusinessProfile(payload))
                } else {
                  await dispatch(updateProfile(payload));
                }
                dispatch(resetProfileData());
                dispatch(updateProfileCompleted(true));
                dispatch(fetchPublicUserProfile());
                dispatch(getLoginProfile());
              } catch (err) {
                Alert.alert("Error", err?.message || "Something went wrong");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, setFieldValue }) => (
              <>
                {/* ------------------------------------------------------------
                    SCHOOL SECTION (FIELDARRAY)
                ------------------------------------------------------------ */}
                <SectionCard
                  title="School"
                  expanded={openSchool}
                  onToggle={() => {
                    setOpenSchool(!openSchool);
                    setOpenCollege(false);
                    setOpenWork(false);
                  }}
                >
                  <FieldArray name="school">
                    {({ remove }) => (
                      <>
                        {values.school.map((s, index) => (
                          <View key={index} style={{ marginBottom: 20 }}>

                            {index > 0 && (
                              <TouchableOpacity onPress={() => remove(index)}>
                                <Image source={Icons.cross} style={styles.crossIcon} tintColor={Colors.secondary} />
                              </TouchableOpacity>
                            )}

                            <SearchDropdown
                              label="School Name"
                              placeholder="St."
                              value={s.schoolName10th}
                              searchValue={schoolSearch10.search}
                              onChangeText={(txt) => {
                                schoolSearch10.setSearch(txt);
                                setFieldValue(`school[${index}].schoolName10th`, txt);
                              }}
                              visible={schoolSearch10.visible}
                              list={schoolSearch10.list}
                              isBold={true}
                              onSelect={(item) => {
                                schoolSearch10.setSearch("");
                                setFieldValue(`school[${index}].schoolOrgId10th`, item._id);
                                setFieldValue(`school[${index}].schoolName10th`, item.name);
                                schoolSearch10.setVisible(false);
                              }}
                              onClose={() => schoolSearch10.setVisible(false)}
                            />

                            {/* 10th */}
                            <View style={styles.row2}>
                              <View style={styles.half}>
                                <InputField
                                  label="10th / SSLC"
                                  value={s.sslcGrade}
                                  placeholder="Enter Grades"
                                  onChangeText={handleChange(`school[${index}].sslcGrade`)}
                                />
                              </View>
                              <View style={styles.half}>
                                <InputField
                                  label="Year of Passing"
                                  value={s.sslcYear}
                                  placeholder="Enter Year"
                                  keyboardType="numeric"
                                  maxLength={4}
                                  onChangeText={handleChange(`school[${index}].sslcYear`)}
                                  containerStyle={{ marginBottom: 0 }}
                                />
                              </View>
                            </View>

                            <SearchDropdown
                              label="School Name"
                              placeholder="St."
                              value={s.schoolName12th}
                              searchValue={schoolSearch12.search}
                              onChangeText={(txt) => {
                                schoolSearch12.setSearch(txt);
                                setFieldValue(`school[${index}].schoolName12th`, txt);
                              }}
                              visible={schoolSearch12.visible}
                              list={schoolSearch12.list}
                              isBold={true}
                              onSelect={(item) => {
                                schoolSearch12.setSearch("");
                                setFieldValue(`school[${index}].schoolOrgId12th`, item._id);
                                setFieldValue(`school[${index}].schoolName12th`, item.name);
                                schoolSearch12.setVisible(false);
                              }}
                              onClose={() => schoolSearch12.setVisible(false)}
                            />

                            {/* 12th */}
                            <View style={styles.row2}>
                              <View style={styles.half}>
                                <InputField
                                  label="12th / HSC"
                                  value={s.hscGrade}
                                  placeholder="Enter Grades"
                                  onChangeText={handleChange(`school[${index}].hscGrade`)}
                                  containerStyle={{ marginBottom: 0, }}
                                />
                              </View>
                              <View style={styles.half}>
                                <InputField
                                  label="Year of Passing"
                                  value={s.hscYear}
                                  placeholder="Enter Year"
                                  keyboardType="numeric"
                                  maxLength={4}
                                  onChangeText={handleChange(`school[${index}].hscYear`)}
                                  containerStyle={{ marginBottom: 0, }}
                                />
                              </View>
                            </View>

                          </View>
                        ))}

                        {/* ADD MORE */}
                        <View style={styles.rowBetween}>
                          <View />
                          <TouchableOpacity
                            onPress={() => {
                              setOrganizationType("school");
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>
                              ＋ Add Institution
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>

                {/* ------------------------------------------------------------
                    COLLEGE SECTION
                ------------------------------------------------------------ */}
                <SectionCard
                  title="College"
                  expanded={openCollege}
                  onToggle={() => {
                    setOpenCollege(!openCollege);
                    setOpenSchool(false);
                    setOpenWork(false);
                  }}
                >
                  <FieldArray name="college">
                    {({ push, remove }) => (
                      <>
                        {values.college.map((c, index) => (
                          <CollegeRow
                            key={index}
                            index={index}
                            row={c}
                            remove={remove}
                            degreeOptions={degreeList}
                            setFieldValue={setFieldValue}
                          />
                        ))}

                        <View style={styles.rowBetween}>
                          <TouchableOpacity onPress={() => push({ degree: "", collegeName: "", orgId: "", passingYear: "" })}>
                            <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>＋ Add More</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setOrganizationType("college");
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>＋ Add Institution</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>

                {/* ------------------------------------------------------------
                    WORK SECTION
                ------------------------------------------------------------ */}
                <SectionCard
                  title="Work"
                  expanded={openWork}
                  onToggle={() => {
                    setOpenWork(!openWork);
                    setOpenSchool(false);
                    setOpenCollege(false);
                  }}
                >
                  <FieldArray name="experiences">
                    {({ push, remove }) => (
                      <>
                        {values.experiences.map((e, index) => (
                          <View key={index} style={styles.workBlock}>
                            {index > 0 && (
                              <TouchableOpacity onPress={() => remove(index)}>
                                <Image source={Icons.cross} style={styles.crossIcon} tintColor={Colors.secondary} />
                              </TouchableOpacity>
                            )}

                            <InputField
                              label="Position"
                              value={e.position}
                              placeholder="Enter your Designation"
                              onChangeText={handleChange(`experiences[${index}].position`)}
                            />

                            <SearchDropdown
                              label="Company Name"
                              placeholder="In"
                              isBold={true}
                              value={e.companyName}
                              searchValue={companySearch.search}
                              onChangeText={(txt) => {
                                companySearch.setSearch(txt);
                                setFieldValue(`experiences[${index}].companyName`, txt);
                              }}
                              visible={companySearch.visible}
                              list={companySearch.list}
                              onSelect={(item) => {
                                companySearch.setSearch("");
                                setFieldValue(`experiences[${index}].companyName`, item.name);
                                setFieldValue(`experiences[${index}].orgId`, item._id);
                                companySearch.setVisible(false);
                              }}
                              onClose={() => companySearch.setVisible(false)}
                            />

                            <InputField
                              label="From year"
                              value={e.joiningYear}
                              placeholder="Enter Year"
                              keyboardType="number-pad"
                              maxLength={4}
                              onChangeText={handleChange(`experiences[${index}].joiningYear`)}
                            />

                            <InputField
                              label="To year"
                              value={e.leavingYear}
                              placeholder="Enter Year"
                              keyboardType="number-pad"
                              maxLength={4}
                              onChangeText={handleChange(`experiences[${index}].leavingYear`)}
                              containerStyle={{ marginBottom: 16 }}
                            />
                          </View>
                        ))}

                        <View style={styles.rowBetween}>
                          <TouchableOpacity
                            onPress={() =>
                              push({
                                companyName: "",
                                orgId: "",
                                position: "",
                                joiningYear: "",
                                leavingYear: "",
                                state: "",
                                district: "",
                              })
                            }
                          >
                            <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>
                              ＋ Add More
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setOrganizationType("company");
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>
                              ＋ Add Work Place
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>

                {/* ERROR MESSAGE */}
                {showError && (
                  <Text style={[Typography.black12Regular, { color: Colors.error, marginTop: 10, textAlign: "center" }]}>
                    Please fill at least one field to continue
                  </Text>
                )}
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ADD INSTITUTE MODAL */}
      <AddInstituteModal
        visible={showAddInstitute}
        onClose={() => setShowAddInstitute(false)}
        organizationType={organizationType}
        stateOptions={stateOptions}
      />
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingTop: 12, paddingBottom: 150 },

  row2: {
    flexDirection: "row",
    gap: 10
  },

  half: { flex: 1 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  crossIcon: { height: 20, width: 20, alignSelf: "flex-end" },

  workBlock: {
    // marginBottom: 22,
    paddingBottom: 10,
  },
});

export default EducationWorkScreen;
