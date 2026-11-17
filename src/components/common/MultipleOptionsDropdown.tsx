// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   Image,
// } from "react-native";
// import { Colors } from "../../theme/colors";
// import { scaleFont } from "../../utils/helper";
// import { Icons } from "../../assets/icons";
// import CustomCheckbox from "./CustomCheckbox";
// import { Typography } from "../../theme/typography";

// interface DropdownItem {
//   id?: string | number;
//   label?: string;
//   value?: string | number;
//   name?: string;
//   subcategories?: string[];
// }

// interface MultipleOptionsDropdownProps {
//   label?: string;
//   placeholder?: string;
//   data: DropdownItem[];
//   selectedValue?: string[];
//   onSelect: (selected: string[]) => void;
//   searchable?: boolean;
//   containerStyle?: any;
//   inputStyle?: any;
//   dropdownStyle?: any;
//   error?: string;
//   disabled?: boolean;
//   multiple?: boolean;
//   showAddNew?: boolean;
//   onAddNew?: () => void;
//   expanded?: boolean;
//   setExpanded?: (value: boolean) => void;
//   badgeComponent?: React.ReactNode;

// }

// const MultipleOptionsDropdown: React.FC<MultipleOptionsDropdownProps> = ({
//   label,
//   placeholder = "Select Category",
//   data = [],
//   selectedValue = [],
//   onSelect,
//   searchable = false,
//   containerStyle,
//   inputStyle,
//   dropdownStyle,
//   error,
//   disabled = false,
//   showAddNew = false,
//   onAddNew,
//   expanded,
//   setExpanded,
//   badgeComponent
// }) => {
//   const isOpen = expanded ?? false;
//   const setIsOpen = setExpanded ?? (() => { });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   };

//   const toggleExpand = (id: string) => {
//     setExpandedCategory(expandedCategory === id ? null : id);
//   };

//   const toggleSubcategory = (subcategory: string) => {
//     let updated = [...selectedValue];
//     if (updated.includes(subcategory)) {
//       updated = updated.filter((s) => s !== subcategory);
//     } else {
//       updated.push(subcategory);
//     }
//     onSelect(updated);
//   };

//   const selectedText =
//     selectedValue.length > 0 ? selectedValue.join(", ") : placeholder;

//   const filteredData = data?.filter((item) =>
//     (item?.category_name || item.label || "")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   return (
//     <View style={[styles.container, containerStyle]}>
//       {label && (
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//           <Text
//             style={[
//               Typography.black14Regular,
//               { color: Colors.secondaryText, },
//             ]}
//           >
//             {label}
//           </Text>
//           {badgeComponent ? badgeComponent : null}
//         </View>
//       )}
//       {/* Header Input */}
//       <TouchableOpacity
//         style={[
//           styles.inputContainer,
//           {
//             borderColor: error
//               ? Colors.error
//               : isOpen
//                 ? Colors.secondary
//                 : Colors.border,
//             opacity: disabled ? 0.6 : 1,
//           },
//         ]}
//         activeOpacity={0.8}
//         onPress={() => !disabled && toggleDropdown()}
//       >
//         <Text
//           style={[
//             Typography.black14Regular,
//             {
//               color:
//                 selectedValue.length > 0
//                   ? Colors.primaryText
//                   : Colors.secondaryText,
//             },
//             inputStyle,
//           ]}
//           numberOfLines={1}
//         >
//           {selectedText}
//         </Text>
//         <Image
//           source={Icons.downArrow}
//           style={{
//             height: 12,
//             width: 12,
//             tintColor: Colors.secondaryText,
//             resizeMode: "contain",
//             transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
//           }}
//         />
//       </TouchableOpacity>

//       {/* Dropdown List */}
//       {isOpen && (
//         <View style={[styles.dropdown, dropdownStyle]}>
//           {searchable && (
//             <TextInput
//               placeholder="Search..."
//               placeholderTextColor={Colors.secondaryText}
//               value={searchTerm}
//               onChangeText={setSearchTerm}
//               style={styles.searchInput}
//             />
//           )}

//           {showAddNew && (
//             <TouchableOpacity style={styles.addNewRow} onPress={onAddNew}>
//               <Text style={[Typography.black24Regular, { color: Colors.secondary }]}>+</Text>
//               <Text style={[Typography.black14Bold, { color: Colors.secondary }]}> Add new Category</Text>
//             </TouchableOpacity>
//           )}

//           <FlatList
//             data={filteredData}
//             keyExtractor={(item, index) =>
//               item.id?.toString() ??
//               item.value?.toString() ??
//               item?.category_name ??
//               index.toString()
//             }
//             renderItem={({ item }) => {
//               const hasSubcategories = Array.isArray(item?.sub_categories);
//               const isExpanded = expandedCategory === item._id;

