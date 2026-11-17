import React from "react";
import { CommonListingCard, ViewContainer } from "../../../components";
import { FlatList, StyleSheet, View } from "react-native";
import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/typography";

const AllRecentSearch = () => {

  const recentUsers = [
    {
      id: 1,
      name: "Rajat Kumar",
      username: "rajat_kumar",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Suhani Singh",
      username: "sushmita_singh",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Anurag Saxena",
      username: "anurag_saxena",
      image: "https://randomuser.me/api/portraits/men/14.jpg",
    },
  ];

  return (
    <ViewContainer headerTitle="All Recents" containerStyle={{paddingHorizontal: 0}}>
      <View style={styles.container}>
        <FlatList
          data={recentUsers}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CommonListingCard
              title={item.name}
              subTitle={item.username}
              showIcon={false}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </ViewContainer>
  )
}
export default AllRecentSearch;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 16,
  },

});