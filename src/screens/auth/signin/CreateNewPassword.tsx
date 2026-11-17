import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";

import {
  AuthContainer,
  InputField,
} from "../../../components";
import { Spacing, Typography } from "../../../theme/typography";
import { resetPassword } from "../../../redux/slices/authSlice";
import { resetPasswordSchema } from "../../../utils/validation";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { email_or_phone_number, otp } = route.params;

  const [loading, setLoading] = useState(false);

  const handleSubmitFormik = async (values) => {
    setLoading(true);

    const payload = {
      email_or_phone_number,
      otp,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    try {
      await dispatch(resetPassword(payload)).unwrap();
      navigation.navigate("AuthScreen", { initialTab: "signin" });
    } catch (err) {
      console.log('err>>>>', err);

      Alert.alert("Error", err || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        new_password: "",
        confirm_password: "",
      }}
      validationSchema={resetPasswordSchema}
      onSubmit={handleSubmitFormik}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <AuthContainer
          btnTitle="Save Password"
          onPress={handleSubmit}   // ✅ correct
          loading={loading}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding }}>
              <Text style={[Typography.black16Bold, { marginBottom: 6 }]}>
                Create A New Password
              </Text>

              <Text style={[Typography.black13Regular, { marginBottom: 20 }]}>
                Your password must be at least 8 characters and include
                uppercase, lowercase, number and special character.
              </Text>

              {/* New Password */}
              <InputField
                label="Create New Password"
                placeholder="Enter your new password"
                value={values.new_password}
                onChangeText={handleChange("new_password")}
                onBlur={handleBlur("new_password")}
                secure
                error={
                  touched.new_password ? errors.new_password : ""
                }
              />

              {/* Confirm Password */}
              <InputField
                label="Confirm Password"
                placeholder="Enter your password again"
                value={values.confirm_password}
                onChangeText={handleChange("confirm_password")}
                onBlur={handleBlur("confirm_password")}
                secure
                error={
                  touched.confirm_password
                    ? errors.confirm_password
                    : ""
                }
              />
            </View>
          </KeyboardAvoidingView>
        </AuthContainer>
      )}
    </Formik>
  );
};

export default ChangePasswordScreen;
