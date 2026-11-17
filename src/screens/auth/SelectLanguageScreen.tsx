import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../../redux/store";

import { AuthContainer, LanguageSkeleton } from "../../components";
import { Images } from "../../assets/images";
import { CommonModal } from "../../components/common";
import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { getLanguages, setSelectedLanguage } from "../../redux/slices/authSlice";
import { Spacing, Typography } from "../../theme/typography";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const H_PADDING = 20;
const BOX_WIDTH = (width - H_PADDING * 2 - ITEM_MARGIN * 2) / 2;

const SelectLanguageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<any>();

  const { languages, loading } = useSelector((state: RootState) => state.auth);

  const [selected, setSelected] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<string>("");

  // ✅ Fetch languages on mount
  useEffect(() => {
    loadLang()
  }, [dispatch]);

  const loadLang = async () => {
    await dispatch(getLanguages());
  }

  // ✅ Auto-select first language once data arrives
  useEffect(() => {
    if (!loading && languages?.length > 0 && !selected) {
      dispatch(setSelectedLanguage(languages[0]));
      setSelected(languages[0].code); // default first language
    }
  }, [languages, loading]);

  const handleLanguagePress = (id: string) => {
    if (id === selected) return;
    setTempSelected(id);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const selectedLang = languages.find((lang) => lang.code === tempSelected);
    // if (selectedLang) {
    //   dispatch(setSelectedLanguage(selectedLang)); 
    // }
    // setSelected(tempSelected);
    setModalVisible(false);
  };
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selected === item.code;
    const isLastSingle =
      languages.length % 2 !== 0 && index === languages.length - 1;

    return (
      <ImageBackground
        source={{ uri: item.image_url }}
        style={[
          styles.languageBox,
          isSelected && styles.selectedBox,
          isLastSingle && { alignSelf: "flex-start" },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleLanguagePress(item.code)}
          activeOpacity={0.8}
          style={{ alignItems: "center", width: "100%" }}
        >
          {/* <View
            style={[styles.symbolContainer, isSelected && styles.symbolSelected]}
          > */}
            <Text
              style={[Typography.black18Bold, { color: isSelected ? Colors.secondary : Colors.primary }]}
            >
               {item?.translation}
            </Text>
          {/* </View> */}

         {item.name?.toLowerCase() !== "english" &&  <Text
            style={[Typography.black14Medium, { color: isSelected ? Colors.secondary : Colors.primary }]}
          >
            {item?.name}
          </Text>}

          {isSelected && (
            <View style={styles.checkMarkContainer}>
              <View style={styles.checkMarkCircle}>
                <Image source={Icons.check} tintColor={"#fff"} style={styles.checkMark} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ImageBackground>
    );
  };

  return (
    <>
      <AuthContainer
        headerTitle="Select Language"
        backgroundImage={Images.languageBg}
        btnTitle="Next"
        onPress={() => navigation.navigate("AuthScreen" as never)}
        isRight={false}
      >
        {loading ? (
          <LanguageSkeleton />
        ) : (
          <FlatList
            data={languages}
            renderItem={renderItem}
            keyExtractor={(item) => item._id || item.code}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        )}
      </AuthContainer>

      <CommonModal
        visible={modalVisible}
        image={Images.noLng}
        title="Sorry we are Working on It!!!"
        body="We’re not ready to support your selected language yet. Please check back again later. Sorry for the inconvenience, and thank you for your patience."
        secondaryBody="Have a great day!"
        btnTitle="Continue"
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default SelectLanguageScreen;

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: H_PADDING,
    paddingVertical: "6%",
  },
  languageBox: {
    width: BOX_WIDTH,
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 1.8,
  },
  selectedBox: {
    borderColor: Colors.secondary,
  },
  symbolContainer: {
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 8,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  symbolSelected: {
    backgroundColor: Colors.secondaryLight,
  },
  checkMarkContainer: {
    position: "absolute",
    top: -28,
    right: -6,
  },
  checkMarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.8,
    borderColor: '#fff'
  },
  checkMark: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
});
