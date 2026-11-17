import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import moment from "moment";

import {
  AuthContainer,
  AuthProgressBar,
  AuthTabs,
  InputField,
  UsernameField,
} from "../../../components";
import { Colors } from "../../../theme/colors";
import { RootState } from "../../../redux/store";
import { registerUser } from "../../../redux/slices/authSlice";
import { userIdSchema } from "../../../utils/validation";
import { Typography } from "../../../theme/typography";
import DatePicker from "react-native-date-picker";
import { Icons } from "../../../assets/icons";
import { cleanObject } from "../../../utils/helper";

const CreateUserIdScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const scrollRef = React.useRef<any>(null);

  const { selectedLanguage, tempSignupData, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const [activeTab, setActiveTab] = React.useState<"signin" | "signup">("signup");
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleFinish = async (values: any, { setSubmitting }: any) => {
    try {
      const payload = cleanObject({
        full_name: tempSignupData?.full_name || "",
        email_or_phone_number: tempSignupData?.email_or_phone_number || "",
        user_type: tempSignupData?.user_type || "public",
        gender: tempSignupData?.gender,
        introducer_id: tempSignupData?.introducer_id || "",
        language_id: selectedLanguage?._id || "",
        user_id: values.user_id,
        password: values.password,
        dob: values.dob
          ? moment(values.dob).format("DD-MM-YYYY")
          : "",
      });

      const res: any = await dispatch(registerUser(payload)).unwrap();
      if (res?.statusCode === '200' || res?.statusCode === 200) {
        navigation.navigate("SuccessScreen");
      }
    } catch (err: any) {
      Alert.alert("Error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        user_id: "",
        password: "",
        dob: "",
      }}
      validationSchema={userIdSchema}
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
          btnTitle="Finish"
          onPress={handleSubmit}
          loading={isSubmitting || loading}
          scrollRef={scrollRef}
        >
          <AuthTabs activeTab={activeTab} onChange={setActiveTab} />

          <AuthProgressBar currentStep={3} totalSteps={3} />

          <View style={styles.formWrapper}>
            {/* Username */}
            <Text style={[Typography.black20Bold, { marginTop: '4%', marginBottom: '2%' }]}>Create User ID/Name</Text>
            <Text style={[Typography.black14Regular, { color: Colors.secondaryText, marginBottom: '6%' }]}>
              This would only be displayed in Your Profile
            </Text>

            <UsernameField
              values={values.user_id}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errors={errors}
              touched={touched}

            />

            {/* Password */}
            <Text style={[Typography.black20Bold, { marginTop: '4%', marginBottom: '2%' }]}>Create Password</Text>
            <InputField
              value={values.password}
              label="Create Password"
              placeholder="Enter password"
              secure
              onChangeText={handleChange("password")}
              onFocus={() =>
                scrollRef.current?.scrollTo({ y: 200, animated: true })
              }
              onBlur={handleBlur("password")}
              error={touched.password && errors.password ? errors.password : ""}
            />

            <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
              <InputField
                label="Date of Birth"
                placeholder="Select date of birth"
                // value={values.dob ? new Date(values.dob).toDateString() : ""}
                value={values.dob ? moment(values.dob).format("D-M-YYYY") : ""}
                editable={false}
                rightComponent={
                  <Image source={Icons.calendar} style={styles.calendarIcon} />
                }
                error={touched.dob && errors.dob ? errors.dob : ""}
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openDatePicker}
              date={values.dob ? new Date(values.dob) : maxDate}
              mode="date"
              maximumDate={maxDate}
              onConfirm={(date) => {
                setOpenDatePicker(false);
                setFieldValue("dob", date);
              }}
              onCancel={() => setOpenDatePicker(false)}
            />
          </View>
        </AuthContainer>
      )}
    </Formik>
  );
};

export default CreateUserIdScreen;

const styles = StyleSheet.create({
  formWrapper: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
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
    objectFit: "contain"
  },
});