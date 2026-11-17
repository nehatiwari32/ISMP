// src/screens/Splash/SplashScreen.tsx
import React from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const SplashScreen = () => {

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* <Image source={images.appLogo} style={styles.logo} resizeMode="contain" /> */}
      <Text style={[Typography.black18Bold, { color: '#fff', textAlign: 'center' }]}>ISMP</Text>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});
