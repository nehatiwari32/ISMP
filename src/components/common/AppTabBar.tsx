import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { TabItem } from "../../utils/interfaces";
import { Icons } from "../../assets/icons";

interface AppTabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
  categories?: any[]; // Optional categories for dropdown
}

const AppTabBar: React.FC<AppTabBarProps> = ({
  tabs,
  active,
  onChange,
  categories = [],
}) => {
  const navigation = useNavigation();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const handlePress = (item: TabItem) => {
    if (item.showLabel === false) {
      // Navigate to Add Event screen
      navigation.navigate("AddEventScreen");
    } else if (item.isIcon === true) {
      // Show category dropdown
      setShowCategoryModal(true);
    } else {
      onChange(item.value);
    }
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.category_name || "All Categories");
    setShowCategoryModal(false);
    // You can add filter logic here
  };

  const renderItem = ({ item }: { item: TabItem }) => {
    const isActive = active === item.value;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[styles.tab, isActive && styles.activeTab]}
      >
        {item?.showLabel === false ? (
          <Image
            source={Icons.add}
            tintColor={Colors.primary}
            style={styles.addIcon}
          />
        ) : item?.isIcon === true ? (
          <View style={styles.rowContainer}>
            <Text
              numberOfLines={1}
              style={[
                isActive ? Typography.black12Bold : Typography.black12Regular,
                {
                  color: isActive ? Colors.secondary : Colors.primary,
                  textAlign: "center",
                  flexShrink: 1,
                },
              ]}
            >
              {selectedCategory}
            </Text>
            <Image source={Icons.downArrow} style={styles.downIcon} />
          </View>
        ) : (
          <Text
            numberOfLines={1}
            style={[
              isActive ? Typography.black12Bold : Typography.black12Regular,
              {
                color: isActive ? Colors.secondary : Colors.primary,
                textAlign: "center",
                flexShrink: 1,
              },
            ]}
          >
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <FlatList
        horizontal
        data={tabs}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.value}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Image source={Icons.cross} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { _id: "all", category_name: "All Categories" },
                ...categories,
              ]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={styles.categoryItemText}>
                    {item.category_name}
                  </Text>
                  {selectedCategory === item.category_name && (
                    <Image
                      source={Icons.check}
                      style={styles.checkIcon}
                      tintColor={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AppTabBar;

const styles = StyleSheet.create({
  listContainer: {
    paddingRight: 8,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 40,
    backgroundColor: Colors.primaryExtraLight,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  addIcon: {
    height: 20,
    width: 20,
    objectFit: "contain",
  },
  activeTab: {
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downIcon: {
    height: 12,
    width: 12,
    objectFit: "contain",
    tintColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: "80%",
    maxHeight: "60%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.black18Bold,
  },
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: Colors.secondaryText,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryItemText: {
    ...Typography.black14Regular,
  },
  checkIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
});