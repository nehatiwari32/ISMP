import React from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { AuthContainer, InputField, LinkButton } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { Images } from "../../../assets/images";
import { forgotPasswordSchema } from "../../../utils/validation";
import { RootState } from "../../../redux/store";
import { forgotSendOtp } from "../../../redux/slices/authSlice";
import { Icons } from "../../../assets/icons";

const ForgetPassword = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleForgotPassword = async (values: any) => {
    try {
      const res: any = await dispatch(
        forgotSendOtp({
          email_or_phone_number: values.email_or_phone_number.trim(),
        })
      ).unwrap();

      if (res?.statusCode === 200 || res?.statusCode === "200") {
        console.log('resDAtA>>>>>>', res);
        Alert.alert("OTP Sent", `Your OTP is ${res?.data?.otp}`);
        navigation.navigate("OtpLoginScreen", {
          type: "forgot",
          email_or_phone_number: values.email_or_phone_number,
        });
      }
    } catch (err: any) {
      console.log('error>>>>', err);
      Alert.alert("Error", err || err?.error);
    }
  };

  return (
    <Formik
      initialValues={{ email_or_phone_number: "" }}
      validationSchema={forgotPasswordSchema}
      onSubmit={handleForgotPassword}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <AuthContainer btnTitle="Send OTP" onPress={handleSubmit} loading={loading} showScroll isRight={true}>
          <View style={styles.formWrapper}>
            <Image source={Images.forgot} style={styles.imgStyle} />
            <Text style={[Typography.black20Bold, { marginVertical: '4%' }]}>Forgot Password</Text>
            <Text style={[Typography.black14Regular, { color: Colors.secondaryText, marginBottom: '6%' }]}>
              Enter your registered email/phone number and we'll send you a OTP to get back into your account.
            </Text>

            <InputField
              label="Registered Email Address/Mobile Number"
              placeholder="Enter your email/mobile number"
              value={values.email_or_phone_number}
              onChangeText={handleChange("email_or_phone_number")}
              onBlur={handleBlur("email_or_phone_number")}
              error={
                touched.email_or_phone_number && errors.email_or_phone_number
                  ? errors.email_or_phone_number
                  : ""
              }
            />
          </View>

          <LinkButton
            title="Back to Login"
            onPress={() => navigation.navigate("AuthScreen", { initialTab: "signin" })}
            textStyle={{ color: Colors.secondary }}
            containerStyle={{ alignSelf: "center" }}
            leftIcon={Icons.arrowLeft}
            iconColor={Colors.secondary}
          />
        </AuthContainer>
      )}
    </Formik>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  formWrapper: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  imgStyle: {
    height: 114,
    width: 114,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: "8%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryText,
    marginTop: 24,
    marginBottom: 16,
  },
  subText: {
    color: "#777",
    fontSize: 14,
    marginBottom: "10%",
  },
});
