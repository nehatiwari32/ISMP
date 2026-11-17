// ViewContainer.tsx
import React from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  ViewStyle,
  ScrollViewProps,
  Platform,
  RefreshControl
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

import { Colors } from "../theme/colors";
import { CommonHeader } from "./common";
import { Spacing } from "../theme/typography";
import TopHeader from "./home/TopHeader";

interface ViewContainerProps extends ScrollViewProps {
  showHeaderlogo?: boolean;
  headerTitle?: string;
  rightText?: string;
  onRightPress?: () => void;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
  scrollable?: boolean;
  backgroundColor?: string;
  showBackBtn?: boolean;
  isHeader?: boolean;
  isHomeHeader?: boolean;
  safeAreaBottom?: boolean;
  bottomFixedComponent?: React.ReactNode; // ⭐ Support added
  bottomFixedStyle?: ViewStyle;
  refreshing?: any;
  onRefresh?: () => void;
}

const ViewContainer: React.FC<ViewContainerProps> = ({
  showHeaderlogo = false,
  headerTitle,
  rightText,
  onRightPress,
  children,
  containerStyle,
  scrollable = true,
  backgroundColor = Colors.backgroundLight,
  showBackBtn = true,
  isHeader = true,
  isHomeHeader = false,
  bottomFixedComponent,
  bottomFixedStyle,
  safeAreaBottom = false,
  refreshing,
  onRefresh,
  ...scrollProps
}) => {
  const edges: Edge[] = safeAreaBottom ? ['top', 'bottom'] : ['top'];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={edges}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />

      {isHeader && (
        <CommonHeader
          logo={showHeaderlogo}
          showBackBtn={showBackBtn}
          title={headerTitle}
          rightText={rightText}
          onRightPress={onRightPress}
        />
      )}

      {isHomeHeader && <TopHeader />}

      {scrollable ? (
        <ScrollView
          style={[styles.scrollContainer, { backgroundColor }]}
          contentContainerStyle={[styles.contentContainer, containerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                colors={[Colors.primary]}   // Android
                tintColor={Colors.primary}  // iOS
              />
            ) : undefined
          }
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, containerStyle]}>
          {children}
        </View>
      )}

      {bottomFixedComponent && (
        <View style={[styles.bottomFixedWrap, bottomFixedStyle]}>
          {bottomFixedComponent}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ViewContainer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },

  bottomFixedWrap: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 30, // ✅ Safe area for iOS
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,   // increase opacity (was too low)
    shadowRadius: 14,      // increase blur = fake spread
    elevation: 8,
    position: 'absolute', // ✅ Fixed at bottom
    bottom: 0,
    left: 0,
    right: 0,
  },
});
