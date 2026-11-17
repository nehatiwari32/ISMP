import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import { Spacing, Typography } from "../../theme/typography";

interface CommonHeaderProps {
  logo?: boolean;
  title?: string;
  rightText?: string;
  onRightPress?: () => void;
  containerStyle?: object;
  titleStyle?: object;
  showBackBtn?: boolean
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  logo = false,
  title = "",
  rightText,
  onRightPress,
  containerStyle,
  titleStyle,
  showBackBtn = true
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, containerStyle]}>
      {logo ? (
        // ✅ Logo Header
        // <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
        <>
          <Text>Logo</Text>

          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        </>
      ) : (
        // ✅ Back Header
        <>
          {showBackBtn &&
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
            >
              <Image
                source={Icons.arrowLeft}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>}

          {title && <Text style={[Typography.black18Bold, titleStyle]} numberOfLines={1}>
            {title}
          </Text>}

          {rightText ? (
            <TouchableOpacity
              style={styles.rightButton}
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              <Text style={[Typography.black16Medium, { color: Colors.primary }]}>{rightText}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </>
      )}
    </View>
  );
};

export default CommonHeader;

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  logo: {
    width: 90,
    height: 40,
    alignSelf: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.primaryText,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  rightButton: {
    paddingHorizontal: 6,
  },
  rightText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
