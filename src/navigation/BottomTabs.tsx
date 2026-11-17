import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icons } from "../assets/icons";

import {
  AddPostScreen,
  EventScreen,
  HomeScreen,
  LMSScreen,
  VibeScreen,
} from "../screens";
import { CustomTabBar } from "../components";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />} // 👈 our custom component
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ icon: Icons.home, label: "Home" }}
      />
      <Tab.Screen
        name="Event"
        component={EventScreen}
        initialParams={{ icon: Icons.event, label: "Event" }}
      />
      <Tab.Screen
        name="AddPost"
        component={AddPostScreen}
        initialParams={{ icon: Icons.add, isCenter: true }}
      />
      <Tab.Screen
        name="LMS"
        component={LMSScreen}
        initialParams={{ icon: Icons.lms, label: "LMS" }}
      />
      <Tab.Screen
        name="Vibe"
        component={VibeScreen}
        initialParams={{ icon: Icons.vibe, label: "Vibe" }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
