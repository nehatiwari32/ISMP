import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import { ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { getStaticContent } from "../../../redux/slices/authSlice";
import { formatFullDate } from "../../../utils/helper";


const CommunityGuidelinesScreen = () => {
  const { content, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      dispatch(getStaticContent("permission_seeking_message"));
    }, [dispatch])
  );

  return (
    <ViewContainer
      isHeader
      headerTitle="Community Guidelines"
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
        </View>
      }

    </ViewContainer>
  );
};

export default CommunityGuidelinesScreen;

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
    marginVertical: 10,
    alignSelf: 'flex-start'
  },

});
