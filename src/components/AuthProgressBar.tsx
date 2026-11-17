import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Colors } from "../theme/colors";
import { Icons } from "../assets/icons";

interface AuthProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const AuthProgressBar: React.FC<AuthProgressBarProps> = ({
  currentStep,
  totalSteps = 3,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;

          // ⭐ FIX: last step ALSO shows tick
          const isCompleted = step <= currentStep;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.completedCircle,
                  isActive && styles.activeCircle,
                ]}
              >
                {isCompleted && (
                  <Image
                    source={Icons.check}
                    tintColor={"#fff"}
                    style={styles.checkMark}
                  />
                )}
              </View>

              {/* Connector Line */}
              {step !== totalSteps && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.completedLine,
                    isActive && styles.activeLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default AuthProgressBar;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  activeCircle: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  completedCircle: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  checkMark: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },

  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 10,
  },

  activeLine: {
    backgroundColor: Colors.primaryLight,
  },

  completedLine: {
    backgroundColor: Colors.secondary,
  },
});
