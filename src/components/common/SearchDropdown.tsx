import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import InputField from "./InputField";
import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

export interface SearchDropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  searchValue: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  list: Array<{ _id: string; name: string }>;
  onSelect: (item: any) => void;
  onClose: () => void;
  showLocality?: boolean;
  containerStyle?: any;
  isBold?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  placeholder,
  value,
  searchValue,
  onChangeText,
  visible,
  list,
  onSelect,
  onClose,
  showLocality,
  containerStyle,
  isBold = false
}) => {
  return (
    <View style={{ position: "relative" }}>
      <InputField
        label={label}
        placeholder={placeholder}
        value={searchValue || value}
        onChangeText={onChangeText}
        rightComponent={<Image source={Icons.search} style={styles.icon} />}
        containerStyle={containerStyle}
        isBold={isBold}
      />

      {visible && (
        <View style={[styles.dropdown, { top: showLocality ? 60 : 80, }]}>
          {list.length > 0 ? (
            <FlatList
              data={list}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      showLocality && styles.itemWithLocality
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    {showLocality ? (
                      // Locality View with Icon
                      <View style={styles.localityContainer}>
                        <Image
                          source={Icons.primaryLocality}
                          style={styles.locationIcon}
                        />
                        {item?.locality_name ?
                          <View style={styles.textContainer}>
                            <Text style={styles.itemTextBold}>{item?.locality_name}</Text>
                            <Text style={styles.itemSubtext}>
                              {item?.pincode}
                            </Text>
                          </View>

                          :
                          <Text style={styles.itemTextBold}>{item?.pincode}</Text>
                        }
                      </View>
                    ) : (
                      // Default Simple View
                      <Text style={styles.itemText}>{item.name}</Text>
                    )}
                  </TouchableOpacity>
                )
              }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResult}>
              <Text style={styles.noResultText}>No results found</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SearchDropdown;

const styles = StyleSheet.create({
  icon: { width: 15, height: 15, tintColor: Colors.secondaryText },
  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 100,
    overflow: "hidden",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemWithLocality: {
    paddingVertical: 14,
    backgroundColor: '#FFF',
  },
  itemText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
  itemTextBold: {
    ...Typography.black14Bold,
    color: Colors.primaryTextDark,
    marginBottom: 2,
  },
  itemSubtext: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
  },
  localityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 24,
    height: 24,
    objectFit: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  noResult: {
    padding: 16,
    alignItems: "center",
  },
  noResultText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
  },
});
