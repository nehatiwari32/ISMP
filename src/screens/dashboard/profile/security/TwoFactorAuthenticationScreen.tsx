import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";

import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";

import {
  ViewContainer,
  InputField,
  CustomButton,
  CustomSwitch,
  OtpInput,
} from "../../../../components";

import {
  send2FAOtp,
  verify2FAOtp,
  enableTwoFA,
  disableTwoFA,
} from "../../../../redux/slices/profileSlice";


// Validation
const validationSchema = Yup.object().shape({
  email_or_phone: Yup.string().required("Enter valid email or phone number"),
});


const TwoFactorAuthScreen = () => {
  const { userProfile } = useSelector((state) => state.profile);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  // 👇 initial value correct rahega
  const [enabled, setEnabled] = useState(!!userProfile?.two_factor_enabled);
  const [loading, setLoading] = useState(false);

  // OTP
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // -----------------------------
  // SWITCH ON → ENABLE API
  // -----------------------------
  const handleEnableSwitch = async () => {
    setLoading(true);
    try {
      await dispatch(enableTwoFA({ email_or_phone_number: userProfile?.email })).unwrap();
      alert("2FA Enabled Successfully");
    } catch (err) {
      alert(err || "Enable API failed");
      setEnabled(false); // revert UI if failed
    }
    setLoading(false);
  };

  // -----------------------------
  // SWITCH OFF → DISABLE API
  // -----------------------------
  const handleDisableSwitch = async () => {
    setLoading(true);
    try {
      await dispatch(disableTwoFA()).unwrap();
      alert("2FA Disabled Successfully");
    } catch (err) {
      alert(err || "Disable API failed");
      setEnabled(true); // revert UI
    }
    setLoading(false);
  };

  // -----------------------------
  // SAVE BUTTON → SEND OTP
  // -----------------------------
  const handleSave = async (values) => {
    if (!enabled) {
      // If switch is OFF, nothing else needed
      alert("2FA is disabled. No OTP required.");
      return;
    }

    // If enabled → send OTP
    setLoading(true);
    try {
      await dispatch(send2FAOtp({ email_or_phone: values.email_or_phone })).unwrap();
      setOtpModal(true);
    } catch (err) {
      alert(err?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  // -----------------------------
  // VERIFY OTP
  // -----------------------------
  const handleVerifyOtp = async (email_or_phone) => {
    const typedOtp = otp.join("");

    if (typedOtp.length < 6) {
      setOtpError(true);
      setErrMsg('OTP field is required')
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        verify2FAOtp({
          email_or_phone,
          otp: typedOtp,
        })
      ).unwrap();

      alert("OTP Verified Successfully!");
      setOtpModal(false);
      navigation.goBack();

    } catch (err) {
      setOtpError(true);
      setErrMsg(err)
      alert("Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <Formik
      initialValues={{ email_or_phone: userProfile?.email || "" }}
      validationSchema={validationSchema}
      onSubmit={handleSave}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        touched,
        errors,
      }) => (
        <ViewContainer
          headerTitle="Two factor Authentication"
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
                title="Save"
                loading={loading}
                disabled={loading}
                buttonStyle={styles.saveBtn}
                onPress={handleSubmit}
              />
            </View>
          }
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.container}>

              {/* SWITCH CARD */}
              <View style={styles.switchCard}>
                <View style={{ flex: 1 }}>
                  <Text style={Typography.black16Bold}>Enable 2FA</Text>
                  <Text style={[Typography.black13Regular, { marginTop: 4 }]}>
                    Add an extra layer of security to your account.
                  </Text>
                </View>

                <CustomSwitch
                  value={enabled}
                  onValueChange={async (val) => {
                    setEnabled(val);

                    if (val) await handleEnableSwitch();
                    else await handleDisableSwitch();
                  }}
                />
              </View>

              {/* INPUT ONLY WHEN SWITCH IS ON */}
              {enabled && (
                <>
                  <Text style={[Typography.black14Bold, { marginTop: 20 }]}>
                    Email/Mobile Number
                  </Text>

                  <InputField
                    placeholder="Enter email id/mobile number"
                    value={values.email_or_phone}
                    onChangeText={handleChange("email_or_phone")}
                    onBlur={handleBlur("email_or_phone")}
                    error={
                      touched.email_or_phone && errors.email_or_phone
                        ? errors.email_or_phone
                        : ""
                    }
                  />
                </>
              )}

              {/* OTP POPUP */}
              <Modal visible={otpModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                  <View style={styles.modalBox}>

                    <Text style={[Typography.black16Bold, { textAlign: "center" }]}>
                      Enter OTP
                    </Text>

                    <OtpInput
                      value={otp}
                      onChange={(v) => {
                        setOtp(v);
                        setOtpError(false);
                        setErrMsg("")
                      }}
                      error={otpError}
                      setError={setOtpError}
                      inputWidth={42}
                      inputHieght={48}
                    />
                    {errMsg &&
                     <Text style={[Typography.black13Medium, { color: Colors.error }]}>
                      {errMsg}
                    </Text>}

                    <CustomButton
                      title="Verify OTP"
                      loading={loading}
                      buttonStyle={{ marginTop: 20 }}
                      onPress={() => handleVerifyOtp(values.email_or_phone)}
                    />
                  </View>
                </View>
              </Modal>

            </View>
          </KeyboardAvoidingView>
        </ViewContainer>
      )}
    </Formik>
  );
};

export default TwoFactorAuthScreen;



// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 20,
    backgroundColor: Colors.lightBg,
  },

  switchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bottomFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  cancelBtn: {
    width: "49%",
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "#fff",
  },

  saveBtn: {
    width: "49%",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
  },
});
