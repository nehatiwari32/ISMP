import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import { GradientBox, ViewContainer } from "../../../../components";
import { Spacing, Typography } from "../../../../theme/typography";
import { Colors } from "../../../../theme/colors";
import { postCategoryData } from "../../../../utils/helper";

const PostCategoriesScreen = () => {
  const renderCard = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.boxContainer}>
        <GradientBox colors={["#FFF7F3", "#FFE9E2"]}>
          <View>
            <Text style={Typography.black16Bold}>{item.count}</Text>
            <Text
              style={[
                Typography.black12Regular,
                { color: Colors.secondaryText, marginTop: 2 },
              ]}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.iconBg} />
          <Image source={item.icon} style={styles.icon} />
        </GradientBox>
      </TouchableOpacity>
    );
  };

  return (
    <ViewContainer headerTitle="Post" containerStyle={{ paddingHorizontal: 0 }}>
      <View style={styles.wrapper}>
        <FlatList
          data={postCategoryData}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ViewContainer>
  );
};

export default PostCategoriesScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: Colors.lightBg,
    paddingTop: '5%'
  },
  listContent: {
    paddingBottom: 20,
  },

  boxContainer: {
    width: "48.5%",
    marginBottom: 16,
  },

  iconBg: {
    position: "absolute",
    right: 0,
    height: 76,
    width: 60,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    backgroundColor: "#F3B14A",
    opacity: 0.06,
  },

  icon: {
    width: 32,
    height: 32,
    objectFit: 'contain',
    tintColor: Colors.primary,
  },
});
