import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { useNavigation } from "@react-navigation/native";
import { CustomCheckbox } from "../common";

interface Props {
  visible: boolean;
  onAddDetails: () => void;
  onSkipConfirmed: () => void;
}

const BasicDetailsPromptModal: React.FC<Props> = ({
  visible,
  onAddDetails,
  onSkipConfirmed,
}) => {
  const navigation = useNavigation<any>();

  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [isAgree, setIsAgree] = useState(false);

  const canContinue = isAdult && isAgree;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            You have successfully logged in!
          </Text>

          <Text style={styles.desc}>
            Please provide basic details to collect discount coupons and enjoy a
            better experience.
          </Text>

          {/* 🔘 BUTTON ROW */}
          {!showCheckboxes && <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[styles.button, styles.outlineBtn]}
              onPress={onAddDetails}
            >
              <Text style={styles.outlineText}>Add Basic Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryBtn]}
              onPress={() => setShowCheckboxes(true)}
            >
              <Text style={styles.primaryText}>Skip</Text>
            </TouchableOpacity>
          </View>}

          {/* ✅ CHECKBOX FLOW */}
          {showCheckboxes && (
            <>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIsAdult(!isAdult)}
                >
                  <CustomCheckbox checked={isAdult} onPress={() => setIsAdult(!isAdult)} />
                  <Text style={styles.checkboxText}>
                    I confirm that I am 18 years or older
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIsAgree(!isAgree)}
                >
                  <CustomCheckbox checked={isAgree} onPress={() => setIsAgree(!isAgree)} />
                  <Text style={styles.checkboxText}>
                    I agree to our{" "}
                    <Text
                      style={styles.link}
                      onPress={() =>
                        navigation.navigate("TermsAndConditionsScreen")
                      }
                    >
                      Terms & Conditions
                    </Text>{" "}
                    &{" "}
                    <Text
                      style={styles.link}
                      onPress={() =>
                        navigation.navigate("PrivacyPolicy")
                      }
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                disabled={!canContinue}
                style={[
                  styles.confirmBtn,
                  !canContinue && styles.disabledBtn,
                ]}
                onPress={onSkipConfirmed}
              >
                <Text style={styles.primaryText}>Skip & Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BasicDetailsPromptModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    ...Typography.black18Bold,
    textAlign: "center",
    marginBottom: 6,
  },
  desc: {
    ...Typography.black14Regular,
    textAlign: "center",
    color: Colors.secondaryText,
    marginBottom: 10,
  },

  /* 🔘 Buttons */
  rowButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineText: {
    ...Typography.black14Medium,
    color: Colors.primary,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* ☑️ Checkboxes */
  checkboxContainer: {
    marginTop: 18,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 10,
    ...Typography.black12Medium,
  },
  link: {
    textDecorationLine: "underline",
    color: Colors.primaryTextDark,
  },

  confirmBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#CFCFCF",
  },
});
