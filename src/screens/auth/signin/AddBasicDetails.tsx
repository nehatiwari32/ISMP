import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';

import {
  AuthContainer,
  CustomCheckbox,
  InputField,
  UsernameField,
} from '../../../components';
import { Colors } from '../../../theme/colors';
import {
  addUserBasicDetails,
  getLoginProfile,
  updateProfileCompleted,
} from '../../../redux/slices/authSlice';
import { Typography } from '../../../theme/typography';
import { Icons } from '../../../assets/icons';
import {
  addBasicDetailsSchema,
  addBasicDetailsSchema1,
} from '../../../utils/validation';

const AddBasicDetails = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const route = useRoute();
  const scrollRef = React.useRef<any>(null);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useSelector((state: any) => state.profile);


  const handleFinish = async (values: any, { setSubmitting }: any) => {

    setLoading(true);

    try {
      const payload = {
        gender: values?.gender || '',
        user_type: values?.user_type || 'public',
        introducer_id: values?.introducer_id || '',
        user_id: values.user_id,
        password: values.password,
        dob: values.dob ? moment(values.dob).format('DD-MM-YYYY') : '',
      };

      const res: any = await dispatch(addUserBasicDetails(payload)).unwrap();
      if (res?.statusCode === 200 || res?.statusCode === '200') {
        console.log('SUCCESS RESPONSE RECEIVED ✅');
        dispatch(updateProfileCompleted(true));
        if (route?.params?.isBack === true) {
          navigation.goBack();
        }
      }
    } catch (err: any) {
      console.log('API ERROR:', err);
      Alert.alert(
        'Error',
        typeof err === 'string' ? err : 'Something went wrong',
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        user_id: '',
        password: '',
        dob: '',
        user_type: 'public',
        gender: '',
        introducer_id: '',
        isAdult: false,
        isAgree: false,
      }}
      validationSchema={
        (route?.params as any)?.isBack === true
          ? addBasicDetailsSchema1
          : addBasicDetailsSchema
      }
      onSubmit={handleFinish}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
      }) => (
        <AuthContainer
          btnTitle="Submit"
          onPress={handleSubmit}
          loading={isSubmitting || loading}
          scrollRef={scrollRef}
          showLogo={(route?.params as any)?.isBack ? false : true}
        >
          <View style={styles.formWrapper}>
            {/* Full Name (Prefilled & Disabled) */}
            <InputField
              label="Full Name"
              value={userProfile?.full_name || ''}
              editable={false}
              disabledColor={userProfile?.full_name ? Colors.border : '#fff'}
              onChangeText={function (text: string): void {
                throw new Error('Function not implemented.');
              }}
            />

            <Text style={styles.genderText}>Gender (Optional)</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'others'] as const).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    values.gender === g && styles.genderBtnActive,
                  ]}
                  onPress={() => setFieldValue('gender', g)}
                >
                  <Image
                    source={
                      g === 'male'
                        ? Icons.male
                        : g === 'female'
                          ? Icons.female
                          : Icons.others
                    }
                    style={[
                      styles.genderIcon,
                      values.gender === g && { tintColor: '#fff' },
                    ]}
                  />
                  <Text
                    style={[
                      Typography.black13Medium,
                      {
                        color:
                          values.gender === g ? '#fff' : Colors.primaryLight,
                      },
                    ]}
                  >
                    {g[0].toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Username */}
            <Text
              style={[
                Typography.black20Bold,
                { marginTop: '4%', marginBottom: '2%' },
              ]}
            >
              Create User ID/Name
            </Text>
            <Text
              style={[
                Typography.black14Regular,
                { color: Colors.secondaryText, marginBottom: '3%' },
              ]}
            >
              This would only be displayed in Your Profile
            </Text>

            <UsernameField
              label={false}
              values={values.user_id}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errors={errors}
              touched={touched}
            />

            {/* Password */}
            <Text
              style={[
                Typography.black20Bold,
                { marginTop: '4%', marginBottom: '2%' },
              ]}
            >
              Create Password
            </Text>
            <InputField
              value={values.password}
              placeholder="Enter password"
              secure
              onChangeText={handleChange('password')}
              onFocus={() =>
                scrollRef.current?.scrollTo({ y: 140, animated: true })
              }
              onBlur={handleBlur('password')}
              error={touched.password && errors.password ? errors.password : ''}
            />

            <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
              <InputField
                label="Date of Birth"
                placeholder="Select date of birth"
                // value={values.dob ? new Date(values.dob).toDateString() : ""}
                value={values.dob ? moment(values.dob).format('D-M-YYYY') : ''}
                editable={false}
                onChangeText={() => { }}
                rightComponent={
                  <Image source={Icons.calendar} style={styles.calendarIcon} />
                }
                error={touched.dob && errors.dob ? errors.dob : ''}
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openDatePicker}
              date={values.dob ? new Date(values.dob) : maxDate}
              mode="date"
              maximumDate={maxDate}
              onConfirm={date => {
                setOpenDatePicker(false);
                setFieldValue('dob', date);
              }}
              onCancel={() => setOpenDatePicker(false)}
            />

            <Text
              style={[
                Typography.black14Regular,
                { color: Colors.secondaryText, marginBottom: 8 },
              ]}
            >
              User Type
            </Text>

            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  values.user_type === 'public' && styles.userTypeActive,
                ]}
                onPress={() => setFieldValue('user_type', 'public')}
              >
                <Image
                  source={Icons.publicUser}
                  style={styles.iconSize}
                  tintColor={
                    values.user_type === 'public' ? '#fff' : Colors.primaryLight
                  }
                />
                <Text
                  style={[
                    styles.userTypeText,
                    values.user_type === 'public' && styles.activeText,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  values.user_type === 'business' && styles.userTypeActive,
                ]}
                onPress={() => setFieldValue('user_type', 'business')}
              >
                <Image
                  source={Icons.business}
                  style={[styles.iconSize, { width: 18, height: 18 }]}
                  tintColor={
                    values.user_type === 'business'
                      ? '#fff'
                      : Colors.primaryLight
                  }
                />
                <Text
                  style={[
                    styles.userTypeText,
                    values.user_type === 'business' && styles.activeText,
                  ]}
                >
                  Business
                </Text>
              </TouchableOpacity>
            </View>

            {/* Introducer ID */}
            <InputField
              value={values.introducer_id}
              placeholder="Enter your ID"
              label="Introducer ID (optional)"
              onChangeText={handleChange('introducer_id')}
              onFocus={() =>
                scrollRef.current?.scrollTo({ y: 360, animated: true })
              }
            />

            {!(route?.params as any)?.isBack && (
              <View style={styles.checkboxContainer}>
                {/* 18+ Confirmation */}
                <TouchableOpacity
                  style={[
                    styles.checkboxRow,
                    {
                      marginBottom: touched.isAdult && errors.isAdult ? 0 : 10,
                    },
                  ]}
                  onPress={() => setFieldValue('isAdult', !values.isAdult)}
                >
                  <CustomCheckbox
                    checked={values.isAdult}
                    onPress={() => setFieldValue('isAdult', !values.isAdult)}
                  />
                  <Text style={[styles.checkboxText, Typography.black12Medium]}>
                    I confirm that I am 18 years or older
                  </Text>
                </TouchableOpacity>
                {touched.isAdult && errors.isAdult && (
                  <Text
                    style={[
                      styles.errorText,
                      Typography.black12Regular,
                      { color: Colors.error, marginBottom: 10 },
                    ]}
                  >
                    {errors.isAdult}
                  </Text>
                )}

                {/* Terms & Conditions */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFieldValue('isAgree', !values.isAgree)}
                >
                  <CustomCheckbox
                    checked={values.isAgree}
                    onPress={() => setFieldValue('isAgree', !values.isAgree)}
                  />
                  <Text style={[styles.checkboxText, Typography.black13Medium]}>
                    I agree to our{' '}
                    <Text
                      style={[styles.linkText, Typography.black13Medium]}
                      onPress={() =>
                        navigation.navigate('TermsAndConditionsScreen')
                      }
                    >
                      Terms & Conditions
                    </Text>{' '}
                    &{' '}
                    <Text
                      style={[styles.linkText, Typography.black13Medium]}
                      onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                      Privacy Policy
                    </Text>
                    . Please review them carefully before creating your account.
                  </Text>
                </TouchableOpacity>
                {touched.isAgree && errors.isAgree && (
                  <Text
                    style={[
                      styles.errorText,
                      Typography.black12Regular,
                      { color: Colors.error },
                    ]}
                  >
                    {errors.isAgree}
                  </Text>
                )}
              </View>
            )}
          </View>
        </AuthContainer>
      )}
    </Formik>
  );
};

export default AddBasicDetails;

const styles = StyleSheet.create({
  formWrapper: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  genderIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: Colors.primaryLight,
    resizeMode: 'contain',
  },
  genderText: { ...Typography.black14Regular, color: Colors.secondaryText },
  genderTextActive: { color: '#fff' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginBottom: 10,
  },
  calendarIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.secondaryText,
    objectFit: 'contain',
  },
  userTypeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  userTypeButton: {
    flex: 1,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  userTypeActive: { backgroundColor: Colors.secondary, borderWidth: 0 },
  userTypeText: { ...Typography.black13Medium, color: Colors.primary },
  activeText: { color: '#fff' },
  iconSize: {
    height: 14,
    width: 15,
    objectFit: 'contain',
  },
  checkboxContainer: { marginVertical: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkboxText: {
    color: Colors.primaryTextDark,
    flex: 1,
    flexWrap: 'wrap',
    marginStart: 10,
  },
  linkText: {
    color: Colors.primaryTextDark,
    textDecorationLine: 'underline',
  },
  errorText: {
    marginLeft: 36,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
