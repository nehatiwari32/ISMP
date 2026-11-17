import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import {
  AuthContainer,
  BasicDetailsPromptModal,
  OtpInput,
} from '../../../components';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Images } from '../../../assets/images';
import {
  forgotVerifyOtp,
  forgotSendOtp,
  verifySinginSendOtp,
  getLoginProfile,
  resendSignupOtp,
} from '../../../redux/slices/authSlice';
import { Icons } from '../../../assets/icons';
import {
  fetchBusinessUserProfile,
  fetchPublicUserProfile,
} from '../../../redux/slices/profileSlice';
import { requestOtpPermission } from '../../../utils/permission';

const OtpLoginScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();

  const dispatch = useDispatch<any>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const email_or_phone_number = route?.params?.email_or_phone_number || '';
  const otpRef = useRef(otp);

  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  useEffect(() => {
    const askOtpPermission = async () => {
      const granted = await requestOtpPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please allow permission to auto-read OTP.',
        );
      }
    };

    askOtpPermission();
  }, [route?.params?.type]);

  // ⏱️ Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (newOtp: string[]) => {
    setOtp(newOtp);

    if (newOtp.join('').length > 0) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  // 🔹 Verify OTP
  const handleVerify = async () => {
    const currentOtp = otpRef.current;
    const otpCode = currentOtp.join('');
    if (otpCode.length < 6) {
      setHasError(true);
      setErrorMessage('OTP field is required');
      return;
    }
    const payload = {
      email_or_phone_number,
      otp: otpCode,
    };
    setLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      let res;
      if (route?.params?.type === 'forgot') {
        res = await dispatch(forgotVerifyOtp(payload)).unwrap();
        setLoading(false);
        if (res?.statusCode === 200 || res?.statusCode === '200') {
          Alert.alert('Success', 'OTP verified successfully!');
          navigation.navigate('CreateNewPassword', {
            email_or_phone_number,
            otp: otpCode,
          });
        } else {
          Alert.alert('Error', res?.message || 'Invalid OTP');
        }
      } else {
        res = await dispatch(verifySinginSendOtp(payload)).unwrap();
        setLoading(false);
        if (res?.statusCode === 200 || res?.statusCode === '200') {
          const isNewUser = res?.data?.is_newUser;
          if (isNewUser == true) {
            setShowPrompt(true);
            return;
          }
          dispatch(getLoginProfile());
          if (res?.data?.user_type === 'business') {
            dispatch(fetchBusinessUserProfile());
          } else {
            dispatch(fetchPublicUserProfile());
          }
        }
      }
    } catch (err: any) {
      setHasError(true);
      setLoading(false);
      setErrorMessage(err?.data || '');
    }
  };

  const handleResend = async () => {
    try {
      setTimer(60);
      setOtp(['', '', '', '', '', '']); // Clear OTP fields
      const payload = { email_or_phone_number: email_or_phone_number };
      let res: any;
      if (route?.params?.type === 'forgot') {
        res = await dispatch(forgotSendOtp(payload)).unwrap();
      } else {
        res = await dispatch(resendSignupOtp(payload)).unwrap();
      }

      if (res?.statusCode === '200' || res?.statusCode === 200) {
        Alert.alert(
          'Success',
          `OTP sent successfully! You can enter ${res?.data?.otp}`,
        );
      }
    } catch (err: any) {
      console.log('❌ Resend Error:', err);
      Alert.alert(err?.error || err);
    }
  };

  const handleSkip = () => {
    setShowPrompt(false);
    dispatch(getLoginProfile());
  };

  const handleAddDetails = () => {
    setShowPrompt(false);
    navigation.navigate('AddBasicDetails');
  };

  return (
    <AuthContainer
      btnTitle={route?.params?.type === 'forgot' ? 'Submit' : 'Verify OTP'}
      onPress={handleVerify}
      loading={loading}
    >
      <View style={styles.wrapper}>
        <Image source={Images.otpSecure} style={styles.imgStyle} />

        <Text style={[Typography.black18Bold, styles.heading]}>
          OTP Verification
        </Text>

        <Text
          style={[Typography.black16Regular, { color: Colors.secondaryText }]}
        >
          Enter the verification code we sent on your mobile number or email{' '}
          <Text style={[Typography.black16Regular, { fontWeight: '900' }]}>
            {email_or_phone_number}
          </Text>{' '}
        </Text>

        {/* OTP Input */}
        <OtpInput
          value={otp}
          onChange={handleChange}
          error={hasError}
          setError={setHasError}
        />

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text
            style={[
              Typography.black13Medium,
              { color: hasError ? Colors.error : Colors.secondaryText },
            ]}
          >
            {hasError ? errorMessage : "Didn't get the OTP?"}{' '}
          </Text>
          {timer > 0 ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Image
                source={Icons.clock}
                tintColor={Colors.secondary}
                style={styles.iconSize}
              />
              <Text
                style={[Typography.black13Medium, { color: Colors.secondary }]}
              >
                Retry in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Image
                source={Icons.clock}
                tintColor={Colors.secondary}
                style={styles.iconSize}
              />
              <Text
                style={[Typography.black13Medium, { color: Colors.secondary }]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <BasicDetailsPromptModal
          visible={showPrompt}
          onSkipConfirmed={handleSkip}
          onAddDetails={handleAddDetails}
        />

        {/* Optional Email OTP Button */}
        {/* <CustomButton
          variant="outlined"
          title="Send code to Email"
          onPress={handleResend}
          buttonStyle={{ width: "80%", alignSelf: "center", marginTop: "10%" }}
        /> */}
      </View>
    </AuthContainer>
  );
};

export default OtpLoginScreen;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  imgStyle: {
    height: 114,
    width: 114,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: '8%',
  },
  heading: {
    marginVertical: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  iconSize: {
    height: 13,
    width: 13,
    objectFit: 'contain',
  },
});
