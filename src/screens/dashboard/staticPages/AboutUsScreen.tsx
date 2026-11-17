import React, { useCallback } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { Images } from "../../../assets/images";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getStaticContent } from "../../../redux/slices/authSlice";

const AboutUsScreen = () => {
  const dispatch = useDispatch();
  const { content, loading } = useSelector((state) => state.auth);

  useFocusEffect(
    useCallback(() => {
      dispatch(getStaticContent("about_us"));
    }, [dispatch])
  );

  return (
    <ViewContainer
      isHeader
      headerTitle="About Us"
      scrollable
      containerStyle={styles.container}
    >
      <View style={styles.content}>
        <Image source={Images.aboutus} style={styles.imgStyle} />

        {loading ?
          <ActivityIndicator size="large" style={{ marginTop: 50 }} color={Colors.primary} />
          :
          <>
            <Text style={Typography.black14Regular}>{content?.content}</Text>

            <Text style={styles.highlightText}>
              Visit our website to learn more about our complete product application
              portfolio.
            </Text>

            <Text style={styles.linkText}>
              www.ismp.com
            </Text>
          </>}
      </View>
    </ViewContainer>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },

  content: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingBottom: 30,
  },

  imgStyle: {
    objectFit: "contain",
    width: '100%',
    height: 170,
    marginVertical: 10
  },

  text: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.primaryTextDark,
    lineHeight: 22,
    marginBottom: 12,
  },

  highlightText: {
    fontSize: 14,
    fontWeight: "700",
    fontStyle: "italic",
    color: Colors.primaryTextDark,
    marginBottom: 10,
  },

  linkText: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.primary,
    fontWeight: "600",
  },
});
