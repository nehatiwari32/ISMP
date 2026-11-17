import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { getStateCity } from "../../redux/slices/authSlice";
import { Colors } from "../../theme/colors";
import { Icons } from "../../assets/icons";
import { Spacing, Typography } from "../../theme/typography";
import { changePostType, setLocality } from "../../redux/slices/postSlice";

interface Props {
  visible: boolean;
  selectedId?: string | null;
  onSelect: (item: {
    id: string | null;
    label: string;
    type: "pincode" | "district" | "global";
  }) => void;
}

const HomePincodeSelection = ({ selectedId, onSelect }: Props) => {
  const dispatch = useDispatch();

  const { userProfile } = useSelector((state: any) => state.profile);

  /* 🔹 SEARCH RESULT (DROPDOWN) */
  const [searchResults, setSearchResults] = useState<any[]>([]);

  /* 🔹 UI */
  const [expandLocality, setExpandLocality] = useState(false);
  const [expandDistrict, setExpandDistrict] = useState(false);

  /* 🔹 SEARCH TEXT */
  const [localitySearch, setLocalitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");



  /* 🔹 LOCALITY / PINCODE SEARCH */
  useEffect(() => {
    if (localitySearch.length < 2) {
      setSearchResults([]);
      return;
    }

    dispatch(getStateCity({ type: "locality", search: localitySearch }))
      .unwrap()
      .then((res) => setSearchResults(res || []));
  }, [localitySearch]);

  /* 🔹 DISTRICT SEARCH */
  useEffect(() => {
    if (districtSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    dispatch(getStateCity({ type: "district", search: districtSearch }))
      .unwrap()
      .then((res) => setSearchResults(res || []));
  }, [districtSearch]);

  /* 🔹 ITEM RENDER */
  const renderMainItem = ({ item }: any) => {
    const label =
      item.locality_name ||
      item.district_name ||
      item.city_name ||
      item.state_name;

    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          dispatch(changePostType("pincode"));
          dispatch(setLocality({ id: item?._id, label }))
          onSelect({
            id: item._id,
            label,
            type: "pincode",
          });
        }}
      >
        <Image source={Icons.localityIcon} style={styles.icon} />
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    );
  };

  const renderSearchItem = ({ item }: any) => {
    const isDistrict = !!item.district_name;

    const label = isDistrict
      ? item.district_name
      : `${item.locality_name} ${item.pincode}`;

    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          const type = isDistrict ? "district" : "pincode";
          dispatch(changePostType(type));
          dispatch(setLocality({ id: isDistrict ? item?.district_id : item?._id, label }))
          onSelect({
            id: isDistrict ? item?.district_id : item?._id,
            label,
            type,
          });

          // 🔥 close search dropdown only
          setSearchResults([]);
          setLocalitySearch("");
          setDistrictSearch("");
        }}
      >
        <Image
          source={isDistrict ? Icons.location : Icons.localityIcon}
          style={styles.icon}
        />
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>

      {/* 🔹 GLOBAL OPTION (only if something selected) */}
      {selectedId && (
        <Pressable
          style={styles.row}
          onPress={() => {
            dispatch(changePostType("global"));
            onSelect({
              id: null,
              label: "Global",
              type: "global",
            });
          }}
        >
          <Image source={Icons.globalHome} style={styles.icon} />
          <Text style={styles.text}>Global</Text>
        </Pressable>
      )}

      {/* 🔹 MAIN SCROLLABLE LIST */}
      {userProfile?.addresses?.length > 0 &&
        <View style={styles.scrollContainer}>
          <FlatList
            data={userProfile?.addresses}
            keyExtractor={(item) => item._id}
            renderItem={renderMainItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>}

      {/* 🔹 OTHER LOCALITIES */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => {
          setExpandLocality((p) => !p);
          setExpandDistrict(false);
        }}
      >
        <Image source={Icons.localityIcon} style={styles.icon} />
        <Text style={styles.sectionText}>Other Localities</Text>
        <Image source={Icons.fillArrow} style={styles.arrow} />
      </Pressable>

      {expandLocality && (
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search locality or pincode"
              value={localitySearch}
              onChangeText={setLocalitySearch}
              style={styles.input}
            />
            <Image source={Icons.search} style={styles.searchIcon} />
          </View>

          {/* 🔹 SEARCH DROPDOWN */}
          {searchResults.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={renderSearchItem}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      )}

      {/* 🔹 OTHER DISTRICT */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => {
          setExpandDistrict((p) => !p);
          setExpandLocality(false);
        }}
      >
        <Image source={Icons.location} style={styles.icon} />
        <Text style={styles.sectionText}>Other District</Text>
        <Image source={Icons.fillArrow} style={styles.arrow} />
      </Pressable>

      {expandDistrict && (
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search district"
              value={districtSearch}
              onChangeText={setDistrictSearch}
              style={styles.input}
            />
            <Image source={Icons.search} style={styles.searchIcon} />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={renderSearchItem}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default HomePincodeSelection;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border10,
    minWidth: 240,
  },
  scrollContainer: {
    maxHeight: 260, // 🔥 whole dropdown scroll area
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  text: {
    ...Typography.black13Medium,
    color: Colors.secondaryText,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: Colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  sectionText: {
    ...Typography.black13Medium,
    flex: 1,
    color: Colors.secondaryText,
  },
  arrow: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    tintColor: Colors.primary,
  },
  searchWrapper: {
    marginHorizontal: 16,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
    tintColor: "#BBBABD",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    maxHeight: 180,
  },
});