//               return (
//                 <View>
//                   {/* Parent Category */}
//                   <TouchableOpacity
//                     style={styles.item}
//                     activeOpacity={0.7}
//                     onPress={() =>
//                       hasSubcategories
//                         ? toggleExpand(item._id as string)
//                         : toggleSubcategory(item?.category_name || "")
//                     }
//                   >
//                     <Text style={[Typography.black14Bold, { color: '#4C4C4C' }]}>
//                       {item?.category_name || item.label}
//                     </Text>

//                     {hasSubcategories ? (
//                       <Image
//                         source={Icons.downArrow}
//                         style={[
//                           styles.arrow,
//                           isExpanded && { transform: [{ rotate: "180deg" }] },
//                         ]}
//                       />
//                     ) : (
//                       <CustomCheckbox
//                         checked={selectedValue.includes(item?.category_name || "")}
//                         onPress={() => toggleSubcategory(item?.category_name || "")}
//                         borderColor={
//                           selectedValue.includes(item?.category_name || "")
//                             ? Colors.secondary
//                             : Colors.border
//                         }
//                       />
//                     )}
//                   </TouchableOpacity>

//                   {/* Subcategories */}
//                   {hasSubcategories && isExpanded && (
//                     <View style={styles.subList}>
//                       {item?.sub_categories?.map((sub) => {
//                         const checked = selectedValue.includes(sub);
//                         return (
//                           <TouchableOpacity
//                             key={sub}
//                             style={styles.subItem}
//                             activeOpacity={0.7}
//                             onPress={() => toggleSubcategory(sub)}
//                           >
//                             <Text style={[Typography.black13Regular, { color: '#4C4C4C' }]}>{sub}</Text>
//                             <CustomCheckbox
//                               checked={checked}
//                               onPress={() => toggleSubcategory(sub)}
//                               borderColor={
//                                 checked ? Colors.secondary : Colors.border
//                               }
//                             />
//                           </TouchableOpacity>
//                         );
//                       })}
//                     </View>
//                   )}
//                 </View>
//               );
//             }}
//             ListEmptyComponent={
//               <Text style={styles.noResults}>No results found</Text>
//             }
//             keyboardShouldPersistTaps="handled"
//           />
//         </View>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}
//     </View>
//   );
// };

// export default MultipleOptionsDropdown;

// const styles = StyleSheet.create({
//   container: { marginBottom: 16 },
//   inputContainer: {
//     borderWidth: 1.2,
//     borderRadius: 4,
//     height: 48,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: Colors.backgroundLight,
//   },
//   inputText: {
//     fontSize: scaleFont(14),
//     flex: 1,
//   },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: 6,
//     backgroundColor: "#fff",
//     marginTop: 4,
//     maxHeight: 300,
//     paddingHorizontal: 8,
//   },
//   searchInput: {
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: 8,
//     height: 40,
//     paddingHorizontal: 10,
//     marginVertical: 8,
//     fontSize: scaleFont(14),
//     color: Colors.primaryText,
//   },
//   addNewRow: {
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderColor: Colors.border,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4
//   },
//   addNewText: {
//     color: Colors.secondary,
//     fontWeight: "600",
//   },
//   item: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   subList: {
//     paddingLeft: 16,
//   },
//   subItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   subLabel: {
//     fontSize: scaleFont(13),
//     color: Colors.secondaryText,
//   },
//   arrow: {
//     height: 12,
//     width: 12,
//     tintColor: Colors.secondaryText,
//     resizeMode: "contain",
//   },
//   noResults: {
//     textAlign: "center",
//     color: Colors.secondaryText,
//     marginVertical: 10,
//   },
//   error: {
//     color: Colors.error,
//     fontSize: scaleFont(12),
//     marginTop: 4,
//   },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Colors } from "../../theme/colors";
import { scaleFont } from "../../utils/helper";
import { Icons } from "../../assets/icons";
import CustomCheckbox from "./CustomCheckbox";
import { Typography } from "../../theme/typography";

interface DropdownItem {
  _id?: string | number;
  id?: string | number;
  label?: string;
  value?: string | number;
  name?: string;
  category_name?: string;
  sub_categories?: string[];
}

interface MultipleOptionsDropdownProps {
  label?: string;
  placeholder?: string;
  data: DropdownItem[];
  selectedValue?: string[];
  onSelect: (selected: string[]) => void;
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
  // NEW: Limits
  maxCategories?: number; // Max parent categories
  maxSubcategoriesPerCategory?: number; // Max subcategories per parent
  type?: "interest" | "profession"; // For better error messages
}

