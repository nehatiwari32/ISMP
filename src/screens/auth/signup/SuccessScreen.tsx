import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Colors } from "../../../theme/colors";
import { Icons } from "../../../assets/icons";

const SuccessScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      //  navigation.navigate("LocationPermission");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "LocationPermission" }],
        })
      );
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* ✅ Centered tick icon */}
      <View style={styles.logoContainer}>
        <Image
          source={Icons.check}
          style={styles.logo}
          resizeMode="contain"
          tintColor="#fff"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Successfully Registered</Text>
        <Text style={styles.subtitle}>
          You have successfully created your account{"\n"}Welcome to ISMP Family
        </Text>
      </View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center", // ✅ Center vertically
    alignItems: "center", // ✅ Center horizontally
    marginBottom: 40,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },
});
