import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { Colors } from "../../theme/colors";
import { Spacing, Typography } from "../../theme/typography";

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = ["Post", "Story", "Vibez", "Market", "Event", "LMS"];

const PostTabs: React.FC<Props> = ({ active, onChange }) => {
  return (
    <View style={styles.mainContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((t) => {
          const isActive = t === active;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onChange(t)}
            >
              <Text style={[styles.tabText, isActive && styles.activeText]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PostTabs;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#303030",
    paddingVertical: 18,
  },

  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    gap: 10,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 40,
    backgroundColor: Colors.primaryExtraLight,
  },

  activeTab: {
    backgroundColor: Colors.secondaryLight,
  },

  tabText: {
    ...Typography.black14Regular,
    color: Colors.primary,
  },

  activeText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
});
