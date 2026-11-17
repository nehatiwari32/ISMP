import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../../theme/colors";
import { CustomButton } from "../../../components";
import { Spacing, Typography } from "../../../theme/typography";

const PROFILES = [
  {
    id: "1",
    name: "Nitin _Kumar",
    avatar:
      "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "2",
    name: "Anant_Kapoor",
    avatar:
      "https://randomuser.me/api/portraits/men/46.jpg",
  },
];

const SignIn = () => {
  const navigation = useNavigation()
  const handleProfilePress = (profile: any) => {
    console.log("Selected profile:", profile.name);
    // Navigate to password or OTP screen if needed
  };

  const renderProfile = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.profileCard}
      activeOpacity={0.8}
      onPress={() => handleProfilePress(item)}
    >
      <View style={styles.profileInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={Typography.black14Bold}>{item.name}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <>

      {/* Profiles */}
      <FlatList
        data={PROFILES}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Use another profile */}
      <CustomButton
        onPress={() => navigation.navigate('LoginScreen')}
        title="Use another Profile"
        variant="outlined"
        buttonStyle={{ width: '80%', alignSelf: 'center', marginTop: '10%' }}
      />
    </>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: Spacing.modalBorderRadius
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  arrow: {
    fontSize: 28,
    color: Colors.secondaryText,
    marginRight: 4,
    fontWeight: '300'
  },
  useAnotherBtn: {
    borderWidth: 0.8,
    borderColor: Colors.primary,
    borderRadius: 30,
    alignSelf: "center",
    paddingHorizontal: 40,
    paddingVertical: 10,
    marginTop: 40,
  },
});
