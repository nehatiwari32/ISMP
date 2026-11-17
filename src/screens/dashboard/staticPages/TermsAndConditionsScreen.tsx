import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { useDispatch, useSelector } from "react-redux";
import { getStaticContent } from "../../../redux/slices/authSlice";
import { formatFullDate } from "../../../utils/helper";
import { useFocusEffect } from "@react-navigation/native";

const TermsAndConditionsScreen = () => {
  const dispatch = useDispatch();
  const { content, loading } = useSelector((state) => state.auth);

  useFocusEffect(
    useCallback(() => {
      dispatch(getStaticContent("terms_of_service"));
    }, [dispatch])
  );

  return (
    <ViewContainer
      isHeader
      headerTitle="Terms & Condition"
      containerStyle={styles.container}
    >
      {loading ?
        <ActivityIndicator size="large" style={{ marginTop: 50 }} color={Colors.primary} />
        :
        <View style={styles.content}>
          <View style={styles.dateContainer}>
            <Text style={[Typography.black14Bold, { color: '#fff' }]}>Last Updated: {formatFullDate(content?.updated_at)}</Text>
          </View>
          <Text style={Typography.black14Regular}>{content?.content}</Text>
        </View>}
    </ViewContainer>
  );
};

export default TermsAndConditionsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  dateContainer: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 16,
    alignSelf: 'flex-start'
  },

  text: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.primaryTextDark,
    lineHeight: 22
  },
});
