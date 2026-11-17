import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { Formik, FormikProps } from "formik";

import AuthContainer from "../../components/AuthContainer";
import AuthTabs from "../../components/AuthTabs";
import SignUp from "./signup/SignUp";
import Login from "./signin/Login";

import {
  signUpSchema,
  passwordLoginSchema,
  otpLoginSchema,
} from "../../utils/validation";

import {
  forgotSendOtp,
  login,
  sendOTP,
  saveTempSignupData,
  signinSignupSendOtp,
} from "../../redux/slices/authSlice";

import {
  fetchBusinessUserProfile,
  fetchPublicUserProfile,
} from "../../redux/slices/profileSlice";

import { Spacing } from "../../theme/typography";
import { LoginFormValues } from "../../utils/interfaces";

import { saveCredentials, clearCredentials } from "../../utils/helper";

const AuthScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();

  const { initialTab } = route.params || {};
  const { loading } = useSelector((state: RootState) => state.auth);

  const scrollRef = useRef();
  const formikRef = useRef<FormikProps<LoginFormValues>>(null);
  const rememberMeRef = useRef(false);

  const [activeTab, setActiveTab] = useState(initialTab || "signup");
  const [loginWithOtp, setLoginWithOtp] = useState(false);

  const initialValues: LoginFormValues = {
    full_name: "",
    email_or_phone_number: "",
    user_type: "public",
    introducer_id: "",
    isAdult: false,
    isAgree: false,
    password: "",
    gender: ""
  };

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: initialValues,
      });
    }
    setLoginWithOtp(false);

  }, [activeTab]);


  // ⭐ SIGNUP
  const handleSignUp = async (values, { setSubmitting }) => {
    try {
      dispatch(saveTempSignupData(values));

      const res = await dispatch(
        sendOTP({ email_or_phone_number: values.email_or_phone_number })
      ).unwrap();

      // SUCCESS CASE
      if (res?.statusCode === 200) {
        Alert.alert("OTP Sent", `Your OTP is ${res?.data?.otp}`);
        navigation.navigate("OtpVerification")
        return;
      }
    }
    catch (error) {
      // API THROW ERROR → show message
      Alert.alert("Error", error || "Failed to send OTP. Please try again.");
    }
    finally {
      setSubmitting(false);
    }
  };

  // ⭐ LOGIN
  const handleLogin = async (values: LoginFormValues) => {
    if (loginWithOtp) {
      try {
        const res = await dispatch(
          signinSignupSendOtp({
            email_or_phone_number: values.email_or_phone_number,
            full_name: values.full_name,
          })
        ).unwrap();

        if (res?.statusCode === 200) {
          Alert.alert("OTP Sent", `Your OTP is ${res?.data?.otp}`
          );
          navigation.navigate("OtpLoginScreen", {
            type: "login",
            email_or_phone_number: values.email_or_phone_number,
          });
        }
      } catch (err) {
        Alert.alert("Login Failed", err?.error || err);
      }
      return;
    }

    try {
      const res = await dispatch(
        login({
          email_or_phone_number: values.email_or_phone_number.trim(),
          password: values.password,
        })
      ).unwrap();

      if (res?.statusCode === 200) {
        // ⭐ Save Remember Me ONLY here
        if (rememberMeRef.current) {
          await saveCredentials(
            values.email_or_phone_number.trim(),
            values.password
          );
        } else {
          await clearCredentials();
        }
        if (res.data.user_type === "business") {
          dispatch(fetchBusinessUserProfile());
        } else {
          dispatch(fetchPublicUserProfile());
        }
      }
    } catch (err) {
      Alert.alert("Login Failed", err?.error || err);
    }
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}

      validationSchema={
        activeTab === "signup"
          ? signUpSchema
          : loginWithOtp
            ? otpLoginSchema
            : passwordLoginSchema
      }
      onSubmit={activeTab === "signup" ? handleSignUp : handleLogin}
    >
      {(formik) => (
        <AuthContainer
          btnTitle={
            activeTab === "signup"
              ? "Next"
              : loginWithOtp
                ? "Send OTP"
                : "Login"
          }
          loading={loading}
          onPress={formik.handleSubmit}
          showScroll
          scrollRef={scrollRef}
        >
          <AuthTabs activeTab={activeTab} onChange={setActiveTab} />

          <View style={styles.formWrapper}>
            {activeTab === "signup" ? (
              <SignUp {...formik} scrollRef={scrollRef} />
            ) : (
              <Login
                {...formik}
                loginWithOtp={loginWithOtp}
                resetForm={formik.resetForm}
                setLoginWithOtp={setLoginWithOtp}
                rememberMeRef={rememberMeRef}
              />
            )}
          </View>
        </AuthContainer>
      )}
    </Formik>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  formWrapper: {
    marginTop: 20,
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
});
