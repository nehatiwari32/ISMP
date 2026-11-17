import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import {
  AuthContainer,
  AuthProgressBar,
  AuthTabs,
  OtpInput,
} from "../../../components";
import { Icons } from "../../../assets/icons";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";
import { RootState } from "../../../redux/store";
import { resendSignupOtp, verifyOtp } from "../../../redux/slices/authSlice";
import { requestOtpPermission } from "../../../utils/permission";

const OtpVerificationScreen = () => {
  const navigation = useNavigation<any>();

  const dispatch = useDispatch<any>();
  const { tempSignupData } = useSelector(
    (state: RootState) => state.auth
  );

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const otpRef = useRef(otp);

  const phoneNumber = tempSignupData?.email_or_phone_number || "";

  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  useEffect(() => {
    const askOtpPermission = async () => {
      const granted = await requestOtpPermission();

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please allow permission to auto-read OTP."
        );
      }
    };

    askOtpPermission();
  }, []);


  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (newOtp: string[]) => {
    setOtp(newOtp);

    if (newOtp.join("").length > 0) {
      setHasError(false);
      setErrorMessage("");
    }
  };

  const handleVerify = async () => {
    const currentOtp = otpRef.current;
    const otpCode = currentOtp.join("");

    if (otpCode.length < 6) {
      setHasError(true);
      setErrorMessage("OTP field is required");
      return;
    }
    setLoading(true)
    setHasError(false);
    setErrorMessage("");

    try {
      const payload = {
        email_or_phone_number: phoneNumber,
        otp: otpCode,
      };

      const res: any = await dispatch(verifyOtp(payload)).unwrap();
      console.log('✅ Verify Response:', res);
      setLoading(false)
      if (res?.statusCode === '200' || res?.statusCode === 200) {
        navigation.navigate("CreateUserId");
      }
    } catch (err: any) {
      setHasError(true);
      setLoading(false)
      setErrorMessage(err?.data || "")
    }
  };

  // 🔹 Resend OTP API call
  const handleResend = async () => {
    try {
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      const payload = { email_or_phone_number: phoneNumber };
      const res: any = await dispatch(resendSignupOtp(payload)).unwrap();

      // ✅ Fixed: Correct condition check
      if (res?.statusCode === '200' || res?.statusCode === 200) {
        Alert.alert("Success", `OTP sent successfully! You can enter ${res?.data?.otp}`);
      }
    } catch (err: any) {
      console.log('❌ Resend Error:', err);
      Alert.alert(err || err.message);
    }
  };

  return (
    <AuthContainer btnTitle="Verify OTP" onPress={handleVerify} loading={loading}>
      <AuthTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Step Indicator */}
      <View style={{ marginTop: 10 }}>
        <AuthProgressBar currentStep={2} totalSteps={3} />
      </View>

      <View style={styles.wrapper}>
        <Text
          style={[
            Typography.black18Bold,
            { marginVertical: 8, fontWeight: "bold" },
          ]}
        >
          OTP Verification
        </Text>

        <Text style={[Typography.black16Regular, { color: Colors.secondaryText }]}>
          Enter the verification code we sent on your mobile number or email{" "}
          <Text style={[Typography.black16Regular, { fontWeight: '900' }]}>{phoneNumber}</Text>{" "}{" "}{" "}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={Icons.editIcon} style={styles.editIcon} />
          </TouchableOpacity>

        </Text>

        {/* OTP Input */}
        <OtpInput
          value={otp}
          onChange={handleChange}
          error={hasError}
          setError={setHasError}
        />

        {/* Timer + Resend */}
        <View style={styles.timerContainer}>
          <Text style={[Typography.black13Medium, { color: hasError ? Colors.error : Colors.secondaryText }]}>
            {hasError ? errorMessage : "Didn't get the OTP?"}{' '}
          </Text>

          {timer > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Image source={Icons.clock} tintColor={Colors.secondary} style={styles.iconSize} />
              <Text style={[Typography.black13Medium, { color: Colors.secondary }]}>
                Retry in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleResend} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[[Typography.black13Medium, { color: Colors.secondary, textDecorationLine: 'underline' }], { color: Colors.secondary }]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AuthContainer>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  editIcon: {
    height: 18,
    width: 18,
    resizeMode: "contain",
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconSize: {
    height: 13,
    width: 13,
    objectFit: 'contain'
  }

});