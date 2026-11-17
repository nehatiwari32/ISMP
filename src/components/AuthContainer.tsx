import React, { ReactNode, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { screenWidth } from '../utils/helper';
import AuthHeader from './AuthHeader';
import { CustomButton } from './common';

interface AuthContainerProps {
  children: ReactNode;
  backgroundImage?: any;
  backgroundColor?: string;
  secondBGColor?: string;
  showScroll?: boolean;
  barStyle?: 'light-content' | 'dark-content';
  statusBarColor?: string;
  contentPadding?: number;
  headerTitle?: string;
  btnTitle?: string;
  onPress?: any;
  showbtn?: boolean;
  loading?: boolean;
  isRight?: boolean;
  showLogo?: boolean;
  rightTxt?: string;
  onRightPress?: any;
  isHeader?: boolean;
  scrollRef?: any
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  backgroundImage,
  backgroundColor = Colors.backgroundLight,
  showScroll = true,
  barStyle = 'dark-content',
  statusBarColor = 'transparent',
  contentPadding = 0,
  headerTitle,
  btnTitle = 'Submit',
  onPress,
  showbtn = true,
  loading,
  isRight = true,
  showLogo = true,
  rightTxt,
  secondBGColor,
  onRightPress,
  isHeader = true,
  scrollRef
}) => {
  const Wrapper = showScroll ? ScrollView : View;

  const content = (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Wrapper
        ref={showScroll ? scrollRef : null}
        contentContainerStyle={[
          styles.wrapper,
          showScroll && {
            paddingHorizontal: contentPadding,
            paddingBottom: showbtn ? 100 : 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={!showScroll && styles.flex}
        bounces={false} // ✅ Prevents bouncing
      >
        {children}
      </Wrapper>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={barStyle}
        translucent
        backgroundColor={statusBarColor}
      />
      {isHeader && <AuthHeader
        title={headerTitle}
        showLogo={showLogo}
        isRight={isRight}
        rightTxt={rightTxt}
        onRightPress={onRightPress}
      />}

      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={{ flex: 1, backgroundColor: secondBGColor ? secondBGColor : '#fff' }}>
          {content}
        </View>
      )}

      {showbtn && (
        <View style={styles.btnContainer}>
          <CustomButton title={btnTitle} onPress={onPress} loading={loading} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default memo(AuthContainer);

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
  },
  btnContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
});