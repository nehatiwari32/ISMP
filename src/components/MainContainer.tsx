import React, { ReactNode, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { screenWidth } from '../utils/helper';

interface MainContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  backgroundImage?: any;
  barStyle?: 'light-content' | 'dark-content';
  statusBarColor?: string;
  showScroll?: boolean;
  contentPadding?: number;
  enableKeyboardAvoid?: boolean;
}

const MainContainer: React.FC<MainContainerProps> = ({
  children,
  backgroundColor = Colors.backgroundLight,
  backgroundImage,
  barStyle = 'dark-content',
  statusBarColor = 'transparent',
  showScroll = false,
  contentPadding = 20,
  enableKeyboardAvoid = true,
}) => {
  const Wrapper = showScroll ? ScrollView : View;

  const content = (
    <Wrapper
      style={styles.flex}
      contentContainerStyle={[
        styles.wrapper,
        { paddingHorizontal: contentPadding },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Wrapper>
  );

  const wrappedContent = enableKeyboardAvoid ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor={statusBarColor}
        barStyle={barStyle}
      />

      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {wrappedContent}
        </ImageBackground>
      ) : (
        wrappedContent
      )}
    </SafeAreaView>
  );
};

export default memo(MainContainer);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  wrapper: {
    flexGrow: 1,
    width: screenWidth,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
