import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";
import { InputField, CustomCheckbox } from "../../../components";
import { Icons } from "../../../assets/icons";
import { useNavigation } from "@react-navigation/native";
import { SignUpProps } from "../../../utils/interfaces";

const SignUp: React.FC<SignUpProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  scrollRef
}) => {
  const navigation = useNavigation();

  return (
    <View>
      {/* Title */}
      <Text style={[Typography.black20Bold, { marginBottom: 10 }]}>Create Account</Text>

      {/* Full Name */}
      <InputField
        value={values.full_name}
        placeholder="Enter your full name"
        label="Full Name"
        onChangeText={handleChange("full_name")}
        error={touched.full_name && (errors.full_name as string)}
      />

      {/* Mobile/Email */}
      <InputField
        value={values.email_or_phone_number}
        placeholder="Enter mobile number/email id"
        label="Mobile Number/Email Id"
        onChangeText={handleChange("email_or_phone_number")}
        error={
          touched.email_or_phone_number &&
          (errors.email_or_phone_number as string)
        }
      />

      <Text style={[Typography.black14Regular, { color: Colors.secondaryText }]}>Gender (Optional)</Text>
      <View style={styles.genderRow}>
        {(["male", "female", "others"] as const).map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderBtn,
              values.gender === g && styles.genderBtnActive,
            ]}
            onPress={() => setFieldValue("gender", g)}
          >
            <Image
              source={
                g === "male"
                  ? Icons.male
                  : g === "female"
                    ? Icons.female
                    : Icons.others
              }
              style={[
                styles.genderIcon,
                values.gender === g && { tintColor: "#fff" },
              ]}
            />
            <Text
              style={[
                Typography.black13Medium,
                { color: values.gender === g ? '#fff' : Colors.primaryLight },
              ]}
            >
              {g[0].toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* <Text style={styles.warningText}>
        This would not be Displayed unless you Wish
      </Text> */}

      {/* User Type */}
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
            values.user_type === "public" && styles.userTypeActive,
          ]}
          onPress={() => setFieldValue("user_type", "public")}
        >
          <Image source={Icons.publicUser} style={styles.iconSize} tintColor={values.user_type === "public" ? '#fff' : Colors.primaryLight} />
          <Text
            style={[
              styles.userTypeText,
              values.user_type === "public" && styles.activeText,
            ]}
          >
            Public
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            values.user_type === "business" && styles.userTypeActive,
          ]}
          onPress={() => setFieldValue("user_type", "business")}
        >
          <Image source={Icons.business} style={[styles.iconSize, { width: 18, height: 18 }]} tintColor={values.user_type === "business" ? '#fff' : Colors.primaryLight} />
          <Text
            style={[
              styles.userTypeText,
              values.user_type === "business" && styles.activeText,
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
        onChangeText={handleChange("introducer_id")}
        onFocus={() =>
          scrollRef.current?.scrollTo({ y: 200, animated: true })
        }
      />

      {/* Checkboxes */}
      <View style={styles.checkboxContainer}>
        {/* 18+ Confirmation */}
        <TouchableOpacity
          style={[styles.checkboxRow, { marginBottom: touched.isAdult && errors.isAdult ? 0 : 10 }]}
          onPress={() => setFieldValue("isAdult", !values.isAdult)}
        >
          <CustomCheckbox
            checked={values.isAdult}
            onPress={() => setFieldValue("isAdult", !values.isAdult)}
          />
          <Text style={[styles.checkboxText, Typography.black12Medium]}>
            I confirm that I am 18 years or older
          </Text>
        </TouchableOpacity>
        {touched.isAdult && errors.isAdult && (
          <Text style={[styles.errorText, Typography.black12Regular, { color: Colors.error, marginBottom: 10 }]}>{errors.isAdult}</Text>
        )}

        {/* Terms & Conditions */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setFieldValue("isAgree", !values.isAgree)}
        >
          <CustomCheckbox
            checked={values.isAgree}
            onPress={() => setFieldValue("isAgree", !values.isAgree)}
          />
          <Text style={[styles.checkboxText, Typography.black13Medium]}>
            I agree to our{" "}
            <Text style={[styles.linkText, Typography.black13Medium]} onPress={() => navigation.navigate('TermsAndConditionsScreen')}>
              Terms & Conditions
            </Text>{" "}
            &{" "}
            <Text style={[styles.linkText, Typography.black13Medium]} onPress={() => navigation.navigate('PrivacyPolicy')}>
              Privacy Policy
            </Text>
            . Please review them carefully before creating your account.
          </Text>
        </TouchableOpacity>
        {touched.isAgree && errors.isAgree && (
          <Text style={[styles.errorText, Typography.black12Regular, { color: Colors.error }]}>{errors.isAgree}</Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.orContainer}>
        <Image
          source={Icons.orLeft}
          style={[styles.lineImg, { marginEnd: "5%" }]}
        />
        <Text style={[Typography.black16Regular, { color: '#616161',  marginVertical: 16, }]}>OR</Text>
        <Image
          source={Icons.orRight}
          style={[styles.lineImg, { marginStart: "5%" }]}
        />
      </View>

      {/* Social Icons */}
      <View style={styles.socialContainer}>
        <Image source={Icons.google} style={styles.socialImg} />
        <Image source={Icons.apple} style={styles.socialImg} />
        <Image source={Icons.facebook} style={styles.socialImg} />
        <Image source={Icons.linkdin} style={styles.socialImg} />
        <Image source={Icons.instagram} style={styles.socialImg} />
      </View>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  warningText: { color: Colors.primary, fontSize: 12, marginBottom: 10 },
  genderRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  genderBtnActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  genderIcon: { width: 18, height: 18, marginRight: 8, tintColor: Colors.primaryLight, resizeMode: "contain" },
  genderText: { color: Colors.primaryLight, fontWeight: "600" },
  genderTextActive: { color: "#fff" },
  userTypeContainer: { flexDirection: "row", marginBottom: 16 },
  userTypeButton: {
    flex: 1,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  userTypeActive: { backgroundColor: Colors.secondary, borderWidth: 0 },
  userTypeText: { color: Colors.primaryLight, fontWeight: "500" },
  activeText: { color: "#fff" },
  iconSize: {
    height: 14,
    width: 15,
    objectFit: 'contain'
  },
  checkboxContainer: { marginVertical: 12, },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", },
  checkboxText: {
    color: Colors.primaryTextDark,
    flex: 1,
    flexWrap: "wrap",
    marginStart: 10
  },
  linkText: {
    color: Colors.primaryTextDark,
    textDecorationLine: "underline",
  },
  errorText: {
    marginLeft: 36,
  },
  orContainer: { flexDirection: "row", alignItems: "center", justifyContent: 'center' },
  lineImg: { width: 150, resizeMode: "contain" },

  socialContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialImg: { height: 32, width: 32, resizeMode: "contain" },
});
