import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";
import { changePassword } from "../../../../redux/slices/profileSlice";
import { CustomButton, InputField, ViewContainer } from "../../../../components";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ----- UPDATE PASSWORD -----
  const handleUpdate = async () => {
    setLoading(true);

    const payload = {
      current_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };

    try {
      await dispatch(changePassword(payload)).unwrap();
      navigation.goBack();
    } catch (error) {
      alert(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViewContainer
      headerTitle="Change Password"
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
            title="Submit"
            buttonStyle={styles.saveBtn}
            onPress={handleUpdate}
            loading={loading}
            disabled={loading}
          />
        </View>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* TITLE */}
          <Text style={[Typography.black16Bold, { marginBottom: 6 }]}>
            Create A New Password
          </Text>

          <Text style={[Typography.black13Regular, { marginBottom: 20 }]}>
            Your password must be at least 6 characters and should include a
            combination of numbers, letters and special characters (!$@%).
          </Text>

          {/* Old Password */}
          <InputField
            label="Old Password"
            placeholder="Enter your current password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secure={true}
          />

          {/* New Password */}
          <InputField
            label="Create New Password"
            placeholder="Enter your Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secure={true}
          />

          {/* Confirm Password */}
          <InputField
            label="Confirm Password"
            placeholder="Enter your Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure={true}
          />
        </View>

      </KeyboardAvoidingView>
    </ViewContainer>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: Colors.lightBg,
    paddingTop: 20
  },
  bottomFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: '100%',
  },
  cancelBtn: {
    width: '49%',
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#fff'
  },
  saveBtn: {
    width: '49%',
  },
});
