import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  View,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";

import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { CustomCheckbox } from "../common";
import { useNavigation } from "@react-navigation/native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: any) => void;
  defaultValue?: any;
  showFrndOptions?: boolean;
}

const FRIEND_OPTIONS = [
  { label: "All Friends", value: "all_friends" },
  { label: "Specific Friends", value: "specific_friends" },
  { label: "Friends Except", value: "except_friends" }
];

const LocationDropdown: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
  defaultValue = {
    isGlobal: true,
    localities: ["global"],
    visible_to: null
  },
  showFrndOptions = true
}) => {

  const { userProfile } = useSelector((state: any) => state.profile);

  const listData = userProfile?.addresses ?? []

  const [selected, setSelected] = useState<any>(defaultValue);
  const [showFriendsOptions, setShowFriendsOptions] = useState(false);

  // ⭐ Checkbox only ON when radio selected
  const [friendsChecked, setFriendsChecked] = useState(
    defaultValue?.visible_to !== null
  );

  const navigation = useNavigation();

  // ⭐ Sync parent default
  useEffect(() => {
    setSelected(defaultValue);
    setFriendsChecked(defaultValue?.visible_to !== null);
  }, [defaultValue]);


  const isGlobalSelected = () => selected.isGlobal === true;

  const isStateSelected = (stateId: string) =>
    selected.localities?.includes(stateId);

  const isFriendSelected = (value: string) =>
    selected.visible_to === value;

  // ---------- GLOBAL ----------
  const selectGlobal = () => {
    const temp = {
      isGlobal: true,
      localities: ["global"],
      visible_to: null,
      friend_ids: []
    };
    setSelected(temp);
    setFriendsChecked(false);
    onSelect(temp);
  };

  // ---------- ALL ----------
  const selectAll = () => {
    const temp = {
      isGlobal: true,
      localities: ["all"],
      visible_to: null,
      friend_ids: []
    };
    setSelected(temp);
    setFriendsChecked(false);
    onSelect(temp);
  };

  // ---------- STATES ----------
  const toggleState = (item: any) => {
    const isDistrict = !!item.district_name;
    const type = isDistrict ? "district" : "pincode";

    const stateId = item._id || item?.district_id || item?.locality_id;

    if (!stateId) return;

    let localities = [...(selected.localities || [])];
    localities = localities.filter(id => id !== "global" && id !== "all");

    if (localities.includes(stateId)) {
      localities = localities.filter(id => id !== stateId);
    } else {
      localities.push(stateId);
    }

    if (localities.length === 0) {
      selectGlobal();
      return;
    }

    const temp = {
      isGlobal: false,
      localities,
      visible_to: selected.visible_to,
    };

    setSelected(temp);
    onSelect(temp);
  };

  if (!visible) return null;

  return (
    <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
      <ScrollView style={styles.scrollView} nestedScrollEnabled>

        {/* ---------------- GLOBAL ---------------- */}
        <TouchableOpacity style={styles.row} onPress={selectGlobal}>
          <CustomCheckbox checked={isGlobalSelected() && selected.localities?.includes("global")} onPress={selectGlobal} />
          <Text style={styles.item}>Global</Text>
        </TouchableOpacity>

        {/* ---------------- LOCALITIES ---------------- */}
        {listData.map((item: any) => {

          const id = item?._id || item?.district_id
          const label = item?.locality_name || item?.district_name || ''

          return (
            <TouchableOpacity
              key={id}
              style={styles.row}
              onPress={() => toggleState(item)}
            >
              <CustomCheckbox checked={isStateSelected(id)} onPress={() => toggleState(item)} />
              <Text style={styles.item}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* ---------------- FRIENDS ---------------- */}
        {showFrndOptions && (
          <TouchableOpacity
            style={[styles.row, { justifyContent: "space-between" }]}
            onPress={() => {

              // ⭐ Only allow UNCHECK
              if (friendsChecked) {
                setFriendsChecked(false);
                const temp = {
                  ...selected,
                  visible_to: null,
                  friend_ids: []
                };

                setSelected(temp);
                onSelect(temp);
              }

              setShowFriendsOptions(true);
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CustomCheckbox checked={friendsChecked} onPress={() => {
                if (friendsChecked) {
                  setFriendsChecked(false);
                  const temp = {
                    ...selected,
                    visible_to: null,
                    friend_ids: []
                  };

                  setSelected(temp);
                  onSelect(temp);
                }
                setShowFriendsOptions(true);
              }} />
              <Text style={styles.item}>Friends</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ---------------- FRIEND RADIO ---------------- */}
        {showFriendsOptions && FRIEND_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={styles.subRow}
            onPress={() => {

              // ⭐ Radio click → Checkbox ON
              setFriendsChecked(true);

              const temp = {
                ...selected,
                visible_to: f.value,
              };

              setSelected(temp);
              onSelect(temp);

              if (
                f.value === "specific_friends" ||
                f.value === "except_friends"
              ) {
                onClose();

                setTimeout(() => {
                  navigation.navigate("FriendPicker", {
                    title: f.label,
                    selectedList: selected.friend_ids || [],
                    onSave: (ids: string[]) => {

                      const updated = {
                        ...selected,
                        visible_to: f.value,
                        friend_ids: ids,
                      };

                      setSelected(updated);
                      onSelect(updated);
                    },
                  });
                }, 150);
              }
            }}
          >
            <View
              style={[
                styles.radioOuter,
                isFriendSelected(f.value) && styles.radioOuterActive,
              ]}
            >
              {isFriendSelected(f.value) && (
                <View style={styles.radioInner} />
              )}
            </View>

            <Text style={styles.subItem}>{f.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ backgroundColor: Colors.border, marginHorizontal: 20 }} />
        <TouchableOpacity style={styles.row} onPress={selectAll}>
          <CustomCheckbox checked={isGlobalSelected() && selected.localities?.includes("all")} onPress={selectAll} />
          <Text style={styles.item}>All</Text>
        </TouchableOpacity>

      </ScrollView>
    </Pressable>
  );
};


export default LocationDropdown;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    right: 10,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 9999,
  },
  dropdown: {
    width: 260,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: Colors.border10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  scrollView: {
    maxHeight: 400,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  item: {
    ...Typography.black13Medium,
    marginLeft: 14,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  subItem: {
    ...Typography.black13Medium,
    marginLeft: 10,
  },
  radioOuter: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});