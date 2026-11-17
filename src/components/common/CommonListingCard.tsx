import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageSourcePropType,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Spacing, Typography } from "../../theme/typography";
import { menuItems } from "../../utils/helper";

interface CommonListingCardProps {
  title: string;
  subTitle: string;
  image?: string;
  buttonTitle?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  isIcon?: ImageSourcePropType;
  subTitleStyle?: any;
  iconStyle?: any;

  // controlled by parent
  showMenu?: boolean;
  onMenuToggle?: () => void;
  showIcon?: boolean;
  btnLoading?: boolean;
}

const CommonListingCard: React.FC<CommonListingCardProps> = ({
  title,
  subTitle,
  image,
  buttonTitle = "Send Request",
  onPress,
  containerStyle,
  isIcon,
  subTitleStyle,
  iconStyle,
  showMenu = false,
  onMenuToggle,
  showIcon,
  btnLoading
}) => {
  const firstLetter = title?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      <View style={[styles.card, containerStyle]}>
        {/* LEFT USER INFO */}
        <View style={styles.userInfo}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
          )}

          <View style={styles.textWrapper}>
            <Text style={Typography.black14Bold} numberOfLines={1}>
              {title}
            </Text>

            <Text
              style={[subTitleStyle || Typography.black12Regular, { marginTop: 2 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {subTitle}
            </Text>
          </View>
        </View>

        {/* ICON FROM PARENT */}
        {showIcon === true ?
          <>
            {isIcon ? (
              <TouchableOpacity
                onPress={onMenuToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image source={isIcon} style={iconStyle || styles.iconStyle} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btn} onPress={onPress} disabled={btnLoading}>
                <Text style={[Typography.black14Bold, { color: "#fff" }]}>
                  {buttonTitle}
                </Text>
              </TouchableOpacity>
            )}
          </>
          : null
        }
      </View>

      {/* MENU — now controlled by parent */}
      {showMenu && (
        <View style={styles.menuBox}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuRow}>
              <Image source={item.icon} style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

export default CommonListingCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textWrapper: {
    flex: 1,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Typography.black18Bold,
    color: Colors.primary,
  },
  iconStyle: {
    width: 18,
    height: 18,
    transform: [{ rotate: "90deg" }],
  },
  btn: {
    width: 120,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border10,
    position: "absolute",
    right: 0,
    top: 50,
    zIndex: 9999,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },
  menuIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },
  menuText: {
    ...Typography.black13Medium,
    color: Colors.secondaryText,
  },
});
