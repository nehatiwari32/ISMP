import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from '../../../utils/toast';
import { FieldArray, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import {
  AddCategoryModal,
  AddInstituteModal,
  CollegeRow,
  CustomButton,
  CustomSwitch,
  InputField,
  MediaOptionsSheet,
  MultipleOptionsDropdown,
  ProgressBar,
  SearchDropdown,
  SectionCard,
  ViewContainer,
} from '../../../components';
import { Colors } from '../../../theme/colors';
import { Spacing, Typography } from '../../../theme/typography';
import { Icons } from '../../../assets/icons';
import PublicBadge from '../../../components/profile/PublicBadge';
import useOrganizationSearch from '../../../hooks/useOrganizationSearch';
import {
  enableGhoastMode,
  getStateCity,
} from '../../../redux/slices/authSlice';
import {
  uploadMedia,
  updateSettings,
  updateProfile,
  updateBusinessProfile,
  getIntrest,
  getIdentity,
  getProfession,
  updateWork,
  updateEducation,
  fetchBusinessUserProfile,
  getDegree,
  fetchPublicUserProfile,
  fetchSeetings,
  getCategories,
  bulkMedia,
} from '../../../redux/slices/profileSlice';
import { cleanObject, formatAddress, isVideo } from '../../../utils/helper';
import Video from 'react-native-video';
import { useMediaUpload } from '../../../utils/useMediaUpload';

const normalizeVisibility = (value: any) => {
  if (!value) return { visibility: 'public' };

  // if already object
  if (typeof value === 'object' && value.visibility) {
    return value;
  }

  // if string
  return { visibility: value };
};

const UserProfileSettings: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { degreeList, profileSettings, userProfile, categories, identityList } =
    useSelector((state: any) => state.profile);

  const { user } = useSelector((state: any) => state.auth);

  const isPhone = val => /^[0-9]{10}$/.test(val);
  const isEmail = val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);


  useFocusEffect(
    useCallback(() => {
      dispatch(getCategories());
      return () => { };
    }, [dispatch]),
  );

  const rawPhone =
    userProfile?.phone_number ||
    (isPhone(userProfile?.email_or_phone_number) ? userProfile?.email_or_phone_number : '');

  const rawEmail =
    (isEmail(userProfile?.email_or_phone_number) ? userProfile?.email_or_phone_number : '');

  const defaultPhone = isPhone(rawPhone) ? rawPhone : '';
  const defaultEmail = isEmail(rawEmail) ? rawEmail : '';

  const formikRef = useRef<any>(null);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const userType = user?.user_type;
  const [openSchool, setOpenSchool] = useState(true);
  const [openCollege, setOpenCollege] = useState(false);
  const [openWork, setOpenWork] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const [showAddInstitute, setShowAddInstitute] = useState(false);
  const [organizationType, setOrganizationType] = useState<
    'school' | 'college' | 'company'
  >('school');
  const [stateOptions, setStateOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interestList, setInterestList] = useState<any[]>([]);
  const [professionList, setProfessionList] = useState<any[]>([]);
  const [modalType, setModalType] = useState<
    'interest' | 'profession' | 'business'
  >('interest');
  const [openInterests, setOpenInterests] = useState(false);
  const [openProfession, setOpenProfession] = useState(false);
  const [ghostMode, setGhostMode] = useState(userProfile?.ghost_mode);
  const [uploadTarget, setUploadTarget] = useState<
    'profile' | 'gallery' | null
  >(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { pickSingle, pickMultiple } = useMediaUpload({
    dispatch,
    uploadAction: uploadMedia,
    bulkUploadAction: bulkMedia,
  });


  // Track visibility settings locally
  const [visibilitySettings, setVisibilitySettings] = useState<any>({
    profile_photo_url: normalizeVisibility(profileSettings?.profile_photo_url),
    phone_number: normalizeVisibility(profileSettings?.phone_number),
    email: normalizeVisibility(profileSettings?.email),
    dob: normalizeVisibility(profileSettings?.dob),
    gender: normalizeVisibility(profileSettings?.gender),
    school: normalizeVisibility(profileSettings?.school),
    college: normalizeVisibility(profileSettings?.college),
    work: normalizeVisibility(profileSettings?.work),
    interests: normalizeVisibility(profileSettings?.interests),
    profession: normalizeVisibility(profileSettings?.profession),
    identity: normalizeVisibility(profileSettings?.identity),
  });

  const schoolSearch10 = useOrganizationSearch('school');
  const schoolSearch12 = useOrganizationSearch('school');
  const companySearch = useOrganizationSearch('company');


  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchSeetings());
    }, []) // ✅ NO profileSettings dependency
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchStates();
      fetchDistricts();
      dispatch(getDegree());
      // Initialize visibil

      const fieldVisibility = profileSettings?.field_visibility || {};
      setVisibilitySettings({
        profile_photo_url: normalizeVisibility(fieldVisibility.profile_photo_url),
        phone_number: normalizeVisibility(fieldVisibility.phone_number),
        email: normalizeVisibility(fieldVisibility.email),
        dob: normalizeVisibility(fieldVisibility.dob),
        gender: normalizeVisibility(fieldVisibility.gender),
        school: normalizeVisibility(fieldVisibility.school),
        college: normalizeVisibility(fieldVisibility.college),
        work: normalizeVisibility(fieldVisibility.work),
        interests: normalizeVisibility(fieldVisibility.interests),
        profession: normalizeVisibility(fieldVisibility.profession),
        identity: normalizeVisibility(fieldVisibility.identity),
      });

    }, [profileSettings])
  );

  useFocusEffect(
    useCallback(() => {
      if (user?.user_type === "business") {
        dispatch(fetchBusinessUserProfile());
      } else {
        dispatch(fetchPublicUserProfile());
      }
    }, [dispatch]),
  );

  useEffect(() => {
    const fetchLists = async () => {
      try {
        await dispatch(getIdentity());
        const interestRes = await dispatch(getIntrest()).unwrap();
        const professionRes = await dispatch(getProfession()).unwrap();
        setInterestList(interestRes || []);
        setProfessionList(professionRes || []);
      } catch (error) {
        console.log('Error fetching categories:', error);
      }
    };

    fetchLists();
  }, [dispatch, showAddCategoryModal]);

  const fetchStates = async () => {
    const res: any = await dispatch(getStateCity({ type: 'state' })).unwrap();
    setStateOptions(
      res?.map((i: any) => ({
        id: i.state_id,
        label: i.state_name,
        value: i.state_id,
      })),
    );
  };

  const fetchDistricts = async () => {
    const res: any = await dispatch(
      getStateCity({ type: 'district' }),
    ).unwrap();
    setDistrictOptions(
      res?.map((i: any) => ({
        id: i.district_id,
        label: i.district_name,
        value: i.district_id,
      })),
    );
  };

  const handleVisibilityChange = (field: string, value: any) => {
    setVisibilitySettings((prev: any) => ({
      ...prev,
      [field]: {
        visibility: typeof value === "string" ? value : value.visibility,
        friends_except: value?.friends_except || [],
        specific_friends: value?.specific_friends || [],
      },
    }));
  };


  const handleSubmitPress = () => {
    if (formikRef.current) formikRef.current.handleSubmit();
  };

  const buildEducationPayload = values => {
    return cleanObject({
      school: values.school.map(s =>
        cleanObject({
          tenth_grade: cleanObject({
            grade: s.sslcGrade,
            year_of_passing: s.sslcYear,
            organization_id: s.schoolOrgId10th,
            school_name: s.schoolName10th,
          }),
          twelfth_grade: cleanObject({
            grade: s.hscGrade,
            year_of_passing: s.hscYear,
            organization_id: s.schoolOrgId12th,
            school_name: s.schoolName12th,
          }),
        }),
      ),
      colleges: values.college.map(c =>
        cleanObject({
          organization_id: c.orgId,
          degree: c.degree,
          college_name: c.collegeName,
          year_of_passing: c.passingYear,
        }),
      ),
    });
  };

  const buildWorkPayload = values => {
    return cleanObject({
      experiences: values.experiences.map(e =>
        cleanObject({
          organization_id: e.orgId,
          company_name: e.companyName,
          position: e.position,
          from_year: Number(e.joiningYear),
          to_year: Number(e.leavingYear),
          state: e.state,
          district: e.district,
        }),
      ),
    });
  };

  const shouldUpdateEducation = values => {
    return (
      values.school.some(
        s =>
          s.schoolName ||
          s.schoolOrgId ||
          s.sslcGrade ||
          s.sslcYear ||
          s.hscGrade ||
          s.hscYear,
      ) ||
      values.college.some(
        c => c.degree || c.collegeName || c.orgId || c.passingYear,
      )
    );
  };

  const shouldUpdateWork = values => {
    return values.experiences.some(
      e =>
        e.companyName ||
        e.position ||
        e.orgId ||
        e.joiningYear ||
        e.leavingYear,
    );
  };

  const handleFormSubmit = async (values: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const normalizeVisibility = (value: any) =>
        typeof value === 'string' ? { visibility: value } : value;

      const settingPayload = {
        profile_type: userType === 'business' ? 'business' : 'public',
        field_visibility: Object.fromEntries(
          Object.entries(visibilitySettings).map(([key, value]) => [
            key,
            normalizeVisibility(value),
          ])
        ),
      };

      await dispatch(updateSettings(settingPayload)).unwrap();

      const profilePayload: any = cleanObject({
        name: values.name,
        description: values.description,
        phone_number: values.mobile,
        email: values.email,
        dob: values.dob,
        gender: values.gender,
        identity: values.identity,
        interests: values.interests,
        profession: values.profession,
        ...(userType === 'business'
          ? { business_profile_photo_url: values.profile_photo_url }
          : { profile_photo_url: values.profile_photo_url }),
      });


      let educationId: string | null = null;
      let workId: string | null = null;

      // ---- Update Education ----
      if (shouldUpdateEducation(values)) {
        const eduPayload = buildEducationPayload(values);

        const eduRes: any = await dispatch(
          updateEducation(eduPayload),
        ).unwrap();
        educationId = eduRes?.data?._id;
        profilePayload.education = educationId;
      }
      if (shouldUpdateWork(values)) {
        const workPayload = buildWorkPayload(values);

        const workRes: any = await dispatch(updateWork(workPayload)).unwrap();
        workId = workRes?.data?._id;
        profilePayload.work = workId;
      }

      if (userType === 'business' && values.selectedCategories) {
        console.log('if>>>>>>>');
        
        let businessPayload = profilePayload;
        if (values.selectedCategories.length > 0) {
          businessPayload.business_categories = values.selectedCategories;
        }
        if (values.website_url) {
          businessPayload.website_url = values.website_url;
        }
        if (values.galleryMedia.length > 0) {
          businessPayload.business_images = values.galleryMedia;
        }
        if (values.company_description) {
          businessPayload.company_description = values.companyDescription;
        }

        await dispatch(updateBusinessProfile(businessPayload)).unwrap();
        dispatch(fetchBusinessUserProfile());
      } else {
        await dispatch(updateProfile(profilePayload)).unwrap();
        dispatch(fetchPublicUserProfile());
      }
      navigation.goBack();
    } catch (error: any) {
      console.log('Submit error:', error);
      Toast.error(error?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGhostToggle = useCallback(
    async (value: boolean) => {
      setGhostMode(value);
      try {
        const payload = { enable: value };
        const res: any = await dispatch(enableGhoastMode(payload)).unwrap();
        if (res?.statusCode === 200 || res?.statusCode === '200') {
          Toast.success(

            value ? 'Ghost Mode enabled.' : 'Ghost Mode disabled.',
          );
        }
      } catch (err: any) {
        Toast.error(err?.message || 'Something went wrong.');
        setGhostMode(prev => !prev);
      }
    },
    [dispatch],
  );

  const shouldShowBusiness = userType === 'business';

  const identityValue = identityList
    ?.map(item => item.identity_name)
    .join(', ');


  const validateProfile = (values: any) => {
    const errors: any = {};

    // ------------------------
    // Name Validation
    // ------------------------
    if (!values.name || values.name.trim() === '') {
      errors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/.test(values.name)) {
      errors.name = 'Name should contain only letters and spaces';
    }

    // ------------------------
    // Mobile Validation
    // ------------------------
    if (values.mobile) {
      if (!/^[0-9]{10}$/.test(values.mobile)) {
        errors.mobile = 'Mobile number must be 10 digits';
      }
    }

    // ------------------------
    // SCHOOL Validation
    // ------------------------
    if (values.school?.length) {
      const schoolErrors: any[] = [];

      values.school.forEach((s: any, index: number) => {
        const schoolError: any = {};

        if (s.sslcGrade && !/^[A-Za-z\s]+$/.test(s.sslcGrade)) {
          schoolError.sslcGrade = 'Grade must contain only alphabets';
        }

        if (s.hscGrade && !/^[A-Za-z\s]+$/.test(s.hscGrade)) {
          schoolError.hscGrade = 'Grade must contain only alphabets';
        }

        if (s.sslcYear && !/^[0-9]{4}$/.test(s.sslcYear)) {
          schoolError.sslcYear = 'Year must be 4 digit number';
        }

        if (s.hscYear && !/^[0-9]{4}$/.test(s.hscYear)) {
          schoolError.hscYear = 'Year must be 4 digit number';
        }

        if (Object.keys(schoolError).length > 0) {
          schoolErrors[index] = schoolError;
        }
      });

      if (schoolErrors.length > 0) {
        errors.school = schoolErrors;
      }
    }

    // ------------------------
    // COLLEGE Validation
    // ------------------------
    if (values.college?.length) {
      const collegeErrors: any[] = [];

      values.college.forEach((c: any, index: number) => {
        const collegeError: any = {};

        if (c.passingYear && !/^[0-9]{4}$/.test(c.passingYear)) {
          collegeError.passingYear = 'Passing year must be 4 digit number';
        }

        if (Object.keys(collegeError).length > 0) {
          collegeErrors[index] = collegeError;
        }
      });

      if (collegeErrors.length > 0) {
        errors.college = collegeErrors;
      }
    }
    // EXPERIENCE Validation
    // ------------------------
    if (values.experiences?.length) {

      const expErrors: any[] = [];

      values.experiences.forEach((e: any, index: number) => {

        const expError: any = {};

        // validate joining year format
        if (e.joiningYear && !/^[0-9]{4}$/.test(e.joiningYear)) {
          expError.joiningYear = 'Year must be 4 digit number';
        }

        // validate leaving year format
        if (e.leavingYear && !/^[0-9]{4}$/.test(e.leavingYear)) {
          expError.leavingYear = 'Year must be 4 digit number';
        }

        // ✅ validate leaving year must be greater than joining year
        if (
          e.joiningYear &&
          e.leavingYear &&
          /^[0-9]{4}$/.test(e.joiningYear) &&
          /^[0-9]{4}$/.test(e.leavingYear)
        ) {
          if (parseInt(e.leavingYear) <= parseInt(e.joiningYear)) {
            expError.leavingYear =
              'Leaving year must be greater than joining year';
          }
        }

        if (Object.keys(expError).length > 0) {
          expErrors[index] = expError;
        }

      });

      if (expErrors.length > 0) {
        errors.experiences = expErrors;
      }

    }

    return errors;
  };

  const isBaseComplete =
    userProfile?.isInterest === true &&
    userProfile?.isEduwork === true &&
    userProfile?.isProfileComplete === true &&
    userProfile?.userAddress?.length >= 1;

  const isProfileFullyComplete =
    userProfile?.type === "business"
      ? isBaseComplete && userProfile?.isBusinessTiming === true
      : isBaseComplete;

  const profilePercentage = isProfileFullyComplete
    ? 100
    : userProfile?.percentageCompletion || 0;


  const removeGalleryAt = (index: number, values: any, setFieldValue: any) => {
    const next = (values?.galleryMedia || []).filter(
      (_: any, i: number) => i !== index,
    );
    setFieldValue('galleryMedia', next);
  };

  return (
    <ViewContainer
      headerTitle="User Profile Settings"
      containerStyle={{ paddingHorizontal: 0 }}
      bottomFixedComponent={
        <View style={styles.bottomFixed}>
          <CustomButton
            title="Cancel"
            textColor={Colors.primary}
            onPress={() => navigation.goBack()}
            buttonStyle={styles.cancelBtn}
          />
          <CustomButton
            title="Submit"
            buttonStyle={styles.saveBtn}
            onPress={handleSubmitPress}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.lightBg,
          paddingBottom: '25%',
        }}
      >
        <Formik
          innerRef={formikRef}
          enableReinitialize={true}
          initialValues={{
            profile_photo_url: userProfile?.profile_photo_url || userProfile?.business_profile_photo_url || '',
            name: userProfile?.name || userProfile?.full_name || '',
            description: userProfile?.description || '',
            mobile: defaultPhone || null,
            email: defaultEmail || '',
            dob: userProfile?.dob || '',
            gender: userProfile?.gender || '',
            identity: userProfile?.identity || '',
            interests: userProfile?.interests || [],
            profession: userProfile?.profession || [],
            website_url: userProfile.website_url || '',
            selectedCategories: userProfile?.business_categories || [],
            galleryMedia: userProfile?.business_images || [],
            companyDescription: userProfile?.company_description || '',
            school: [
              {
                schoolName10th:
                  userProfile?.education?.school?.[0]?.tenth_grade
                    ?.school_name || '',
                schoolOrgId10th:
                  userProfile?.education?.school?.[0]?.tenth_grade
                    ?.organization_id || '',
                sslcGrade:
                  userProfile?.education?.school?.[0]?.tenth_grade?.grade || '',
                sslcYear:
                  userProfile?.education?.school?.[0]?.tenth_grade?.year_of_passing?.toString() ||
                  '',
                schoolName12th:
                  userProfile?.education?.school?.[0]?.twelfth_grade
                    ?.school_name || '',
                schoolOrgId12th:
                  userProfile?.education?.school?.[0]?.twelfth_grade
                    ?.organization_id || '',
                hscGrade:
                  userProfile?.education?.school?.[0]?.twelfth_grade?.grade ||
                  '',
                hscYear:
                  userProfile?.education?.school?.[0]?.twelfth_grade?.year_of_passing?.toString() ||
                  '',
              },
            ],
            college: userProfile?.education?.colleges?.length
              ? userProfile.education.colleges.map(c => ({
                degree: c.degree || '',
                collegeName: c.college_name || '',
                orgId: c.organization_id || '',
                passingYear: c.year_of_passing?.toString() || '',
              }))
              : [{ degree: '', collegeName: '', orgId: '', passingYear: '' }],
            experiences: userProfile?.work?.experiences?.length
              ? userProfile.work.experiences.map(e => ({
                companyName: e.company_name || '',
                orgId: e.organization_id || '',
                position: e.position || '',
                joiningYear: e.from_year?.toString() || '',
                leavingYear: e.to_year?.toString() || '',
                state: e.state || '',
                district: e.district || '',
              }))
              : [
                {
                  companyName: '',
                  orgId: '',
                  position: '',
                  joiningYear: '',
                  leavingYear: '',
                  state: '',
                  district: '',
                },
              ],
          }}
          validate={validateProfile}
          onSubmit={handleFormSubmit}
        >
          {({ values, handleChange, setFieldValue, errors, touched }) => (

            <View style={styles.containerInner}>
              <Text
                style={[
                  Typography.black14Bold,
                  { color: '#3C3C3C', marginVertical: 10 },
                ]}
              >
                Pls complete Your Profile 100 % ASAP to Benefit
              </Text>
              <ProgressBar step={profilePercentage} />

              <View style={[styles.rowBetween, { alignItems: 'center' }]}>
                <View style={styles.avatarWrap}>
                  {uploadingProfile ? (
                    <View style={[styles.avatarIcon, styles.avatarLoading]}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  ) : values.profile_photo_url ? (
                    <Image
                      source={{ uri: values.profile_photo_url }}
                      style={styles.avatarIcon}
                    />
                  ) : (
                    <View style={styles.avatarIcon}>
                      <Image
                        source={Icons.publicUser}
                        style={styles.userIcon}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.avatarCam}
                    onPress={() => {
                      setUploadTarget('profile');
                      setShowPicker(true);
                    }}
                    disabled={uploadingProfile}
                  >
                    <Image source={Icons.fillCamera} style={styles.camIcon} />
                  </TouchableOpacity>
                </View>
                <PublicBadge
                  fieldVisibility={visibilitySettings.profile_photo_url}
                  onChange={newVisibility =>
                    handleVisibilityChange('profile_photo_url', newVisibility)
                  }
                />
              </View>

              <InputField
                label="Name*"
                value={values.name}
                onChangeText={handleChange('name')}
                error={touched.name && errors.name}
              />

              <InputField
                label="Description (Optional)"
                placeholder="Write here.."
                value={values.description}
                onChangeText={handleChange('description')}
              />

              <InputField
                label="Mobile Number"
                value={values.mobile}
                editable={defaultPhone ? false : true}
                onChangeText={handleChange('mobile')}
                disabledColor={defaultPhone ? Colors.border : '#fff'}
                error={touched.mobile && errors.mobile}
                keyboardType="number-pad"
                maxLength={10}
                badgeComponent={
                  <PublicBadge
                    fieldVisibility={visibilitySettings.phone_number?.visibility}
                    onChange={newVisibility =>
                      handleVisibilityChange('phone_number', newVisibility)
                    }
                  />
                }
              />

              <InputField
                label="Email Address"
                value={values.email}
                onChangeText={handleChange('email')}
                keyboardType="email-address"
                editable={defaultEmail ? false : true}
                disabledColor={defaultEmail ? Colors.border : '#fff'}
                badgeComponent={
                  <PublicBadge
                    fieldVisibility={visibilitySettings.email}
                    onChange={newVisibility =>
                      handleVisibilityChange('email', newVisibility)
                    }
                  />
                }
              />

              <MultipleOptionsDropdown
                label="Interests"
                placeholder="Select interests"
                data={interestList}
                selectedValue={values.interests}
                onSelect={arr => setFieldValue('interests', arr)}
                showAddNew
                onAddNew={() => {
                  setModalType('interest');
                  setShowAddCategoryModal(true);
                }}
                expanded={openInterests}
                setExpanded={v => {
                  setOpenInterests(v);
                  if (v) {
                    setOpenProfession(false);
                  }
                }}
                type="interest"
                badgeComponent={
                  <PublicBadge
                    fieldVisibility={visibilitySettings.interests}
                    onChange={newVisibility =>
                      handleVisibilityChange('interests', newVisibility)
                    }
                  />
                }
              />

              {/* Profession */}
              <MultipleOptionsDropdown
                label="Profession"
                placeholder="Select profession"
                data={professionList}
                selectedValue={values.profession}
                onSelect={arr => setFieldValue('profession', arr)}
                showAddNew
                onAddNew={() => {
                  setModalType('profession');
                  setShowAddCategoryModal(true);
                }}
                expanded={openProfession}
                setExpanded={v => {
                  setOpenProfession(v);
                  if (v) {
                    setOpenInterests(false);
                  }
                }}
                type="profession"
                badgeComponent={
                  <PublicBadge
                    fieldVisibility={visibilitySettings.profession}
                    onChange={newVisibility =>
                      handleVisibilityChange('profession', newVisibility)
                    }
                  />
                }
              />

              {/* Identity */}
              {identityList?.length > 0 && (
                <InputField
                  label="Identity"
                  placeholder="Select Identity"
                  value={identityValue}
                  editable={false}
                  disabledColor={Colors.border}
                  badgeComponent={
                    <PublicBadge
                      fieldVisibility={visibilitySettings.identity}
                      onChange={newVisibility =>
                        handleVisibilityChange('identity', newVisibility)
                      }
                    />
                  }
                />
              )}

              <>
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
                          <View
                            key={`school-${index}`}
                            style={{ marginBottom: 20 }}
                          >
                            {index > 0 && (
                              <TouchableOpacity onPress={() => remove(index)}>
                                <Image
                                  source={Icons.cross}
                                  style={styles.crossIcon}
                                  tintColor={Colors.secondary}
                                />
                              </TouchableOpacity>
                            )}

                            <SearchDropdown
                              label="School Name"
                              placeholder="St."
                              value={s.schoolName10th}
                              searchValue={schoolSearch10.search}
                              visible={schoolSearch10.visible}
                              list={schoolSearch10.list}
                              isBold={true}
                              onChangeText={txt => {
                                schoolSearch10.setSearch(txt);
                                schoolSearch10.setVisible(true);
                                setFieldValue(
                                  `school[${index}].schoolOrgId10th`,
                                  '',
                                );
                                if (!txt.trim()) {
                                  setFieldValue(
                                    `school[${index}].schoolName10th`,
                                    '',
                                  );
                                }
                              }}
                              onSelect={item => {
                                setFieldValue(
                                  `school[${index}].schoolOrgId10th`,
                                  item._id,
                                );

                                setFieldValue(
                                  `school[${index}].schoolName10th`,
                                  item.name,
                                );
                                schoolSearch10.setSearch('');
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
                                  error={
                                    touched.school?.[index]?.sslcGrade &&
                                    errors.school?.[index]?.sslcGrade
                                  }
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
                                  error={
                                    touched.school?.[index]?.sslcYear &&
                                    errors.school?.[index]?.sslcYear
                                  }
                                  containerStyle={{ marginBottom: 0 }}
                                />

                              </View>
                            </View>

                            <SearchDropdown
                              label="School Name"
                              placeholder="St."
                              value={s.schoolName12th}
                              searchValue={schoolSearch12.search}
                              onChangeText={txt => {
                                schoolSearch12.setSearch(txt);
                                schoolSearch12.setVisible(true);

                                setFieldValue(
                                  `school[${index}].schoolName12th`,
                                  txt,
                                );
                              }}
                              visible={schoolSearch12.visible}
                              list={schoolSearch12.list}
                              isBold={true}
                              onSelect={item => {
                                // ⭐ IMPORTANT — set search ALSO
                                schoolSearch12.setSearch(item.name);

                                setFieldValue(
                                  `school[${index}].schoolOrgId12th`,
                                  item._id,
                                );
                                setFieldValue(
                                  `school[${index}].schoolName12th`,
                                  item.name,
                                );

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
                                  error={
                                    touched.school?.[index]?.hscGrade &&
                                    errors.school?.[index]?.hscGrade
                                  }
                                  containerStyle={{ marginBottom: 0 }}
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
                                  error={
                                    touched.school?.[index]?.hscYear &&
                                    errors.school?.[index]?.hscYear
                                  }
                                  containerStyle={{ marginBottom: 0 }}
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
                              setOrganizationType('school');
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text
                              style={[
                                Typography.black14Bold,
                                { color: Colors.secondary },
                              ]}
                            >
                              ＋ Add Institution
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>

                <SectionCard
                  title="College"
                  expanded={openCollege}
                  onToggle={() => {
                    setOpenCollege(!openCollege);
                    setOpenSchool(false);
                    setOpenWork(false);
                  }}
                  badgeComponent={
                    <PublicBadge
                      fieldVisibility={visibilitySettings.college}
                      onChange={newVisibility =>
                        handleVisibilityChange('college', newVisibility)
                      }
                    />
                  }
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
                            errors={errors}
                            touched={touched}
                          />
                        ))}

                        <View style={styles.rowBetween}>
                          <TouchableOpacity
                            onPress={() =>
                              push({
                                degree: '',
                                collegeName: '',
                                orgId: '',
                                passingYear: '',
                              })
                            }
                          >
                            <Text
                              style={[
                                Typography.black14Bold,
                                { color: Colors.secondary },
                              ]}
                            >
                              ＋ Add More
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setOrganizationType('college');
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text
                              style={[
                                Typography.black14Bold,
                                { color: Colors.secondary },
                              ]}
                            >
                              ＋ Add Institution
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>

                <SectionCard
                  title="Work"
                  expanded={openWork}
                  onToggle={() => {
                    setOpenWork(!openWork);
                    setOpenSchool(false);
                    setOpenCollege(false);
                  }}
                  badgeComponent={
                    <PublicBadge
                      fieldVisibility={visibilitySettings.work}
                      onChange={newVisibility =>
                        handleVisibilityChange('work', newVisibility)
                      }
                    />
                  }
                >
                  <FieldArray name="experiences">
                    {({ push, remove }) => (
                      <>
                        {values.experiences.map((e, index) => (
                          <View key={`exp-${index}`} style={styles.workBlock}>
                            {index > 0 && (
                              <TouchableOpacity onPress={() => remove(index)}>
                                <Image
                                  source={Icons.cross}
                                  style={styles.crossIcon}
                                  tintColor={Colors.secondary}
                                />
                              </TouchableOpacity>
                            )}

                            <InputField
                              label="Position"
                              value={e.position}
                              placeholder="Enter your Designation"
                              onChangeText={handleChange(
                                `experiences[${index}].position`,
                              )}
                            />

                            <SearchDropdown
                              label="Company Name"
                              placeholder="In"
                              isBold={true}
                              value={e.companyName}
                              searchValue={companySearch.search}
                              visible={companySearch.visible}
                              list={companySearch.list}
                              onChangeText={txt => {
                                // ✅ Typing → search state only
                                companySearch.setSearch(txt);
                                companySearch.setVisible(true);

                                // ⭐ IMPORTANT → typing means old selection invalid
                                setFieldValue(
                                  `experiences[${index}].orgId`,
                                  '',
                                );

                                // ⭐ If user clears input → clear form value
                                if (!txt.trim()) {
                                  setFieldValue(
                                    `experiences[${index}].companyName`,
                                    '',
                                  );
                                }
                              }}
                              onSelect={item => {
                                // ✅ Commit selection to Formik
                                setFieldValue(
                                  `experiences[${index}].companyName`,
                                  item.name,
                                );

                                setFieldValue(
                                  `experiences[${index}].orgId`,
                                  item._id,
                                );

                                // ✅ Clear search AFTER select
                                companySearch.setSearch('');

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
                              error={
                                touched.experiences?.[index]?.joiningYear &&
                                errors.experiences?.[index]?.joiningYear
                              }
                            />


                            <InputField
                              label="To year"
                              value={e.leavingYear}
                              placeholder="Enter Year"
                              keyboardType="number-pad"
                              maxLength={4}
                              onChangeText={handleChange(`experiences[${index}].leavingYear`)}
                              error={
                                touched.experiences?.[index]?.leavingYear &&
                                errors.experiences?.[index]?.leavingYear
                              }
                              containerStyle={{ marginBottom: 16 }}
                            />

                          </View>
                        ))}

                        <View style={styles.rowBetween}>
                          <TouchableOpacity
                            onPress={() =>
                              push({
                                companyName: '',
                                orgId: '',
                                position: '',
                                joiningYear: '',
                                leavingYear: '',
                                state: '',
                                district: '',
                              })
                            }
                          >
                            <Text
                              style={[
                                Typography.black14Bold,
                                { color: Colors.secondary },
                              ]}
                            >
                              ＋ Add More
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setOrganizationType('company');
                              setShowAddInstitute(true);
                            }}
                          >
                            <Text
                              style={[
                                Typography.black14Bold,
                                { color: Colors.secondary },
                              ]}
                            >
                              ＋ Add Company
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </FieldArray>
                </SectionCard>
              </>

              {shouldShowBusiness && (
                <>
                  <Text style={[Typography.black14Bold, { marginTop: '5%', color: Colors.secondaryText }]}>COMPANY DETAILS</Text>
                  <MultipleOptionsDropdown
                    label="Business"
                    placeholder="Select Category"
                    containerStyle={{ marginTop: 8 }}
                    data={categories}
                    selectedValue={values.selectedCategories}
                    onSelect={arr => setFieldValue('selectedCategories', arr)}
                    showAddNew
                    onAddNew={() => setShowAddCategoryModal(true)}
                    expanded={openCategory}
                    setExpanded={v => {
                      setOpenCategory(v);
                    }}
                  />


                  <InputField
                    label="Website URL (optional)"
                    placeholder="https://www.example.com"
                    value={values.website_url}
                    onChangeText={handleChange('website_url')}
                  />

                  <Text
                    style={[
                      Typography.black14Regular,
                      { color: Colors.secondaryText },
                    ]}
                  >
                    Business Images (optional){' '}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >

                    {values?.galleryMedia.map(
                      (uri: string, index: number) => (
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
                            onPress={() =>
                              removeGalleryAt(index, values, setFieldValue)
                            }
                          >
                            <Text style={styles.crossText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ),
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={() => {
                      setUploadTarget('gallery');
                      setShowPicker(true);
                    }}
                    disabled={uploadingGallery}
                  >
                    {uploadingGallery ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors.primary}
                      />
                    ) : (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Image
                          source={Icons.upload}
                          style={styles.uploadSmall}
                        />
                        <Text
                          style={[
                            Typography.black14Medium,
                            { color: '#A3A3A3' },
                          ]}
                        >
                          Upload from Gallery
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>


                  <InputField
                    label="Company Description"
                    placeholder="Tell us about your business..."
                    value={values.companyDescription}
                    onChangeText={handleChange('companyDescription')}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}
              <MediaOptionsSheet
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                onCamera={async () => {
                  setShowPicker(false);

                  if (uploadTarget === 'profile') {
                    await pickSingle({
                      from: 'camera',
                      type: 'user',
                      setLoading: setUploadingProfile,
                      onUploaded: (url: string) =>
                        setFieldValue('profile_photo_url', url),
                    });
                  }

                }}
                onGallery={async () => {
                  setShowPicker(false);
                  if (uploadTarget === 'profile') {
                    await pickSingle({
                      from: 'gallery',
                      type: 'user',
                      setLoading: setUploadingProfile,
                      onUploaded: (url: string) =>
                        setFieldValue('profile_photo_url', url),
                    });
                  }

                  if (uploadTarget === 'gallery') {
                    await pickMultiple({
                      type: 'user',
                      setLoading: setUploadingGallery,
                      currentImageCount: (values.galleryMedia || []).filter((uri: string) => !isVideo(uri)).length,
                      currentVideoCount: (values.galleryMedia || []).filter((uri: string) => isVideo(uri)).length,
                      onImagesUploaded: (imageUrls: string[]) => {
                        setFieldValue('galleryMedia', [
                          ...(values.galleryMedia || []),
                          ...imageUrls,
                        ]);
                      },

                      onVideosUploaded: (videoUrls: string[]) => {
                        setFieldValue('galleryMedia', [
                          ...(values.galleryMedia || []),
                          ...videoUrls,
                        ]);
                      },
                    });
                  }
                }}
              />
              <AddCategoryModal
                visible={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                type={modalType}
                title="Add Category"
              />
            </View>
          )}
        </Formik>
        <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding }}>
          <Text style={[Typography.black14Medium, { color: '#828692' }]}>
            LOCATION
          </Text>

          {userProfile?.addresses?.map(
            (item: { id: any; _id: any }, index: any) => {
              return (
                <View
                  style={styles.addressContainer}
                  key={item?.id || item?._id || index}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <Image
                      source={Icons.greenMap}
                      style={styles.locationIcon}
                    />
                    <Text
                      style={[Typography.black12Medium, { color: '#383838' }]}
                    >
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
              );
            },
          )}
          <TouchableOpacity
            style={styles.addLocalityButton}
            onPress={() => navigation.navigate('MyLocalityScreen')}
          >
            <Text style={styles.addLocalitySymbol}>+</Text>
            <Text style={styles.addLocalityText}>
              Add Your {userProfile?.addresses?.length + 1}ᵗʰ Preferred Locality
            </Text>
          </TouchableOpacity>
          <View style={styles.ghostContainer}>
            <View style={styles.ghostContent}>
              <View style={styles.ghostTextContainer}>
                <Text style={styles.ghostTitle}>Ghost Mode</Text>
                <Text style={styles.ghostSubtitle}>
                  When Enabled, your friends can't see your location
                </Text>
              </View>
            </View>

            <CustomSwitch value={ghostMode} onValueChange={handleGhostToggle} />
          </View>
        </View>
      </View >
      <AddInstituteModal
        visible={showAddInstitute}
        onClose={() => setShowAddInstitute(false)}
        organizationType={organizationType}
        stateOptions={stateOptions}
        districtOptions={districtOptions}
      />


    </ViewContainer >
  );
};

export default UserProfileSettings;
