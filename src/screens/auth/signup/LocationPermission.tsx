import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "@react-native-community/blur";
import { useDispatch } from 'react-redux';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { Colors } from "../../../theme/colors";
import { Images } from "../../../assets/images";
import { Spacing } from "../../../theme/typography";
import { addLocality } from "../../../redux/slices/authSlice";

const LocationPermission = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // ✅ Step 1: Basic Location Permission
  const requestLocationPermission = async () => {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      // Check permission status
      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        return true;
      }

      if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }

      return false;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  // ✅ Step 2: Updated Handler with Location Permission
  const handleAllowLocation = async () => {
    try {
      const testPayload = {
        addresses: [
          {
            latitude: 28.6139,
            longitude: 77.2090,
            pincode: "110001",
            state: "Delhi",
            district: "New Delhi",
            is_default: true
          }
        ]
      };

      console.log('3. Making API call...');

      // API call karein
      const result = await dispatch(addLocality(testPayload)).unwrap();
      console.log('4. API call successful');
      navigation.replace("ManualLocation", { isAllow: true })

    } catch (error: any) {
      console.log('Error:', error);
    }
  };

  return (
    <View style={styles.root}>
      {/* Blurred background */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={Platform.OS === "ios" ? "light" : "dark"}
        blurAmount={25}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.6)"
      />

      {/* White centered modal */}
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding }}>
            <Text style={styles.title}>Allow "ISMP" to use your location?</Text>
            <Text style={styles.subtitle}>
              To connect with your Neighbourhood Locality Community, Friends,
              Businesses, Offers and Lots more of Excitement.
            </Text>
          </View>

          {/* Map preview image */}
          <Image
            source={Images.allowLocation}
            style={styles.mapImage}
            resizeMode="cover"
          />

          {/* Buttons */}
          <TouchableOpacity
            style={styles.allowButton}
            onPress={() => Alert.alert(
              'Coming Soon',
              'Automatic location detection is not available yet. Please enter your address manually to continue.',
              [
                {
                  text: 'Continue', onPress: () =>
                    navigation.navigate('ManualLocation', { isAllow: false })
                },
              ]
            )}
            activeOpacity={0.7}
          >
            <Text style={styles.allowText}>Allow Your Location Access</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => navigation.navigate("ManualLocation", { isAllow: false })}
            activeOpacity={0.7}
          >
            <Text style={styles.manualText}>Enter Location Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
};

export default LocationPermission;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    marginHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondaryText,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 14,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  mapImage: {
    width: "100%",
    height: 140,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  allowButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
  },
  allowText: {
    color: Colors.blueColor,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#d1d1d1",
    width: "100%",
  },
  manualText: {
    color: Colors.blueColor,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 12,
    textAlign: "center",
  },
});