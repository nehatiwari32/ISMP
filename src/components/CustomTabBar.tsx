import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ??
          options.title ??
          route.params?.label ??
          route.name;
        const icon = route.params?.icon;
        const isCenter = route.params?.isCenter;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // 🟢 Center Button
        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              onPress={onPress}
              style={styles.centerButtonWrapper}
              activeOpacity={0.8}
            >
              <View style={[styles.centerButton, { backgroundColor: isFocused ? Colors.secondary : Colors.primary }]}>
                <Image
                  source={icon}
                  style={{ width: 20, height: 20, tintColor: "#fff" }}
                />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Image
              source={icon}
              style={[
                styles.icon,
                { tintColor: isFocused ? Colors.secondary : Colors.primary },
              ]}
            />
            <Text
              style={[
                Typography.black14Medium,
                { color: isFocused ? Colors.secondary : Colors.primary, marginTop: 6 },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20
  },

  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginBottom: 3,
  },

  /** 🔹 Center Add Button */
  centerButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
