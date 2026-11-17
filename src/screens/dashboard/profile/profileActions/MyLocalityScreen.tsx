import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import {
  SearchDropdown,
  CustomDropdown,
  InputField,
  ViewContainer,
  CustomButton,
  CommonModal,
} from "../../../../components";
import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";
import { Icons } from "../../../../assets/icons";
import { Images } from "../../../../assets/images";

import {
  getStateCity,
  addLocality,
  deleteLocality,
} from "../../../../redux/slices/authSlice";
import {
  fetchBusinessUserProfile,
  fetchPublicUserProfile,
} from "../../../../redux/slices/profileSlice";
import { RootState } from "../../../../redux/store";
import { cleanObject, formatAddress } from "../../../../utils/helper";

type LocalityForm = {
  id?: string;
  searchType: "pincode" | "state";
  searchText: string;
  showSuggestions: boolean;
  localityList: any[];
  pincodeList: any[];
  stateOptions: any[];
  districtOptions: any[];
  pincode: string;
  locality_name: string;
  state: string;
  district: string;
};

const MAX_PREFS = 5;

const emptyForm = (): LocalityForm => ({
  searchType: "pincode",
  searchText: "",
  showSuggestions: false,
  localityList: [],
  pincodeList: [],
  stateOptions: [],
  districtOptions: [],
  pincode: "",
  locality_name: "",
  state: "",
  district: "",
});

