import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "../../../theme/colors";
import { useNavigation } from "@react-navigation/native";
import {
  AuthContainer,
  CustomCheckbox,
  CustomSwitch,
} from "../../../components";
import { permissionArray } from "../../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  getUserPermissions,
} from "../../../redux/slices/authSlice";
import { PermissionData } from "../../../utils/interfaces";
import { Spacing, Typography } from "../../../theme/typography";

const GivePermissions = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const scrollRef = useRef(null);


  const { permissionData } = useSelector((state: RootState) => state.auth);

  // Default permission values
  const [permissions, setPermissions] = useState<PermissionData>({
    location_access: true,
    notification_access: false,
    sms_access: false,
    contacts_access: false,
    gallery_access: false,
    camera_access: false,
    files_access: false,
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  // useRef to track the latest isAgreed value
  const isAgreedRef = useRef(isAgreed);

  // Keep ref in sync with state
  useEffect(() => {
    isAgreedRef.current = isAgreed;
  }, [isAgreed]);

  useEffect(() => {
    dispatch(getUserPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (permissionData) {
      setPermissions({
        location_access: permissionData.location_access,
        notification_access: permissionData.notification_access,
        sms_access: permissionData.sms_access,
        contacts_access: permissionData.contacts_access,
        gallery_access: permissionData.gallery_access,
        camera_access: permissionData.camera_access,
        files_access: permissionData.files_access,
      });
    }
  }, [permissionData]);

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Agree toggle
  const handleAgreeToggle = () => {
    setIsAgreed((prev) => !prev);
    setAgreeError(false);
  };

  // SUBMIT HANDLER - Using ref for immediate value
  const handleSubmit = async () => {
  if (!isAgreedRef.current) {
    setAgreeError(true);

    // ⭐ Scroll automatically to error area
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return;
  }

    setAgreeError(false);
    navigation.navigate("FriendRequest");
    // try {
    //   await dispatch(updateUserPermissions(permissions)).unwrap();
    //   navigation.navigate("FriendRequest");
    // } catch (err) {
    //   console.log("Update failed:", err);
    // }
  };

  return (
    <AuthContainer
      headerTitle="Give Permissions"
      isRight={false}
      btnTitle={"Submit"}
      showbtn={true}
      showScroll={true}
      onPress={handleSubmit}
      secondBGColor={Colors.lightBg}
      scrollRef={scrollRef}
    >
      <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding, paddingTop: 10 }}>
        {/* Permission List */}
        <View style={styles.cardContainer}>
          {permissionArray.map((item) => (
            <View key={item.key} style={styles.permissionCard}>
              <View style={styles.leftSection}>
                <Image source={item.icon} style={styles.icon} />
                <View>
                  <Text style={Typography.black16Medium}>{item.label}</Text>
                  <Text style={Typography.black12Regular}>{item.desc}</Text>
                </View>
              </View>

              <CustomSwitch
                value={permissions[item.key as keyof typeof permissions]}
                onValueChange={() =>
                  togglePermission(item.key as keyof typeof permissions)
                }
              />
            </View>
          ))}
        </View>

        {/* Agree Row */}
        <View style={styles.checkboxRow}>
          <CustomCheckbox
            checked={isAgreed}
            onPress={handleAgreeToggle}
            backgroundColor={isAgreed ? Colors.primary : "#fff"}
            borderColor={Colors.primary}
          />

          <Text style={Typography.black12Regular}>
            I agree to our{" "}
            <Text
              style={[
                Typography.black12Regular,
                { textDecorationLine: "underline" },
              ]}
              onPress={() => navigation.navigate("TermsAndConditionsScreen")}
            >
              Terms & Conditions
            </Text>{" "}
            &{" "}
            <Text
              style={[
                Typography.black12Regular,
                { textDecorationLine: "underline" },
              ]}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              Privacy Policy
            </Text>
            . Please review them carefully before giving permissions.
          </Text>
        </View>

        {/* Error Message */}
        {agreeError && (
          <Text
            style={[
              Typography.black12Regular,
              { color: Colors.error, marginTop: 6 },
            ]}
          >
            You must agree to continue.
          </Text>
        )}
      </View>
    </AuthContainer>
  );
};

export default GivePermissions;

const styles = StyleSheet.create({
  cardContainer: { marginVertical: 10 },

  permissionCard: {
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 8.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "74%",
  },

  icon: { width: 18, height: 18, objectFit: "contain" },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 8,
  },
});