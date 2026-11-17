import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Spacing, Typography } from "../theme/typography";
import { Colors } from "../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setSelectedLanguage } from "../redux/slices/authSlice";
import { Icons } from "../assets/icons";
import { useNavigation } from "@react-navigation/native";
import { CommonModal } from "./common";
import { Images } from "../assets/images";

interface AuthHeaderProps {
  title?: string;
  showLogo?: boolean;
  isRight?: boolean;
  rightTxt?: string;
  onRightPress?: any;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  showLogo = true,
  isRight = false,
  rightTxt,
  onRightPress,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { languages, selectedLanguage } = useSelector(
    (state: RootState) => state.auth
  );

  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (lang: any) => {
    setOpen(false);

    // 👇 Check if language is NOT supported
    if (!lang?.isSupported) {
      setModalVisible(true);
      return;
    }

    // 👇 Supported languages update normally
    dispatch(setSelectedLanguage(lang));
  };

  const handleConfirm = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* LEFT LOGO */}
        <View>
          {showLogo ? (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>logo</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Image
                source={Icons.arrowLeft}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* TITLE */}
        {title && (
          <Text
            style={[
              Typography.black18Bold,
              { flex: 1, textAlign: "center", marginRight: 6 },
            ]}
          >
            {title}
          </Text>
        )}

        {/* RIGHT LANGUAGE BUTTON */}
        <View>
          {!rightTxt && isRight && selectedLanguage && (
            <TouchableOpacity
              onPress={() => setOpen(!open)}
              activeOpacity={0.8}
              style={styles.langBtn}
            >
              <View style={styles.circle}>
                <Text style={[Typography.black14Bold, { color: "#fff" }]}>
                  {selectedLanguage?.code?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text style={[Typography.black12Medium, { marginLeft: 8 }]}>
                {selectedLanguage?.name?.substring(0, 2).toUpperCase()}
              </Text>

              <Image source={Icons.downArrow} style={styles.arrow} />
            </TouchableOpacity>
          )}

          {isRight && rightTxt && (
            <TouchableOpacity onPress={onRightPress}>
              <Text
                style={[Typography.black16Medium, { color: Colors.primary }]}
              >
                {rightTxt}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LANGUAGE DROPDOWN */}
      {open && (
        <View style={styles.dropdown}>
          {languages.map((lang) => {
            const isActive = lang.code === selectedLanguage.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.dropdownItem, isActive && styles.activeItem]}
                onPress={() => handleSelect(lang)}
              >
                <Text
                  style={[
                    Typography.black14Medium,
                    { color: isActive ? Colors.secondary : Colors.primaryText },
                  ]}
                >
                  {lang?.translation}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* UNSUPPORTED LANGUAGE MODAL */}
      <CommonModal
        visible={modalVisible}
        image={Images.noLng}
        title="Sorry we are Working on It!!!"
        body="We’re not ready to support your selected language yet. Please check back again later. Sorry for the inconvenience, and thank you for your patience."
        secondaryBody="Have a great day!"
        btnTitle="Continue"
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  logoContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoText: { fontWeight: "bold", color: "#333" },

  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  backIcon: { width: 24, height: 24, tintColor: Colors.primaryText },

  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8ECF4",
  },

  circle: {
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    width: 8,
    height: 8,
    tintColor: Colors.primaryText,
    marginLeft: 6,
  },

  dropdown: {
    backgroundColor: "#fff",
    position: "absolute",
    right: 20,
    top: 100,
    width: 160,
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 200,
  },

  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  activeItem: { backgroundColor: Colors.secondaryLight },
});

export default React.memo(AuthHeader);