const MyLocalityScreen: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();

  const { user } = useSelector((s: RootState) => s.auth);
  const { userProfile } = useSelector((s: RootState) => s.profile);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteItem, setToDeleteItem] = useState<any | null>(null);
  const [showForms, setShowForms] = useState(false);
  const [forms, setForms] = useState<LocalityForm[]>([emptyForm()]);

  // ✅ Refs for debouncing
  const localitySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pincodeSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStateOptions();

    // ✅ Cleanup timeouts on unmount
    return () => {
      if (localitySearchTimeoutRef.current) {
        clearTimeout(localitySearchTimeoutRef.current);
      }
      if (pincodeSearchTimeoutRef.current) {
        clearTimeout(pincodeSearchTimeoutRef.current);
      }
    };
  }, []);

  const loadStateOptions = async () => {
    try {
      const res: any = await dispatch(getStateCity({ type: "state" })).unwrap();
      const opts = (res || []).map((s: any) => ({
        label: s.state_name,
        value: s.state_id || s._id || s.state_name
      }));
      setForms(prev => prev.map(f => ({ ...f, stateOptions: opts })));
    } catch (err) {
      console.log("loadStateOptions err", err);
    }
  };

  const loadDistrictOptions = async (formIndex: number, stateId?: string) => {
    try {
      const res: any = await dispatch(getStateCity({ type: "district" })).unwrap();
      const opts = (res || []).map((d: any) => ({
        label: d.district_name,
        value: d.district_id || d._id || d.district_name
      }));
      setForms(prev => {
        const copy = [...prev];
        copy[formIndex] = { ...copy[formIndex], districtOptions: opts };
        return copy;
      });
    } catch (err) {
      console.log("loadDistrictOptions err", err);
      setForms(prev => {
        const copy = [...prev];
        copy[formIndex] = { ...copy[formIndex], districtOptions: [] };
        return copy;
      });
    }
  };

  // ✅ Debounced locality search
  const handleLocalitySearch = useCallback((text: string, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = { ...copy[formIndex], searchText: text };
      if (!text || text.length < 2) {
        copy[formIndex].showSuggestions = false;
        copy[formIndex].localityList = [];
      }
      return copy;
    });

    if (!text || text.length < 2) return;

    // Clear previous timeout
    if (localitySearchTimeoutRef.current) {
      clearTimeout(localitySearchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    localitySearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res: any = await dispatch(getStateCity({ type: "locality", search: text })).unwrap();
        setForms(prev => {
          const copy = [...prev];
          copy[formIndex] = {
            ...copy[formIndex],
            localityList: res || [],
            showSuggestions: (res || []).length > 0
          };
          return copy;
        });
      } catch (err) {
        console.log("locality search error", err);
        setForms(prev => {
          const copy = [...prev];
          copy[formIndex] = {
            ...copy[formIndex],
            localityList: [],
            showSuggestions: false
          };
          return copy;
        });
      }
    }, 300); // 300ms debounce
  }, [dispatch]);

  // ✅ Debounced pincode search
  const handlePincodeSearch = useCallback((text: string, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = { ...copy[formIndex], searchText: text };
      if (!text || text.length < 2) {
        copy[formIndex].showSuggestions = false;
        copy[formIndex].pincodeList = [];
      }
      return copy;
    });

    if (!text || text.length < 2) return;

    // Clear previous timeout
    if (pincodeSearchTimeoutRef.current) {
      clearTimeout(pincodeSearchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    pincodeSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res: any = await dispatch(getStateCity({ type: "pincode", search: text })).unwrap();
        const mapped = (res || []).map((i: any) => ({ ...i }));
        setForms(prev => {
          const copy = [...prev];
          copy[formIndex] = {
            ...copy[formIndex],
            pincodeList: mapped,
            showSuggestions: mapped.length > 0
          };
          return copy;
        });
      } catch (err) {
        console.log("pincode search error", err);
        setForms(prev => {
          const copy = [...prev];
          copy[formIndex] = {
            ...copy[formIndex],
            pincodeList: [],
            showSuggestions: false
          };
          return copy;
        });
      }
    }, 300); // 300ms debounce
  }, [dispatch]);

  const onSelectLocality = (item: any, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = {
        ...copy[formIndex],
        locality_name: item.locality_name || item.name || "",
        pincode: item.pincode || item.zip || "",
        state: item.state || copy[formIndex].state,
        district: item.district || copy[formIndex].district,
        showSuggestions: false,
        searchText: "",
        localityList: [], // ✅ Clear the list
      };
      return copy;
    });
  };

  const onSelectPincode = (item: any, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = {
        ...copy[formIndex],
        pincode: item.pincode || item.zip || "", // ✅ Fixed: Use zip as fallback
        locality_name: item.locality_name || copy[formIndex].locality_name || "",
        showSuggestions: false,
        searchText: "",
        pincodeList: [], // ✅ Clear the list
      };
      return copy;
    });
  };

  const onSelectState = (value: any, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = {
        ...copy[formIndex],
        state: value,
        district: "",
        pincode: "",
        districtOptions: [] // ✅ Clear district options while loading
      };
      return copy;
    });
    loadDistrictOptions(formIndex, value);
  };

  const onSelectDistrict = (value: any, formIndex: number) => {
    setForms(prev => {
      const copy = [...prev];
      copy[formIndex] = { ...copy[formIndex], district: value, pincode: "" };
      return copy;
    });
  };

  const addForm = () => {
    if (!showForms) {
      setShowForms(true);
      return;
    }

    setForms(prev => {
      if (prev.length >= MAX_PREFS) {
        Alert.alert("Limit reached", `You can add up to ${MAX_PREFS} preferred localities.`);
        return prev;
      }
      return [...prev, { ...emptyForm(), stateOptions: prev[0]?.stateOptions || [] }];
    });
  };

  const removeForm = (index: number) => {
    setForms(prev => {
      if (prev.length === 1) {
        setShowForms(false);
        return [emptyForm()];
      }
      const copy = prev.filter((_, i) => i !== index);
      return copy;
    });
  };

  const handleSaveForm = async (formIndex: number) => {
    const f = forms[formIndex];

    if (f.searchType === "pincode") {
      if (!f.pincode || !f.locality_name) {
        return Alert.alert("Incomplete", "Please select a locality and pincode.");
      }
    } else {
      if (!f.state || !f.district) {
        return Alert.alert("Incomplete", "Please select state and district.");
      }
    }

    const payloadItem: any = {
      pincode: f.pincode,
      locality_name: f.locality_name,
      state: f.state || "",
      district: f.district || "",
      is_default: false,
    };

    const cleaned = cleanObject
      ? cleanObject(payloadItem)
      : Object.fromEntries(
        Object.entries(payloadItem).filter(([k, v]) => v !== "" && v !== null && v !== undefined)
      );

    try {
      await dispatch(addLocality([cleaned])).unwrap();

      if (user?.user_type === "business") {
        dispatch(fetchBusinessUserProfile());
      } else {
        dispatch(fetchPublicUserProfile());
      }

      Alert.alert("Success", "Locality added.");

      setForms(prev => {
        const copy = [...prev];
        copy[formIndex] = { ...emptyForm(), stateOptions: prev[0]?.stateOptions || [] };
        return copy;
      });
    } catch (err: any) {
      console.log("addLocality err", err);
      Alert.alert("Error", err?.message || "Failed to add locality");
    }
  };

  const handleSaveAll = async () => {
    const validForms = forms.filter(f => {
      if (f.searchType === "pincode") {
        return f.pincode && f.locality_name;
      } else {
        return f.state && f.district;
      }
    });

    if (validForms.length === 0) {
      return Alert.alert("No Data", "Please fill at least one form.");
    }

    try {
      const payloads = validForms.map(f => {
        const payload: any = {
          pincode: f.pincode,
          locality_name: f.locality_name,
          state: f.state || "",
          district: f.district || "",
          is_default: false,
        };
        return cleanObject ? cleanObject(payload) : payload;
      });

      await dispatch(addLocality(payloads)).unwrap();

      if (user?.user_type === "business") {
        dispatch(fetchBusinessUserProfile());
      } else {
        dispatch(fetchPublicUserProfile());
      }

      Alert.alert("Success", `${validForms.length} localit${validForms.length > 1 ? 'ies' : 'y'} added.`);

      setForms([{ ...emptyForm(), stateOptions: forms[0]?.stateOptions || [] }]);
      setShowForms(false);
    } catch (err: any) {
      console.log("addLocality err", err);
      Alert.alert("Error", err?.message || "Failed to add localities");
    }
  };

  const handleDeleteConfirmed = async () => {
    console.log('presssss>>>>>>');
    console.log('toDeleteItem?._id>>>>>', toDeleteItem);

    if (!toDeleteItem?._id) {
      setShowDeleteModal(false);
      return;
    }
    try {
      const res = await dispatch(deleteLocality(toDeleteItem._id)).unwrap();
      console.log('resData>>>>', res);


      if (user?.user_type === "business") {
        dispatch(fetchBusinessUserProfile());
      } else {
        dispatch(fetchPublicUserProfile());
      }

      setShowDeleteModal(false);
      setToDeleteItem(null);
    } catch (err) {
      console.log("deleteLocality err", err);
      Alert.alert("Error", err);
    }
  };

  const renderAddress = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.wrapper} key={item?.id || index}>
        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Image source={Icons.greenMap} style={styles.locationIcon} />
            <View style={styles.textWrap}>
              <Text style={[Typography.black12Medium, { color: "#383838" }]}>
                Pincode {index + 1}
              </Text>
              <Text style={[Typography.black14Bold, styles.addressText]}>
                {formatAddress(item)}
              </Text>
            </View>
          </View>

          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditLocalityScreen", { item })}
            >
              <Image source={Icons.editIcon} style={styles.editIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setToDeleteItem(item);
                setShowDeleteModal(true);
              }}
            >
              <Image source={Icons.trashIcon} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <Image source={Images.radomMap} style={styles.mapImage} />
      </View>
    );
  };

  const FormCard: React.FC<{ form: LocalityForm; idx: number }> = ({ form, idx }) => {
    return (
      <View style={styles.addCard}>
        <View style={styles.formHeader}>
          <Text style={[Typography.black14Medium, { color: Colors.secondaryText }]}>
            Select Your Locality By giving
          </Text>
          {forms.length > 1 && (
            <TouchableOpacity onPress={() => removeForm(idx)}>
              <Image
                source={Icons.cross}
                style={{ height: 20, width: 20, objectFit: 'contain' }}
                tintColor={Colors.error}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity
            onPress={() => setForms(prev => {
              const c = [...prev];
              c[idx] = { ...c[idx], searchType: "pincode" }; // ✅ Preserve other form data
              return c;
            })}
            style={styles.radioRow}
          >
            <View style={[
              styles.radioCircle,
              { borderColor: form.searchType === "pincode" ? Colors.primary : Colors.border }
            ]}>
              {form.searchType === "pincode" && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioLabel}>Pincode or locality</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setForms(prev => {
                const c = [...prev];
                c[idx] = { ...c[idx], searchType: "state" }; // ✅ Preserve other form data
                return c;
              });
              loadDistrictOptions(idx);
            }}
            style={styles.radioRow}
          >
            <View style={[
              styles.radioCircle,
              { borderColor: form.searchType === "state" ? Colors.primary : Colors.border }
            ]}>
              {form.searchType === "state" && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioLabel}>Select State & District</Text>
          </TouchableOpacity>
        </View>

        {form.searchType === "pincode" ? (
          <>
            <SearchDropdown
              placeholder="Search locality or pincode"
              value={form.locality_name}
              searchValue={form.searchText}
              onChangeText={(t) => handleLocalitySearch(t, idx)}
              visible={form.showSuggestions && form.localityList.length > 0}
              list={form.localityList}
              onSelect={(item) => onSelectLocality(item, idx)}
              onClose={() => setForms(prev => {
                const c = [...prev];
                c[idx] = { ...c[idx], showSuggestions: false, localityList: [] };
                return c;
              })}
              showLocality
              containerStyle={{ marginBottom: 8 }}
            />

            <SearchDropdown
              placeholder="Search pincode"
              value={form.pincode}
              searchValue={form.searchText}
              onChangeText={(t) => handlePincodeSearch(t, idx)}
              visible={form.showSuggestions && form.pincodeList.length > 0}
              list={form.pincodeList}
              onSelect={(item) => onSelectPincode(item, idx)}
              onClose={() => setForms(prev => {
                const c = [...prev];
                c[idx] = { ...c[idx], pincodeList: [], showSuggestions: false };
                return c;
              })}
              showLocality
              containerStyle={{ marginBottom: 0 }}
            />
          </>
        ) : (
          <>
            <CustomDropdown
              placeholder="Select state"
              data={form.stateOptions}
              selectedValue={form.state}
              onSelect={(v) => onSelectState(v, idx)}
              containerStyle={{ marginBottom: 8 }}
            />

            <CustomDropdown
              placeholder="Select district"
              data={form.districtOptions}
              selectedValue={form.district}
              onSelect={(v) => onSelectDistrict(v, idx)}
              containerStyle={{ marginBottom: 8 }}
            />

            <InputField
              placeholder="Enter pincode or locality"
              value={form.pincode}
              onChangeText={(v) => setForms(prev => {
                const c = [...prev];
                c[idx] = { ...c[idx], pincode: v };
                return c;
              })}
              containerStyle={{ marginBottom: 0 }}
            />
          </>
        )}

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
    );
  };

  const addressCount = userProfile?.addresses?.length || 0;

  return (
    <ViewContainer
      headerTitle="My Localities"
      containerStyle={{ paddingHorizontal: 0, paddingBottom: showForms ? '28%' : 0 }}
      bottomFixedComponent={
        showForms ? (
          <CustomButton
            title="Save"
            onPress={handleSaveAll}
          />
        ) : null
      }
    >
      <View style={styles.container}>
        {addressCount > 0 && (
          <Text style={styles.sectionTitle}>LOCATION DEDUCTED</Text>
        )}

        {addressCount === 0 && !showForms ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No address added yet</Text>

            <TouchableOpacity style={styles.addButton} onPress={addForm}>
              <Text style={styles.addLocalitySymbol}>+</Text>
              <Text style={styles.addLocalityText}>Add Your First Locality</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {addressCount > 0 && (
          <FlatList
            data={userProfile?.addresses || []}
            keyExtractor={(item, i) => item.id || item._id || String(i)}
            renderItem={renderAddress}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListFooterComponent={
              !showForms && addressCount < MAX_PREFS ? (
                <TouchableOpacity style={styles.addButtonSmall} onPress={addForm}>
                  <Text style={styles.addLocalitySymbol}>+</Text>
                  <Text style={styles.addLocalityText}>
                    Add Your {addressCount + 1}ᵗʰ Preferred Locality
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}

        {showForms && (
          <View style={{ marginTop: 12 }}>
            {forms.map((f, i) => (
              <FormCard key={i} form={f} idx={i} />
            ))}

            {forms.length < MAX_PREFS && (
              <TouchableOpacity style={styles.addButtonSmall} onPress={addForm}>
                <Text style={styles.addLocalitySymbol}>+</Text>
                <Text style={styles.addLocalityText}>
                  Add Your {addressCount + forms.length + 1}ᵗʰ Preferred Locality
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <CommonModal
        visible={showDeleteModal}
        title="Are you sure you want to delete this address?"
        image={Images.delete}
        btnRow
        btnRowTitle1="Delete"
        btnRowTitle2="Cancel"
        imgStyle={{
          height: 130,
          width: 140,
          objectFit: "contain",
          marginBottom: 16,
          alignSelf: "center"
        }}
        onConfirm={() => {
          setShowDeleteModal(false);
          setToDeleteItem(null);
        }}
        onClose={handleDeleteConfirmed}
      />
    </ViewContainer>
  );
};

export default MyLocalityScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightBg,
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 12,
  },
  sectionTitle: {
    ...Typography.black14Bold,
    color: Colors.secondaryText,
    marginVertical: 8,
  },
  wrapper: { marginBottom: 20 },
  card: {
    backgroundColor: "#FFE8E2",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  leftRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  textWrap: { flex: 1, flexShrink: 1 },
  addressText: {
    marginTop: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  locationIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginTop: 4,
  },
  rightIcons: {
    flexDirection: "row",
    marginLeft: 12,
  },
  editIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
    marginRight: 14
  },
  deleteIcon: { width: 22, height: 22 },
  mapImage: {
    width: 355,
    height: 250,
    objectFit: 'contain',
    marginTop: 12,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 36
  },
  emptyText: {
    ...Typography.black16Bold,
    color: Colors.secondaryText,
    marginBottom: 12
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFF0",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFF0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  addLocalitySymbol: {
    ...Typography.black20Regular,
    color: Colors.secondary,
    marginRight: 8,
  },
  addLocalityText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
  addCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: Spacing.modalBorderRadius,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  radioDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary
  },
  radioLabel: {
    ...Typography.black13Regular,
    color: Colors.secondaryText
  },
  mapBackground: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12
  },
  locateOnMapBtn: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: "center"
  },
  gpsIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.primary
  },
  locateText: {
    ...Typography.black14Bold,
    color: Colors.primary
  },
});