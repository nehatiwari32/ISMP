import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { CommonListingCard, ViewContainer } from "../../../../components";
import { Spacing, Typography } from "../../../../theme/typography";
import { Colors } from "../../../../theme/colors";
import { Icons } from "../../../../assets/icons";
import { getBirthdayList } from "../../../../redux/slices/profileSlice";

const BirthdayList = () => {
  const dispatch = useDispatch<any>();

  const { birthdayList, loading } = useSelector(
    (state: any) => state.profile
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  // -----------------------------------------
  // LOAD ON FIRST RENDER
  // -----------------------------------------
  const loadList = () => {
    dispatch(getBirthdayList());
  };

  useEffect(() => {
    loadList();
  }, []);

  // -----------------------------------------
  // REFRESH
  // -----------------------------------------
  const onRefresh = () => {
    setIsRefreshing(true);

    dispatch(getBirthdayList())
      .unwrap()
      .finally(() => setIsRefreshing(false));
  };

  return (
    <ViewContainer headerTitle="Birthdays" containerStyle={{ paddingHorizontal: 0 }}>
      <View
        style={{
          backgroundColor: Colors.lightBg,
          flex: 1,
          paddingHorizontal: Spacing.screenHorizontalPadding,
          paddingTop: 10,
        }}
      >
        <Text style={[Typography.black16Bold, { marginVertical: 10 }]}>
          {birthdayList.length} Recent
        </Text>

        <FlatList
          data={birthdayList}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 8 }}>
              <CommonListingCard
                title={item?.name}
                subTitle={item?.birthday_date}
                isIcon={Icons.bgMsg}
                iconStyle={{ height: 30, width: 30, objectFit: "contain" }}
                subTitleStyle={[Typography.black11Bold, { color: Colors.primary }]}
              />
            </View>
          )}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 16, color: "#888" }}>
                  No birthdays found.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" style={{ paddingVertical: 10 }} color={Colors.primary} />
            ) : null
          }
        />
      </View>
    </ViewContainer>
  );
};

export default BirthdayList;
