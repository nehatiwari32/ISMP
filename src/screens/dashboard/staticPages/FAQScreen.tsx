import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

import { ViewContainer } from "../../../components";
import { Icons } from "../../../assets/icons";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { getStaticContent } from "../../../redux/slices/authSlice";
import { getFAQList } from "../../../redux/slices/profileSlice";

// 🔥 STATIC FAQ DATA
const STATIC_FAQ = [
  {
    question: "What is this app used for?",
    answer: "This app helps users manage their profile, explore features, and receive updates in real time.",
  },
  {
    question: "How can I reset my password?",
    answer: "Go to the Login screen → Tap on ‘Forgot Password’ → Follow the instructions.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-level encryption to protect all user data.",
  },
  {
    question: "How can I contact support?",
    answer: "You can contact us via the Help & Support section in the app settings.",
  },
];

const FAQScreen = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const dispatch = useDispatch();
  const { FAQList, loading } = useSelector((state) => state.profile);

  useFocusEffect(
    useCallback(() => {
      dispatch(getFAQList());
    }, [dispatch])
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;


  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <ViewContainer
        headerTitle="FAQ"
        containerStyle={styles.mainContainer}
      >
        <View style={styles.container}>
          <View style={{ marginTop: '6%' }}>
            {FAQList?.map((item, index) => (
              <View key={index} style={styles.card}>
                <TouchableOpacity
                  style={styles.questionBox}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowContainer}>
                    <Text style={[Typography.black14Medium, {
                      color: Colors.gray20,
                      flex: 1,
                      marginRight: 10
                    }]}>{item?.question}</Text>

                    <Image
                      source={Icons.downArrow}
                      tintColor={Colors.primary}
                      style={[
                        styles.imgStyle,
                        { transform: [{ rotate: activeIndex === index ? "180deg" : "-90deg" }] },
                      ]}
                    />
                  </View>

                  {activeIndex === index && (
                    <Text style={[Typography.black12Regular, { color: Colors.secondaryText, marginTop: 8 }]}>{item?.answer}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ViewContainer>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 0
  },
  container: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
    flex: 1,
    backgroundColor: Colors.lightBg
  },
  card: {
    marginBottom: 14,
    borderRadius: Spacing.modalBorderRadius,
    backgroundColor: "#fff",
  },
  questionBox: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imgStyle: {
    width: 12,
    height: 6,
    objectFit: "contain",
  },
});

export default FAQScreen;
