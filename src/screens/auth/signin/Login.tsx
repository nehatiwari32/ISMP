import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import Toast from '../../../utils/toast';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { InputField, CustomCheckbox, CustomButton } from '../../../components';
import { Colors } from '../../../theme/colors';
import { Icons } from '../../../assets/icons';
import { Typography } from '../../../theme/typography';
import { forgotSendOtp } from '../../../redux/slices/authSlice';
import { AppDispatch } from '../../../redux/store';
import { getCredentials } from '../../../utils/helper';
import { LoginProps } from '../../../utils/interfaces';

const Login: React.FC<LoginProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  loginWithOtp,
  setLoginWithOtp,
  resetForm,
  rememberMeRef,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // ⭐ Load saved credentials
  useEffect(() => {
    (async () => {
      const stored = await getCredentials();
      if (stored) {
        setFieldValue('email_or_phone_number', stored.email);
        setFieldValue('password', stored.password);
        setRememberMe(true);
        rememberMeRef.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (loginWithOtp) {
        setLoginWithOtp(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [loginWithOtp]);

  // ⭐ Toggle remember me
  const toggleRemember = () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    rememberMeRef.current = newValue;
  };

  // ⭐ Forgot Password logic
  const handleForgotPress = async () => {
    const userInput = values.email_or_phone_number?.trim();
    if (!userInput) {
      navigation.navigate('ForgetPassword');
      return;
    }

    try {
      setForgotLoading(true);
      const res: any = await dispatch(
        forgotSendOtp({ email_or_phone_number: userInput }),
      ).unwrap();

      if (res?.statusCode === 200) {
        Toast.success(`Your OTP is ${res?.data?.otp}`);
        navigation.navigate('OtpLoginScreen', {
          type: 'forgot',
          email_or_phone_number: userInput,
        });
      }
    } catch (error: any) {
      Toast.error(error);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <Text style={[Typography.black22Bold, { marginVertical: '4%' }]}>
        Welcome! Glad to see you
      </Text>
      {loginWithOtp && (
        <InputField
          label="Your Name"
          placeholder="Enter Your Name"
          value={values.full_name}
          onChangeText={handleChange('full_name')}
          error={touched.full_name && errors.full_name}
        />
      )}

      <InputField
        label="Email/Mobile Number"
        placeholder="Enter Email or Phone"
        value={values.email_or_phone_number}
        onChangeText={handleChange('email_or_phone_number')}
        error={touched.email_or_phone_number && errors.email_or_phone_number}
      />

      {!loginWithOtp && (
        <InputField
          label="Password"
          placeholder="Enter password"
          secureTextEntry={!showPassword}
          value={values.password}
          onChangeText={handleChange('password')}
          rightComponent={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image
                source={showPassword ? Icons.eyeOn : Icons.eyeOff}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          }
          error={touched.password && errors.password}
        />
      )}

      {!loginWithOtp && (
        <View style={styles.rememberContainer}>
          <CustomCheckbox
            checked={rememberMe}
            onPress={toggleRemember}
            label="Remember me"
          />

          <TouchableOpacity onPress={handleForgotPress}>
            {forgotLoading ? (
              <ActivityIndicator size="small" color={Colors.secondary} />
            ) : (
              <Text
                style={[
                  Typography.black14Medium,
                  { color: Colors.secondary, textDecorationLine: 'underline' },
                ]}
              >
                Forgot Password?
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!loginWithOtp && (
        <>
          <View style={styles.dividerContainer}>
            <Image source={Icons.orLeft} style={styles.lineImg} />
            <Text style={styles.orText}>OR</Text>
            <Image source={Icons.orRight} style={styles.lineImg} />
          </View>
          <CustomButton
            variant="outlined"
            title={
              loginWithOtp ? 'Sign In Using Password' : 'Sign In Using OTP'
            }
            onPress={() => {
              setLoginWithOtp(prev => {
                const next = !prev;
                resetForm({
                  values: {
                    full_name: '',
                    email_or_phone_number: '',
                    password: '',
                  },
                });
                return next;
              });
            }}
            // onPress={() => navigation.navigate("ManualLocation")}
            buttonStyle={{ width: '76%', alignSelf: 'center' }}
          />

          {/* Social Icons */}
          <View style={styles.socialContainer}>
            <Image source={Icons.google} style={styles.socialImg} />
            <Image source={Icons.apple} style={styles.socialImg} />
            <Image source={Icons.facebook} style={styles.socialImg} />
            <Image source={Icons.linkdin} style={styles.socialImg} />
            <Image source={Icons.instagram} style={styles.socialImg} />
          </View>
        </>
      )}
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  eyeIcon: { height: 22, width: 22, objectFit: 'contain' },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: '10%',
  },
  lineImg: { width: 150, resizeMode: 'contain' },
  orText: { marginHorizontal: 10, color: Colors.secondaryText },
  orContainer: { flexDirection: "row", alignItems: "center", justifyContent: 'center' },

  socialContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialImg: { height: 32, width: 32, resizeMode: "contain" },
});
