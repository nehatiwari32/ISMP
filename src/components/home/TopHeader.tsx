import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import GradientAvatar from "../GradientAvatar";

const TopHeader = () => {
  const { userProfile } = useSelector((state: any) => state.profile);
  const navigation = useNavigation()

  const handleIconPress = (index: number) => {
    switch (index) {
      case 0:
        navigation.navigate('ReferScreen');
        break;
      case 1:
        navigation.navigate('SearchUserScreen')
        break;
      case 2:
        navigation.navigate('MessageScreen')
        break;
      case 3:
        navigation.navigate('NotificationScreen');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.topRow}>
      <Text style={styles.logo}>Logo</Text>

      <View style={styles.actions}>
        {[Icons.share, Icons.search, Icons.messanger, Icons.notification].map(
          (icon, i) => (
            <TouchableOpacity key={i} style={styles.iconContainer} onPress={() => handleIconPress(i)} >
              <Image source={icon} style={styles.icon} />
            </TouchableOpacity>
          )
        )}
        <GradientAvatar source={userProfile?.profile_photo_url ? { uri: userProfile?.profile_photo_url } : Icons.placeholder} size={30} borderWidth={1.5} isPress={true} onPress={() => navigation.navigate('ProfileScreen')} />
      </View>
    </View>
  )
}
export default TopHeader

const styles = StyleSheet.create({
  topRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },
 

});