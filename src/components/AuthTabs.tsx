import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

interface AuthTabsProps {
  activeTab: "signin" | "signup";
  onChange: (tab: "signin" | "signup") => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onChange }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name; // e.g. "AuthScreen" or "OtpVerification"

  const handleTabChange = (tab: "signin" | "signup") => {
    onChange(tab);

    // 🔁 handle navigation globally
    if (currentScreen !== "AuthScreen") {
      navigation.navigate("AuthScreen", { initialTab: tab });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "signin" && styles.activeTab]}
        onPress={() => handleTabChange("signin")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            Typography.black16Medium,
            activeTab === "signin" ? styles.activeText : styles.inactiveText,
          ]}
        >
          SignIn
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "signup" && styles.activeTab]}
        onPress={() => handleTabChange("signup")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            Typography.black16Medium,
            activeTab === "signup" ? styles.activeText : styles.inactiveText,
          ]}
        >
          SignUp
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Colors.secondary,
  },
  activeText: {
    color: "#fff",
  },
  inactiveText: {
    color: Colors.primary,
  },
});
