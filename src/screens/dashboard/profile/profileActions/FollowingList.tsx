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
import { getFollowingList } from "../../../../redux/slices/userActionSlice";

const LIMIT = 10;

const FollowersList = () => {
  const dispatch = useDispatch<any>();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const { following, followingPage, followingTotal, loading } = useSelector(
    (state: any) => state.userAction
  );

  const loadFirstPage = () => {
    dispatch(getFollowingList({ page: 1, limit: LIMIT }));
  };

  useEffect(() => {
    loadFirstPage();
  }, []);

  // ------------------------------------
  // PAGINATION
  // ------------------------------------
  const loadMore = () => {
    if (loading) return;
    if (following.length >= followingTotal) return;

    dispatch(getFollowingList({ page: followingPage + 1, limit: LIMIT }));
  };

  // ------------------------------------
  // REFRESH
  // ------------------------------------
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);

    dispatch(getFollowingList({ page: 1, limit: LIMIT }))
      .unwrap()
      .finally(() => setIsRefreshing(false));
  };

  return (
    <ViewContainer headerTitle="Following" containerStyle={{ paddingHorizontal: 0 }}>
      <View
        style={{
          backgroundColor: Colors.lightBg,
          flex: 1,
          paddingHorizontal: Spacing.screenHorizontalPadding,
          paddingTop: 10,
        }}
      >
        <Text style={[Typography.black16Bold, { marginVertical: 10 }]}>
          {followingTotal} Following
        </Text>

        <FlatList
          data={following}
          renderItem={({ item, index }) => (
            <View style={{ marginVertical: 8 }}>
              <CommonListingCard
                title={item.name}
                subTitle={item.user_name}
                isIcon={Icons.more}
                showMenu={activeMenu === index}
                onMenuToggle={() =>
                  setActiveMenu(activeMenu === index ? null : index)
                }
              />
            </View>
          )}
          keyExtractor={(item) => item?._id?.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            flexGrow: following.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={
            !loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 16, color: "#888" }}>
                  No users found in following list.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ paddingVertical: 10 }} />
            ) : null
          }
        />
      </View>
    </ViewContainer>
  );
};

export default FollowersList;