const MultipleOptionsDropdown: React.FC<MultipleOptionsDropdownProps> = ({
  label,
  placeholder = "Select Category",
  data = [],
  selectedValue = [],
  onSelect,
  searchable = false,
  containerStyle,
  inputStyle,
  dropdownStyle,
  error,
  disabled = false,
  showAddNew = false,
  onAddNew,
  expanded,
  setExpanded,
  badgeComponent,
  maxCategories = 3, // Default: 3 categories for interests
  maxSubcategoriesPerCategory = 3, // Default: 3 subcategories per category
  type = "interest",
}) => {
  const isOpen = expanded ?? false;
  const setIsOpen = setExpanded ?? (() => { });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = (id: string) => {
    if (expandedCategory === id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(id);
    }
  };
  // ✅ Get selected categories (parent categories)
  const getSelectedCategories = () => {
    const categoryNames = data.map((item) => item.category_name || "");
    return categoryNames.filter((catName) => {
      // Check if this category or any of its subcategories are selected
      const category = data.find((d) => d.category_name === catName);
      if (!category) return false;

      // Category is selected if it has no subcategories and is in selectedValue
      if (!category.sub_categories || category.sub_categories.length === 0) {
        return selectedValue.includes(catName);
      }

      // Category is selected if any of its subcategories are selected
      return category.sub_categories.some((sub) => selectedValue.includes(sub));
    });
  };

  // ✅ Get subcategories count for a specific category
  const getSubcategoriesCount = (categoryName: string) => {
    const category = data.find((d) => d.category_name === categoryName);
    if (!category || !category.sub_categories) return 0;

    return category.sub_categories.filter((sub) => selectedValue.includes(sub)).length;
  };

  // ✅ Check if we can add more categories
  const canAddMoreCategories = () => {
    return getSelectedCategories().length < maxCategories;
  };

  // ✅ Check if we can add more subcategories for a category
  const canAddMoreSubcategories = (categoryName: string) => {
    return getSubcategoriesCount(categoryName) < maxSubcategoriesPerCategory;
  };

  const toggleSubcategory = (subcategory: string, categoryName: string) => {
    let updated = [...selectedValue];
    const category = data.find((d) => d.category_name === categoryName);

    if (updated.includes(subcategory)) {
      // Remove subcategory
      updated = updated.filter((s) => s !== subcategory);
    } else {
      // Check if this is a parent category without subcategories
      if (!category?.sub_categories || category.sub_categories.length === 0) {
        // This is a standalone category
        if (!canAddMoreCategories()) {
          const typeText = type === "interest" ? "Interest" : "Profession";
          Alert.alert(
            "Limit Reached",
            `You can select maximum ${maxCategories} ${typeText} categories.`
          );
          return;
        }
        updated.push(subcategory);
      } else {
        // This is a subcategory
        const selectedCats = getSelectedCategories();
        const isCategoryAlreadySelected = selectedCats.includes(categoryName);

        if (!isCategoryAlreadySelected && !canAddMoreCategories()) {
          const typeText = type === "interest" ? "Interest" : "Profession";
          Alert.alert(
            "Category Limit Reached",
            `You can select maximum  ${type === "interest" ?  maxCategories - 1 : maxCategories} ${typeText} categories.`
          );
          return;
        }

        if (!canAddMoreSubcategories(categoryName)) {
          Alert.alert(
            "Subcategory Limit Reached",
            `You can select maximum ${maxSubcategoriesPerCategory} subcategories per category.`
          );
          return;
        }

        updated.push(subcategory);
      }
    }

    onSelect(updated);
  };

  // ✅ Remove entire category and its subcategories
  const removeCategory = (categoryName: string) => {
    const category = data.find((d) => d.category_name === categoryName);
    let updated = [...selectedValue];

    // Remove category itself (if it's standalone)
    updated = updated.filter((s) => s !== categoryName);

    // Remove all subcategories
    if (category?.sub_categories) {
      updated = updated.filter((s) => !category.sub_categories!.includes(s));
    }

    onSelect(updated);

    // Collapse the category
    if (expandedCategory === category?._id) {
      setExpandedCategory(null);
    }
  };

  const filteredData = data?.filter((item) =>
    (item?.category_name || item.label || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ✅ Get selected categories with their subcategories for display
  const getSelectedCategoriesForDisplay = () => {
    const selectedCats = getSelectedCategories();
    return selectedCats.map((catName) => {
      const category = data.find((d) => d.category_name === catName);
      const subcats = category?.sub_categories?.filter((sub) =>
        selectedValue.includes(sub)
      ) || [];

      // If category has no subcategories, check if the category itself is selected
      if (!category?.sub_categories || category.sub_categories.length === 0) {
        return {
          categoryName: catName,
          subcategories: selectedValue.includes(catName) ? [catName] : [],
        };
      }

      return {
        categoryName: catName,
        subcategories: subcats,
      };
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[Typography.black14Regular, { color: Colors.secondaryText }]}>
            {label}
          </Text>
          {badgeComponent ? badgeComponent : null}
        </View>
      )}

      {/* ✅ Selected Categories Display (Chip Style) */}
      {selectedValue.length > 0 && (
        <View style={styles.selectedContainer}>
          {getSelectedCategoriesForDisplay().map((item, idx) => (
            <View key={idx} style={styles.categoryChip}>
              <View style={styles.categoryChipHeader}>
                <Text style={styles.categoryChipTitle}>{item.categoryName}</Text>
                <TouchableOpacity
                  onPress={() => removeCategory(item.categoryName)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image source={Icons.cross} style={styles.chipCloseIcon} />
                </TouchableOpacity>
              </View>
              {item.subcategories.length > 0 && (
                <View style={styles.subchipsContainer}>
                  {item.subcategories.map((sub, subIdx) => (
                    <View key={subIdx} style={styles.subchip}>
                      <Text style={styles.subchipText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Header Input */}
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
              color: selectedValue.length > 0 ? Colors.primaryText : Colors.secondaryText,
            },
            inputStyle,
          ]}
          numberOfLines={1}
        >
          {placeholder}
        </Text>
        <Image
          source={Icons.downArrow}
          style={{
            height: 12,
            width: 12,
            tintColor: Colors.secondaryText,
            resizeMode: "contain",
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {/* Dropdown List */}
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
              <Text style={[Typography.black24Regular, { color: Colors.secondary }]}>+</Text>
              <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>
                {" "}
                Add new Category
              </Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item._id?.toString() ??
              item.id?.toString() ??
              item.value?.toString() ??
              item?.category_name ??
              index.toString()
            }
            renderItem={({ item }) => {
              const hasSubcategories = Array.isArray(item?.sub_categories) && item.sub_categories.length > 0;
              const isExpanded = expandedCategory === item._id?.toString();
              const categoryName = item?.category_name || item.label || "";

              // Check if category or any subcategory is selected
              const isCategorySelected = hasSubcategories
                ? item.sub_categories!.some((sub) => selectedValue.includes(sub))
                : selectedValue.includes(categoryName);

              return (
                <View>
                  {/* Parent Category */}
                  <TouchableOpacity
                    style={styles.item}
                    activeOpacity={0.7}
                    onPress={() =>
                      hasSubcategories
                        ? toggleExpand(item._id as string)
                        : toggleSubcategory(categoryName, categoryName)
                    }
                  >
                    <Text style={[Typography.black14Bold, { color: "#4C4C4C" }]}>
                      {categoryName}
                    </Text>

                    {hasSubcategories ? (
                      <Image
                        source={Icons.downArrow}
                        style={[
                          styles.arrow,
                          isExpanded && { transform: [{ rotate: "180deg" }] },
                        ]}
                      />
                    ) : (
                      <CustomCheckbox
                        checked={isCategorySelected}
                        onPress={() => toggleSubcategory(categoryName, categoryName)}
                        borderColor={
                          isCategorySelected ? Colors.secondary : Colors.border
                        }
                      />
                    )}
                  </TouchableOpacity>

                  {/* Subcategories */}
                  {hasSubcategories && isExpanded && (
                    <View style={styles.subList}>
                      {item?.sub_categories?.map((sub) => {
                        const checked = selectedValue.includes(sub);
                        return (
                          <TouchableOpacity
                            key={sub}
                            style={styles.subItem}
                            activeOpacity={0.7}
                            onPress={() => toggleSubcategory(sub, categoryName)}
                          >
                            <Text style={[Typography.black13Regular, { color: "#4C4C4C" }]}>
                              {sub}
                            </Text>
                            <CustomCheckbox
                              checked={checked}
                              onPress={() => toggleSubcategory(sub, categoryName)}
                              borderColor={checked ? Colors.secondary : Colors.border}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.noResults}>No results found</Text>}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default MultipleOptionsDropdown;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  selectedContainer: {
    marginBottom: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChip: {

  },
  categoryChipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryChipTitle: {
    ...Typography.black14Bold,
  },
  chipCloseIcon: {
    width: 18,
    height: 18,
    objectFit: 'contain',
    tintColor: "#828692",
  },
  subchipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  subchip: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subchipText: {
    ...Typography.black11Medium,
    color: Colors.secondaryText
  },
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
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginTop: 4,
    maxHeight: 300,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  subList: {
    paddingLeft: 16,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  arrow: {
    height: 12,
    width: 12,
    tintColor: Colors.secondaryText,
    resizeMode: "contain",
  },
  noResults: {
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