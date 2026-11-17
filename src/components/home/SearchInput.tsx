import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import GradientAvatar from "../GradientAvatar";
import CreatePostModal from "../modals/CreatePostModal";
import { Typography } from "../../theme/typography";

const SearchInput = () => {
  const navigation = useNavigation();
  const { userProfile } = useSelector((state: any) => state.profile);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false)

  return (
    <>
      <View style={styles.container}>
        <View style={styles.searchBox}>
          <GradientAvatar source={userProfile?.profile_photo_url ? { uri: userProfile?.profile_photo_url } : Icons.user} size={30} borderWidth={1.5} />
          <TouchableOpacity style={styles.inputContainer} onPress={() => setShowCreatePostModal(true)}>
            <TextInput
              style={[Typography.black14Medium, { padding: 0 }]}
              placeholder="Speak from your heart"
              editable={false}
              placeholderTextColor={Colors.secondaryText}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addContainer} onPress={() => navigation.navigate('CreatePostScreen')}>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CreatePostModal
        visible={showCreatePostModal}
        modalHeight={'65%'}
        closingHeight={'29%'}
        onClose={() => {
          setShowCreatePostModal(false);
        }}
      />
    </>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 16,
    gap: 6
  },
  searchIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  input: {
    fontSize: 14,
    color: Colors.primaryText,
    padding: 0,
  },
  addContainer: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary
  },
  plusIcon: {
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    color: '#fff'
  },
});