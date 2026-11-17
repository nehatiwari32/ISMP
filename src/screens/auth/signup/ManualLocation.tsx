import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import {
  AddAddressModal,
  AuthContainer,
  CustomDropdown,
  CustomSwitch,
  SearchDropdown,
} from "../../../components";

import { Colors } from "../../../theme/colors";
import { Images } from "../../../assets/images";
import { Icons } from "../../../assets/icons";
import {
  enableGhoastMode,
  getStateCity,
  addUserAddresses,
  updateLocality,
} from "../../../redux/slices/authSlice";
import { RootState } from "../../../redux/store";
import { Spacing, Typography } from "../../../theme/typography";
import { cleanObject } from "../../../utils/helper";

interface LocalityFormData {
  pincode: string;
  locality: string;
  locality_id?: string;
  state: string;
  stateLabel?: string;
  district: string;
  districtLabel?: string;
  searchType: "pincode" | "state";
  searchText: string;
  showSuggestions: boolean;
  localityList: any[];
  pincodeOptions: any[];
  districtOptions?: any[];
  district_id?: string | null;
  isEmpty?: boolean;
}

const ManualLocation = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const route = useRoute();
  const { isAllow, backScreen, editAddress } = route?.params || {};

  const { loading, localities: autoLocalities = [] } = useSelector((state: RootState) => state.auth);

  const [ghostMode, setGhostMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stateOptions, setStateOptions] = useState<any[]>([]);

  const [localityForms, setLocalityForms] = useState<LocalityFormData[]>([{
    pincode: "",
    locality: "",
    locality_id: "",
    state: "",
    stateLabel: "",
    district: "",
    districtLabel: "",
    searchType: "pincode",
    searchText: "",
    showSuggestions: false,
    localityList: [],
    pincodeOptions: [],
    districtOptions: [],
    district_id: null,
    isEmpty: true,
  }]);

  useEffect(() => {
    if (backScreen === 'SetBusinessProfile' && editAddress) {
      const populatedForm: LocalityFormData = {
        pincode: editAddress.pincode || "",
        locality: editAddress.locality_name || editAddress.locality || "",
        locality_id: editAddress.locality_id || editAddress._id || "",
        state: editAddress.state_id || editAddress.state || "",
        stateLabel: editAddress.state_name || editAddress.state || "",
        district: editAddress.district_id || editAddress.district || "",
        districtLabel: editAddress.district_name || editAddress.district || "",
        searchType: editAddress.type === "locality" || editAddress.type === "pincode" ? "pincode" : "state",
        searchText: editAddress.locality_name || editAddress.locality || "",
        showSuggestions: false,
        localityList: editAddress._id ? [{
          _id: editAddress._id,
          locality_id: editAddress.locality_id,
          locality_name: editAddress.locality_name || editAddress.locality,
          pincode: editAddress.pincode,
          state_id: editAddress.state_id,
          district_id: editAddress.district_id
        }] : [],
        pincodeOptions: [],
        districtOptions: [],
        district_id: editAddress.district_id || null,
        isEmpty: false,
      };

      setLocalityForms([populatedForm]);

      // If state flow, fetch districts
      if (populatedForm.searchType === "state" && populatedForm.state) {
        handleStateSelect({ value: populatedForm.state, label: populatedForm.stateLabel }, 0);
      }
    }
  }, [editAddress, backScreen]);

  const [searchPincodeText, setSearchPincodeText] = useState("");
  const [pincodeListGlobal, setPincodeListGlobal] = useState<any[]>([]);
  const [showPincodeSuggestionsGlobal, setShowPincodeSuggestionsGlobal] = useState(false);

  const searchTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const selectedLocalitiesRef = useRef<{ [key: number]: LocalityFormData }>({});

  const fetchStates = useCallback(async () => {
    try {
      const res: any = await dispatch(getStateCity({ type: "state" })).unwrap();
      const opts = (res || []).map((i: any) => ({
        id: i.state_id || i._id,
        label: i.state_name || i.name,
        value: i.state_id || i._id,
      }));
      setStateOptions(opts);
    } catch (err) {
      console.log("Error fetching states:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates, isAllow]);

  useFocusEffect(
    useCallback(() => {
      fetchStates();
    }, [fetchStates])
  );

  const updateForm = useCallback((formIndex: number, updates: Partial<LocalityFormData>) => {
    setLocalityForms(prev => prev.map((form, idx) =>
      idx === formIndex ? { ...form, ...updates } : form
    ));
  }, []);

  const handleCloseSuggestions = useCallback((formIndex: number) => {
    updateForm(formIndex, { showSuggestions: false });
  }, [updateForm]);

  const handleClosePincodeSuggestions = useCallback(() => {
    setShowPincodeSuggestionsGlobal(false);
  }, []);

  const handleLocalitySearch = useCallback((text: string, formIndex: number) => {
    // ✅ Update searchText immediately
    setLocalityForms(prev => {
      return prev.map((form, idx) =>
        idx === formIndex ? { ...form, searchText: text } : form
      );
    });

    const timeoutKey = `locality-${formIndex}`;
    if (searchTimeoutsRef.current[timeoutKey]) {
      clearTimeout(searchTimeoutsRef.current[timeoutKey]);
    }

    // ✅ If text is empty, clear BOTH locality and pincode
    if (text.length === 0) {
      setLocalityForms(prev => {
        return prev.map((form, idx) =>
          idx === formIndex ? {
            ...form,
            showSuggestions: false,
            localityList: [],
            locality: "",
            locality_id: "",
            pincode: "", // ✅ Clear pincode as well
            searchText: "",
            isEmpty: true,
          } : form
        );
      });
      // ✅ Also clear the ref
      delete selectedLocalitiesRef.current[formIndex];
      return;
    }

    if (text.length < 3) {
      updateForm(formIndex, { showSuggestions: false });
      return;
    }

    searchTimeoutsRef.current[timeoutKey] = setTimeout(async () => {
      updateForm(formIndex, { showSuggestions: true });

      try {
        const res: any = await dispatch(getStateCity({ type: "locality", search: text })).unwrap();
        updateForm(formIndex, { localityList: res || [] });
      } catch (err) {
        updateForm(formIndex, { localityList: [] });
      }
    }, 500);
  }, [dispatch, updateForm]);

  const handlePincodeSearchGlobal = useCallback((text: string) => {
    setSearchPincodeText(text);

    if (searchTimeoutsRef.current['pincode']) {
      clearTimeout(searchTimeoutsRef.current['pincode']);
    }

    if (text.length === 0) {
      setShowPincodeSuggestionsGlobal(false);
      setPincodeListGlobal([]);
      return;
    }

    if (text.length < 3) {
      setShowPincodeSuggestionsGlobal(false);
      return;
    }

    searchTimeoutsRef.current['pincode'] = setTimeout(async () => {
      setShowPincodeSuggestionsGlobal(true);

      try {
        const res: any = await dispatch(getStateCity({ type: "locality", search: text })).unwrap();
        const mapped = (res || []).map((i: any) => ({
          _id: i._id,
          locality_id: i.locality_id || i._id,
          pincode: i.pincode,
          locality_name: i.locality_name || ""
        }));
        setPincodeListGlobal(mapped);
      } catch (err) {
        setPincodeListGlobal([]);
      }
    }, 500);
  }, [dispatch]);

  const fetchPincodesByDistrict = useCallback(async (districtId: string, formIndex: number) => {
    if (!districtId) {
      updateForm(formIndex, { pincodeOptions: [] });
      return;
    }
    try {
      const res: any = await dispatch(getStateCity({
        type: "pincode",
        district_id: districtId
      })).unwrap();

      const mapped = (res || []).map((i: any) => ({
        _id: i._id,
        locality_id: i.locality_id || i._id,
        pincode: i.pincode,
        locality_name: i.locality_name || ""
      }));
      updateForm(formIndex, { pincodeOptions: mapped });
    } catch (err) {
      updateForm(formIndex, { pincodeOptions: [] });
    }
  }, [dispatch, updateForm]);

  const handlePincodeSelect = useCallback((item: any, formIndex: number) => {
    setLocalityForms(prev => {
      const copy = [...prev];
      const currentForm = copy[formIndex];

      const updatedForm = {
        ...currentForm,
        pincode: item.pincode,
        locality: item.locality_name || currentForm.locality,
        locality_id: item.locality_id || item._id,
        searchText: item.locality_name || currentForm.searchText, // ✅ Update search text as well
        showSuggestions: false,
        localityList: [{
          _id: item._id,
          locality_id: item.locality_id || item._id,
          locality_name: item.locality_name,
          pincode: item.pincode
        }],
        isEmpty: false,
      };

      copy[formIndex] = updatedForm;

      // ✅ Update ref as well
      selectedLocalitiesRef.current[formIndex] = updatedForm;

      return copy;
    });

    setSearchPincodeText("");
    setShowPincodeSuggestionsGlobal(false);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: any, formIndex: number) => {
    const localityName = suggestion.locality_name;
    const pincode = suggestion.pincode || "";
    const localityId = suggestion._id || suggestion.locality_id || "";
    const districtId = suggestion.district_id || suggestion.district || null;

    const selectedData = {
      locality: localityName,
      locality_id: localityId,
      pincode: pincode,
      searchText: localityName,
      showSuggestions: false,
      localityList: [{
        _id: localityId,
        locality_id: localityId,
        locality_name: localityName,
        pincode: pincode
      }],
      isEmpty: false,
    };

    // ✅ Save to ref for persistence
    selectedLocalitiesRef.current[formIndex] = {
      ...selectedData,
    } as LocalityFormData;

    setLocalityForms(prev => {
      const updated = prev.map((form, idx) => {
        if (idx !== formIndex) return form;

        const newForm = {
          ...form,
          ...selectedData,
        };

        return newForm;
      });

      return updated;
    });

    // ✅ Fetch districts if available
    if (districtId) {
      setTimeout(() => {
        fetchPincodesByDistrict(districtId, formIndex);
      }, 100);
    }
  }, [fetchPincodesByDistrict]);

  const handleStateSelect = useCallback(async (item: any, formIndex: number) => {
    const selectedState = stateOptions.find(s => s.value === item.value);
    updateForm(formIndex, {
      state: item.value,
      stateLabel: selectedState?.label || "",
      district: "",
      districtLabel: "",
      district_id: null,
      pincode: "",
      locality: "",
      locality_id: "",
      localityList: [],
      pincodeOptions: [],
      districtOptions: [],
      isEmpty: true,
    });

    try {
      const res: any = await dispatch(getStateCity({
        search: item?.label,
      })).unwrap();
      const opts = (res || []).map((d: any) => ({
        label: d.district_name,
        value: d.district_id
      }));
      updateForm(formIndex, { districtOptions: opts });
    } catch (err) {
      updateForm(formIndex, { districtOptions: [] });
    }
  }, [dispatch, stateOptions, updateForm]);

  const handleDistrictSelect = useCallback(async (districtId: any, formIndex: number) => {
    const form = localityForms[formIndex];
    const selected = (form.districtOptions || []).find((d) => d.value === districtId);

    const isEmpty = !form.state || !districtId;

    updateForm(formIndex, {
      district: districtId,
      districtLabel: selected?.label || "",
      district_id: districtId,
      pincode: "",
      locality: "",
      locality_id: "",
      localityList: [],
      pincodeOptions: [],
      isEmpty: isEmpty,
    });

    if (districtId) {
      fetchPincodesByDistrict(districtId, formIndex);
    }
  }, [localityForms, fetchPincodesByDistrict, updateForm]);

  const handleAddNewLocalityForm = useCallback(() => {
    setLocalityForms(prev => {
      if (prev.length >= 5) {
        Alert.alert("Limit Reached", "You can add maximum 5 preferred localities.");
        return prev;
      }
      return [
        ...prev,
        {
          pincode: "",
          locality: "",
          locality_id: "",
          state: "",
          stateLabel: "",
          district: "",
          districtLabel: "",
          searchType: "pincode",
          searchText: "",
          showSuggestions: false,
          localityList: [],
          pincodeOptions: [],
          districtOptions: [],
          district_id: null,
          isEmpty: true,
        }
      ];
    });
  }, []);

  const handleRemoveLocalityForm = useCallback((formIndex: number) => {
    setLocalityForms(prev => {
      if (prev.length === 1) {
        Alert.alert("Cannot Remove", "At least one locality form is required.");
        return prev;
      }
      return prev.filter((_, idx) => idx !== formIndex);
    });
    // ✅ Also remove from ref
    delete selectedLocalitiesRef.current[formIndex];
  }, []);

  const handleSearchTypeChange = useCallback((formIndex: number, type: "pincode" | "state") => {
    updateForm(formIndex, {
      searchType: type,
      pincode: "",
      locality: "",
      locality_id: "",
      state: "",
      stateLabel: "",
      district: "",
      districtLabel: "",
      district_id: null,
      searchText: "",
      localityList: [],
      pincodeOptions: [],
      districtOptions: [],
      isEmpty: true,
    });
    // ✅ Clear ref when changing search type
    delete selectedLocalitiesRef.current[formIndex];
  }, [updateForm]);

  const handleGhostToggle = useCallback(async (value: boolean) => {
    setGhostMode(value);
    try {
      const payload = { enable: value };
      const res: any = await dispatch(enableGhoastMode(payload)).unwrap();
      if (res?.statusCode === 200 || res?.statusCode === "200") {
        Alert.alert("Success", value ? "Ghost Mode enabled." : "Ghost Mode disabled.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong.");
      setGhostMode(prev => !prev);
    }
  }, [dispatch]);

  const handleContinue = useCallback(async () => {
    // ✅ Restore from ref if state was accidentally reset
    setLocalityForms(prev => {
      return prev.map((form, idx) => {
        const savedForm = selectedLocalitiesRef.current[idx];
        if (savedForm && (!form.locality_id || form.isEmpty)) {
          return { ...form, ...savedForm };
        }
        return form;
      });
    });

    // ✅ Wait for state update
    setTimeout(async () => {
      setLocalityForms(currentForms => {
        // ✅ Check first form directly from current state
        const firstForm = currentForms[0];
        const firstFormFilled = !firstForm.isEmpty;

        if (!firstFormFilled) {
          console.log("❌ First form validation failed");
          Alert.alert(
            "Validation Error",
            "Please complete the first address field before continuing."
          );
          return currentForms;
        }

        // ✅ Build payload from current state
        const nonEmptyForms = currentForms.filter((form, index) => {
          const isEmpty = form.isEmpty || false;
          return !isEmpty;
        });

        const payload = nonEmptyForms
          .map((f, index) => {

            if (f.searchType === "pincode") {
              let localityIdToUse = f.locality_id;
              let pincodeToUse = f.pincode;

              if (f.localityList && f.localityList.length > 0) {
                const item = f.localityList[0];
                localityIdToUse = item.locality_id || item._id;
                pincodeToUse = item.pincode || pincodeToUse;
              }

              if (pincodeToUse && localityIdToUse) {
                const result = cleanObject({
                  type: "locality",
                  pincode: pincodeToUse,
                  locality_name: localityIdToUse,
                });

                return result;
              }
              return null;
            }

            else if (f.searchType === "state") {
              if (f.state && f.district) {
                const result = cleanObject({
                  type: "state",
                  district: f.district,
                  state: f.state,
                  pincode: f.pincode || "",
                });

                return result;
              }

              return null;
            }

            return null;
          })
          .filter(Boolean);


        if (payload.length === 0) {
          Alert.alert(
            "Validation Error",
            "Please provide valid address details before continuing."
          );
          return currentForms;
        }

        // ✅ Make API call
        (async () => {
          try {
            if (editAddress) {
              const form = currentForms[0];
              let updatePayload;

              if (form.searchType === "pincode") {
                const localityId = form.localityList?.[0]?.locality_name;

                updatePayload = cleanObject({
                  type: "locality",
                  pincode: form.pincode,
                  locality_name: localityId,
                });
              } else {
                updatePayload = cleanObject({
                  type: "state",
                  district: form.district,
                  state: form.state,
                  pincode: form.pincode || "",
                });
              }

              const editPayload = {
                id: editAddress._id,
                data: updatePayload,
              };

              console.log("📤 Edit payload:", editPayload);

              const response: any = await dispatch(updateLocality(editPayload)).unwrap();
              if (response?.statusCode === 200 || response?.statusCode === "200") {
                Alert.alert("Success", "Address updated successfully!");
                navigation.goBack();
              }
            } else {
              console.log("📤 Add payload:", payload);
              const response: any = await dispatch(addUserAddresses(payload)).unwrap();
              if (response?.statusCode === 200 || response?.statusCode === "200") {
                resetAllForms();
                selectedLocalitiesRef.current = {};
                if (backScreen) navigation.goBack();
                else navigation.navigate("Auth", { screen: "FriendRequest" });
              }
            }

          } catch (err: any) {
            console.log("❌ Error:", err);
            Alert.alert("Error", err?.message || err || "Something went wrong.");
          }
        })();

        return currentForms;
      });
    }, 100);
  }, [dispatch, navigation, backScreen, editAddress]);

  const resetAllForms = useCallback(() => {
    setLocalityForms([
      {
        pincode: "",
        locality: "",
        locality_id: "",
        state: "",
        stateLabel: "",
        district: "",
        districtLabel: "",
        searchType: "pincode",
        searchText: "",
        showSuggestions: false,
        localityList: [],
        pincodeOptions: [],
        districtOptions: [],
        district_id: null,
        isEmpty: true,
      }
    ]);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(searchTimeoutsRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  function getOrdinalSuffix(num: number) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  return (
    <AuthContainer
      headerTitle="Location"
      onPress={handleContinue}
      btnTitle={loading ? "Please wait..." : isAllow ? "Continue" : "Next"}
      showLogo={false}
      isRight={false}
      secondBGColor={Colors.lightBg}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.locationDeducted}>
            {isAllow ? "LOCATION DETECTED" : "LOCATION DETECTED"}
          </Text>

          {localityForms[0].searchType === 'pincode' && (
            <View style={styles.ghostContainer}>
              <View style={styles.ghostContent}>
                <Image source={Icons.ghostIcon} style={styles.ghostIcon} />
                <View style={styles.ghostTextContainer}>
                  <Text style={styles.ghostTitle}>Ghost Mode</Text>
                  <Text style={styles.ghostSubtitle}>
                    When Enabled, your friends can't see your location
                  </Text>
                </View>
              </View>

              <CustomSwitch
                value={ghostMode}
                onValueChange={handleGhostToggle}
                disabled={loading}
              />
            </View>
          )}

          {isAllow && autoLocalities.length > 0
            ? autoLocalities.map((loc, i) => (
              <View key={loc._id || i} style={styles.autoDetectedContainer}>
                <View style={styles.pincodeCard}>
                  <View style={styles.pincodeLeft}>
                    <Image source={Icons.greenMap} style={styles.pinIcon} />
                    <View>
                      <Text style={styles.pincodeTitle}>Pincode {i + 1} (Auto-detected)</Text>
                      <Text style={styles.pincodeValue}>{loc.pincode} – {loc.locality_name || loc.district || ""}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
            : localityForms.map((form, index) => (
              <View key={`locality-card-${index}`} style={styles.localityCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionLabel}>
                    {index === 0 ? "Select Your Locality By giving" : `${index + 1}${getOrdinalSuffix(index + 1)} Preferred Locality`}
                  </Text>
                  {index !== 0 && (
                    <TouchableOpacity onPress={() => handleRemoveLocalityForm(index)} style={styles.removeButton}>
                      <Image source={Icons.cross} style={styles.removeIcon} tintColor={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => handleSearchTypeChange(index, "pincode")}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioCircle,
                      { borderColor: form.searchType === "pincode" ? Colors.primary : Colors.radioBorder }
                    ]}>
                      {form.searchType === "pincode" && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioLabel}>Pincode or locality</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => handleSearchTypeChange(index, "state")}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioCircle,
                      { borderColor: form.searchType === "state" ? Colors.primary : Colors.radioBorder }
                    ]}>
                      {form.searchType === "state" && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioLabel}>Select State & District</Text>
                  </TouchableOpacity>
                </View>

                {form.searchType === "pincode" ? (
                  <>
                    <SearchDropdown
                      placeholder="Search locality"
                      value={form.locality}
                      searchValue={form.searchText}
                      onChangeText={(t) => {
                        console.log(`📝 Locality search text changed to: "${t}" for form ${index}`);
                        handleLocalitySearch(t, index);
                      }}
                      visible={form.showSuggestions}
                      list={form.localityList}
                      onSelect={(item) => {
                        console.log(`🔍 Locality selected for form ${index}:`, item);
                        handleSuggestionSelect({
                          locality_name: item.locality_name || item.name,
                          pincode: item.pincode || item.pincode_value,
                          _id: item._id || item.locality_id,
                          locality_id: item.locality_id || item._id,
                          district_id: item.district_id
                        }, index);
                      }}
                      onClose={() => handleCloseSuggestions(index)}
                      showLocality={true}
                    />

                    <SearchDropdown
                      placeholder="Search pincode"
                      value={form.pincode}
                      searchValue={searchPincodeText}
                      onChangeText={(text) => {
                        handlePincodeSearchGlobal(text);
                        // ✅ If pincode search is cleared, clear locality as well
                        if (text.trim() === "") {
                          setLocalityForms(prev => prev.map((f, idx) =>
                            idx === index ? {
                              ...f,
                              pincode: "",
                              locality: "",
                              locality_id: "",
                              searchText: "",
                              localityList: [],
                              isEmpty: true,
                            } : f
                          ));
                          // ✅ Clear ref as well
                          delete selectedLocalitiesRef.current[index];
                        }
                      }}
                      visible={showPincodeSuggestionsGlobal}
                      list={pincodeListGlobal}
                      onSelect={(item) => {
                        console.log(`🔍 Pincode selected for form ${index}:`, item);
                        handlePincodeSelect(item, index);
                      }}
                      onClose={handleClosePincodeSuggestions}
                      showLocality={true}
                    />

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

                    <TouchableOpacity
                      style={styles.addLocalityButton}
                      onPress={() => setShowModal(true)}
                    >
                      <Text style={styles.addLocalitySymbol}>+</Text>
                      <Text style={styles.addLocalityText}>Add Your Locality / Pincode</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <CustomDropdown
                      placeholder="Select State"
                      data={stateOptions}
                      selectedValue={form.state}
                      onSelect={(item: any) => handleStateSelect(item, index)}
                      containerStyle={{ marginBottom: 8 }}
                    />

                    <CustomDropdown
                      placeholder="Select District"
                      data={form.districtOptions || []}
                      selectedValue={form.district}
                      onSelect={(item: any) => handleDistrictSelect(item.value, index)}
                      containerStyle={{ marginBottom: 8 }}
                    />

                    <CustomDropdown
                      placeholder="Select Pincode (optional)"
                      data={(form.pincodeOptions || []).map((p: any) => ({
                        label: p.pincode + (p.locality_name ? ` - ${p.locality_name}` : ""),
                        value: p.pincode,
                        _id: p._id,
                        locality_id: p.locality_id
                      }))}
                      selectedValue={form.pincode}
                      onSelect={(item: any) => {
                        const selectedOption = (form.pincodeOptions || []).find(p => p.pincode === item.value);
                        handlePincodeSelect({
                          pincode: item.value,
                          locality_name: selectedOption?.locality_name || "",
                          locality_id: selectedOption?.locality_id || selectedOption?._id,
                          _id: selectedOption?._id
                        }, index);
                      }}
                      containerStyle={{ marginBottom: 12 }}
                    />

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

                    {form.searchType === "pincode" &&
                      <TouchableOpacity
                        style={styles.addLocalityButton}
                        onPress={() => setShowModal(true)}
                      >
                        <Text style={styles.addLocalitySymbol}>+</Text>
                        <Text style={styles.addLocalityText}>Add Your Locality / Pincode</Text>
                      </TouchableOpacity>}
                  </>
                )}
              </View>
            ))
          }

          {backScreen !== 'SetBusinessProfile' && localityForms.length < 5 && (
            <TouchableOpacity
              style={styles.addSecondLocality}
              onPress={handleAddNewLocalityForm}
            >
              <Text style={styles.addSecondLocalitySymbol}>+</Text>
              <Text style={styles.addSecondLocalityText}>
                Add Your {localityForms.length + 1}{getOrdinalSuffix(localityForms.length + 1)} Preferred Locality
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <AddAddressModal visible={showModal} onClose={() => setShowModal(false)} />
    </AuthContainer>
  );
};

export default ManualLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingBottom: 20,
  },
  locationDeducted: {
    ...Typography.black14Bold,
    color: Colors.secondaryText,
    marginBottom: 20,
  },
  ghostContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
    marginBottom: 20,
  },
  ghostContent: {
    flexDirection: "row",
    flex: 1,
  },
  ghostIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginRight: 10,
  },
  ghostTextContainer: {
    flex: 1,
  },
  ghostTitle: {
    ...Typography.black16Medium,
    color: Colors.primaryText,
  },
  ghostSubtitle: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  autoDetectedContainer: {
    marginBottom: 20,
  },
  pincodeCard: {
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  pincodeLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pinIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginRight: 10,
  },
  pincodeTitle: {
    ...Typography.black13Regular,
    color: Colors.primaryText,
  },
  pincodeValue: {
    ...Typography.black14Bold,
    color: Colors.primaryText,
    marginTop: 2,
  },
  localityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    ...Typography.black13Regular,
    color: Colors.secondaryText,
  },
  mapBackground: {
    width: "100%",
    height: 113,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  locateOnMapBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  gpsIcon: {
    height: 16,
    width: 16,
    resizeMode: "contain",
    marginRight: 8,
    tintColor: Colors.primary,
  },
  locateText: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },
  addLocalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addLocalitySymbol: {
    ...Typography.black20Regular,
    color: Colors.secondary,
    marginRight: 4,
  },
  addLocalityText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
  addSecondLocality: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  addSecondLocalitySymbol: {
    ...Typography.black18Bold,
    color: Colors.secondary,
    marginRight: 8,
  },
  addSecondLocalityText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
});