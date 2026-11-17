import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import { Colors } from "../../theme/colors";
import { scaleFont } from "../../utils/helper";
import { Icons } from "../../assets/icons";
import CustomCheckbox from "./CustomCheckbox";
import { Typography } from "../../theme/typography";

interface DropdownItem {
  id?: string | number; // ✅ made optional
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  data: DropdownItem[];
  selectedValue?: string | number | (string | number)[];
  onSelect: (item: DropdownItem | DropdownItem[]) => void;
  searchable?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  dropdownStyle?: any;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  showAddNew?: boolean;
  onAddNew?: () => void;
  expanded?: boolean;
  setExpanded?: (value: boolean) => void;
  badgeComponent?: React.ReactNode;
  isLeftIcon?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder = "Select an option",
  data = [],
  selectedValue,
  onSelect,
  searchable = false,
  containerStyle,
  inputStyle,
  dropdownStyle,
  error,
  disabled = false,
  multiple = false,
  showAddNew = false,
  onAddNew,
  expanded,
  badgeComponent,
  setExpanded,
  isLeftIcon
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isOpen = expanded ?? internalExpanded;
  const setIsOpen = setExpanded ?? (() => { });


  const toggleDropdown = () => {
    const newState = !isOpen;
    setInternalExpanded(newState);
    setIsOpen(!isOpen);
  };

  const isSelected = (val: string | number) =>
    Array.isArray(selectedValue)
      ? selectedValue.includes(val)
      : selectedValue === val;

  const handleSelect = (item: DropdownItem) => {
    if (multiple) {
      let updated: (string | number)[] = Array.isArray(selectedValue)
        ? [...selectedValue]
        : [];

      if (updated.includes(item.value)) {
        updated = updated.filter((v) => v !== item.value);
      } else {
        updated.push(item.value);
      }

      const selectedItems = data?.filter((d) => updated.includes(d.value));
      onSelect(selectedItems);
    } else {
      onSelect(item);
      setInternalExpanded(false);
      setExpanded?.(false);
    }
  };

  // ✅ Handle selected text
  const selectedLabels = Array.isArray(selectedValue)
    ? data
      .filter((item) => selectedValue.includes(item.value))
      .map((i) => i.label)
      .join(", ")
    : data?.find((item) => item.value === selectedValue)?.label;

  // ✅ Safe filtering
  const filteredData = data?.filter((item) =>
    item.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text
            style={[
              Typography.black14Regular,
              { color: Colors.secondaryText, },
            ]}
          >
            {label}
          </Text>
          {badgeComponent ? badgeComponent : null}
        </View>
      )}
      {/* 🔹 Input box */}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? Colors.error
              : isOpen
                ? Colors.secondary
                : Colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => !disabled && toggleDropdown()}
      >
        <Text
          style={[
            Typography.black14Regular,
            {
              color: selectedLabels ? Colors.primaryText : Colors.secondaryText,
            },
            inputStyle,
          ]}
          numberOfLines={1}
        >
          {selectedLabels || placeholder}
        </Text>
        <Image
          source={isLeftIcon ? Icons.chervonLeft : Icons.downArrow}
          style={{
            height: 12,
            width: 12,
            tintColor: Colors.secondaryText,
            resizeMode: "contain",
          }}
        />
      </TouchableOpacity>

      {/* 🔹 Dropdown list */}
      {isOpen && (
        <View style={[styles.dropdown, dropdownStyle]}>
          {searchable && (
            <TextInput
              placeholder="Search..."
              placeholderTextColor={Colors.secondaryText}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
            />
          )}

          {showAddNew && (
            <TouchableOpacity style={styles.addNewRow} onPress={onAddNew}>
              <Text style={styles.addNewText}>+ Add new</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={filteredData}
            // ✅ FIX: Provide a fallback key when id missing
            keyExtractor={(item, index) =>
              item.id?.toString() ?? item.value?.toString() ?? index.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <Text style={[Typography.black14Regular, { color: '#4C4C4C' }]}>{item.label}</Text>
                {multiple ? (
                  <CustomCheckbox
                    checked={isSelected(item.value)}
                    onPress={() => handleSelect(item)}
                    borderColor={
                      isSelected(item.value)
                        ? Colors.secondary
                        : Colors.border
                    }
                  />
                ) : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noResults}>No results found</Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputContainer: {
    borderWidth: 1.2,
    borderRadius: 4,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundLight,
  },
  inputText: {
    fontSize: scaleFont(14),
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 4,
    maxHeight: 250,
    paddingHorizontal: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    marginVertical: 8,
    fontSize: scaleFont(14),
    color: Colors.primaryText,
  },
  addNewRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderColor: Colors.border,
  },
  addNewText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
  },
  itemText: {
    fontSize: scaleFont(14),
    color: Colors.primaryText,
  },
  noResults: {
    ...Typography.black14Medium,
    textAlign: "center",
    color: Colors.secondaryText,
    marginVertical: 10,
  },
  error: {
    color: Colors.error,
    fontSize: scaleFont(12),
    marginTop: 4,
  },
});
