import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { BlurView } from "@react-native-community/blur";
import { CustomButton } from "../common";

interface CompletionModalProps {
  visible: boolean;
  progress: number; // 0-100
  onContinue?: () => void;
  onCompleteNow?: () => void;
  showBothBtn?: boolean;
  disableBlur?: boolean;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  progress,
  onContinue,
  onCompleteNow,
  showBothBtn = true,
  disableBlur = false
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        {!disableBlur && <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={2}
          blurType="dark"
          reducedTransparencyFallbackColor="black"
        />}
        <View style={styles.modal}>
          <Text style={[Typography.black18Bold, { color: '#3C3C3C' }]}>
            {`Your profile is ${progress}% complete.`}
          </Text>
          <Text style={[Typography.black14Regular, { color: Colors.secondaryText, marginVertical: 4 }]}>Please complete your profile to 100% as soon as possible to enjoy all the benefits of our application. Thank you!</Text>
          <View style={styles.progressContainer}>
            <View style={styles.rowContainer}>
              <Text style={styles.progressText}>{progress}%</Text>
              <Text style={[Typography.black10Medium, { color: '#6F6F6F' }]}>Completed</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>

          </View>
          {showBothBtn ?
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
                <Text style={[Typography.black14Medium, { color: Colors.primary, textAlign: 'center' }]}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={onCompleteNow}
              >
                <Text style={[Typography.black14Medium, { color: '#fff', textAlign: 'center' }]}>Skip</Text>
              </TouchableOpacity>
            </View>
            :
            <CustomButton
              title="Continue"
              onPress={onContinue}
            />
          }
        </View>
      </View>
    </Modal>
  );
};

export default CompletionModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  progressContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  progressText: { color: Colors.primary, fontWeight: "600", },
  progressBar: {
    height: 4,
    width: "100%",
    backgroundColor: "#EEE",
    borderRadius: 4,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  completedText: { fontSize: 12, color: "#999" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  continueBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  continueText: { color: Colors.primary, fontWeight: "600" },
  completeText: { color: "#fff", fontWeight: "600" },
});
