import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ImageBackground,
  StyleSheet,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";

import {
  InputField,
  SearchDropdown,
  CustomDropdown,
  ViewContainer,
  CustomButton,
} from "../../../../components";

import { getStateCity, updateLocality } from "../../../../redux/slices/authSlice";
import { Images } from "../../../../assets/images";
import { Icons } from "../../../../assets/icons";
import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";
import { cleanObject } from "../../../../utils/helper";

const EditLocalityScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { item } = route.params;

  const isStateMode = item?.district && item?.state;

  const [searchLocality, setSearchLocality] = useState("");
  const [searchPincode, setSearchPincode] = useState("");

  const [visibleLocality, setVisibleLocality] = useState(false);
  const [visiblePincode, setVisiblePincode] = useState(false);

  const [localityList, setLocalityList] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);

  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  const [selected, setSelected] = useState({
    pincode: item?.pincode || "",
    locality_name: item?.locality_name || "",
    district: item?.district || "",
    state: item?.state || "",
  });

  // ------------------------------
  // LOAD STATE + DISTRICT
  // ------------------------------
  useEffect(() => {
    loadState();
    loadDistrict();
  }, []);

  const loadState = async () => {
    const res = await dispatch(getStateCity({ type: "state" })).unwrap();
    setStateList(res.map((s) => ({ label: s.state_name, value: s.state_name })));
  };

  const loadDistrict = async () => {
    const res = await dispatch(getStateCity({ type: "district" })).unwrap();
    setDistrictList(res.map((d) => ({ label: d.district_name, value: d.district_name })));
  };

  // ------------------------------
  // SEARCH LOCALITY
  // ------------------------------
  const handleLocalitySearch = useCallback(
    async (text) => {
      setSearchLocality(text);

      if (text.length < 2) {
        setLocalityList([]);
        setVisibleLocality(false);
        return;
      }

      try {
        const res = await dispatch(
          getStateCity({ type: "locality", search: text })
        ).unwrap();

        setLocalityList(res || []);
        setVisibleLocality(true);
      } catch (err) {
        console.log("Locality Search Error:", err);
        setLocalityList([]);
        setVisibleLocality(true);
      }
    },
    [dispatch]
  );

  // ------------------------------
  // SEARCH PINCODE
  // ------------------------------
  const handlePincodeSearch = useCallback(
    async (text) => {
      setSearchPincode(text);
      setSelected((p) => ({ ...p, pincode: text }));

      if (text.length < 2) {
        setPincodeList([]);
        setVisiblePincode(false);
        return;
      }

      try {
        const res = await dispatch(
          getStateCity({ type: "pincode", search: text })
        ).unwrap();

        setPincodeList(res || []);
        setVisiblePincode(true);
      } catch (err) {
        console.log("Pincode Search Error:", err);
        setPincodeList([]);
        setVisiblePincode(true);
      }
    },
    [dispatch]
  );

  // ------------------------------
  // SELECT LOCALITY
  // ------------------------------
  const onSelectLocality = (loc) => {
    setSelected({
      pincode: loc?.pincode,
      locality_name: loc?.locality_name,
      district: loc?.district,
      state: loc?.state,
    });

    setSearchLocality(`${loc.pincode} – ${loc.locality_name}`);
    setVisibleLocality(false);
  };

  // ------------------------------
  // SELECT PINCODE
  // ------------------------------
  const onSelectPincode = (loc) => {
    setSelected((p) => ({
      ...p,
      pincode: loc?.pincode,
      locality_name: loc?.locality_name || p.locality_name,
      district: loc?.district || p.district,
      state: loc?.state || p.state,
    }));

    setSearchPincode(loc.pincode);
    setVisiblePincode(false);
  };

  // ------------------------------
  // SAVE
  // ------------------------------
  const handleSave = async () => {
    if (!selected.pincode) {
      return Alert.alert("Error", "Please fill or select required fields.");
    }

    const payload = {
      id: item.id,
      data: cleanObject({
        pincode: selected.pincode,
        locality_name: selected.locality_name,
        district: selected.district,
        state: selected.state,
      }),
    };

    try {
      await dispatch(updateLocality(payload)).unwrap();
      Alert.alert("Success", "Locality updated successfully!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to update locality");
    }
  };

  return (
    <ViewContainer
      headerTitle="Location"
      containerStyle={{ paddingHorizontal: 0 }}
      bottomFixedComponent={<CustomButton title="Save Changes" onPress={handleSave} />}
    >
      <View style={styles.container}>
        <View style={styles.cardStyle}>
          <Text style={styles.labelText}>
            {isStateMode ? "State & District" : "Pincode or Locality"}
          </Text>

          {/* --------------------------
              MODE: STATE MODE
          --------------------------- */}
          {isStateMode ? (
            <>
              <CustomDropdown
                placeholder="Select state"
                data={stateList}
                selectedValue={selected.state}
                onSelect={(v) => setSelected((p) => ({ ...p, state: v }))}
              />

              <CustomDropdown
                placeholder="Select district"
                data={districtList}
                selectedValue={selected.district}
                onSelect={(v) => setSelected((p) => ({ ...p, district: v }))}
              />

              <InputField
                placeholder="Enter pincode"
                value={selected.pincode}
                keyboardType="number-pad"
                onChangeText={(v) => setSelected((p) => ({ ...p, pincode: v }))}
              />
            </>
          ) : (
            <>
              {/* --------------------------
                  LOCALITY SEARCH FIELD
              --------------------------- */}
              <SearchDropdown
                placeholder="Search pincode or locality"
                value={selected.locality_name}
                searchValue={searchLocality}
                onChangeText={handleLocalitySearch}
                visible={visibleLocality}
                list={localityList}
                onSelect={onSelectLocality}
                onClose={() => setVisibleLocality(false)}
                showLocality
              />

              {/* --------------------------
                  PINCODE SEARCH FIELD
              --------------------------- */}
              <SearchDropdown
                placeholder="Search pincode"
                value={selected.pincode}
                searchValue={searchPincode}
                onChangeText={handlePincodeSearch}
                visible={visiblePincode}
                list={pincodeList}
                onSelect={onSelectPincode}
                onClose={() => setVisiblePincode(false)}
                showLocality
              />
            </>
          )}

          {/* --------------------------
              MAP
          --------------------------- */}
          <ImageBackground
            source={Images.map}
            style={styles.mapBackground}
            imageStyle={{ borderRadius: 10 }}
          >
            <View style={styles.locateOnMapBtn}>
              <Image source={Icons.Gps} style={styles.gpsIcon} />
              <Text style={styles.locateText}>Locate on map</Text>
            </View>
          </ImageBackground>
        </View>
      </View>
    </ViewContainer>
  );
};

export default EditLocalityScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    flex: 1,
  },
  cardStyle: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: Spacing.modalBorderRadius,
    marginTop: 14,
  },
  labelText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
    marginBottom: 10,
  },
  mapBackground: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  locateOnMapBtn: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: "center",
  },
  gpsIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.primary,
  },
  locateText: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },
});
