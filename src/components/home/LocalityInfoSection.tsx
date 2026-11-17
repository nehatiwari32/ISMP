import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Colors } from "../../theme/colors";
import { Spacing, Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";
import { AppTabBar } from "../common";
import { BlurView } from "@react-native-community/blur";

interface Props {
  categories: any[];
  activeCategory: string | null;
  onCategoryChange: (id: string) => void;
  info: any[];
  loadingCategories?: boolean;
}

const NAVIGATION_CATEGORIES = ["Spirituality"];

const LocalityInfoSection: React.FC<Props> = ({
  categories,
  activeCategory,
  onCategoryChange,
  info,
  loadingCategories,
}) => {
  const navigation = useNavigation();
  const { postType } = useSelector((s: RootState) => s.post);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSortCategory, setSelectedSortCategory] =
    useState<string>("all");

  /* ---------- Tabs ---------- */
  const tabs =
    categories?.map((c) => ({
      label: c.category_name,
      value: c._id,
    })) || [];

  const resolvedActiveCategory =
    activeCategory || categories?.[0]?._id;

  /* ---------- Filtered Data ---------- */
  const filteredInfo = useMemo(() => {
    if (selectedSortCategory === "all") return info;
    return info?.filter(
      (item) => item.category_id === selectedSortCategory
    );
  }, [info, selectedSortCategory]);

  const activeCategoryObj = categories?.find(
    (item) => item._id === activeCategory
  );

  const activeCategoryName = activeCategoryObj?.category_name || "";

  const sectionTitle = activeCategoryName
    ? `${activeCategoryName} Information`
    : "Monuments Information";

  const isGovernment = activeCategoryName === "Government";

  /* ---------- Tab Change ---------- */
  const handleTabChange = (categoryId: string) => {
    const selectedCategory = categories.find(
      (c) => c._id === categoryId
    );
    if (!selectedCategory) return;

    setSelectedSortCategory(categoryId)
    setIsExpanded(true);

    if (NAVIGATION_CATEGORIES.includes(selectedCategory.category_name)) {
      navigation.navigate("Spirituality", {
        categoryId,
        categoryName: selectedCategory.category_name,
      });
      return;
    }

    onCategoryChange(categoryId);
  };

  /* ---------- Dialer ---------- */
  const onCallPress = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      {/* ---------- TITLE + SORT ---------- */}
      <View style={styles.titleRow}>
        <Text style={Typography.black16Bold}>
          {postType === "locality_problems"
            ? "Locality Problems / News"
            : "Locality Information"}
        </Text>

        {postType === "locality_problems" &&
          <TouchableOpacity
            style={styles.filterContainer}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={Typography.black12Medium}>Sort By</Text>
            <Image source={Icons.filter} style={styles.filterIcon} />
          </TouchableOpacity>}
      </View>

      {/* ---------- TABS ---------- */}
      {postType !== "locality_problems" && (
        <>
          {loadingCategories ? (
            <ActivityIndicator style={{ marginTop: 12 }} />
          ) : (
            <View style={{ marginVertical: 16, }}>
              <AppTabBar
                tabs={tabs}
                active={resolvedActiveCategory}
                onChange={handleTabChange}
              />
            </View>
          )}

          {/* ---------- CONTENT ---------- */}
          <View style={styles.cardContainer}>
            {/* ---------- HEADER ---------- */}
            <TouchableOpacity
              style={styles.titleRow}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={Typography.black14Bold}>
                {sectionTitle}
              </Text>

              <Image
                source={Icons.downArrow}
                style={[
                  styles.arrow,
                  { transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] },
                ]}
              />
            </TouchableOpacity>

            {/* ---------- CONTENT ---------- */}
            {isExpanded &&
              filteredInfo.flatMap((item) => {
                if (isGovernment) {
                  return item.phone_numbers?.map((p) => (
                    <View key={p._id} style={styles.phoneCard}>
                      <View style={styles.valueRow}>
                        <View>
                          <Text style={Typography.black14Bold}>
                            {p.title}
                          </Text>
                          <Text style={Typography.black12Regular}>
                            {p.number}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => onCallPress(p.number)}
                        >
                          <Image
                            source={Icons.call}
                            style={styles.callIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ));
                }

                /* 🟠 ALL OTHER CATEGORIES → POST ONLY */
                return (
                  <View key={item._id} style={styles.phoneCard}>
                    <Text style={Typography.black14Bold}>
                      {item.title}
                    </Text>

                    {!!item.description && (
                      <Text style={Typography.black12Regular}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                );
              })}
          </View>

        </>
      )}

      {/* ================= SORT MODAL ================= */}
      <Modal visible={showSortModal} transparent animationType="slide">

        <Pressable
          style={styles.backdrop}
          onPress={() => setShowSortModal(false)}
        />
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={2}
          blurType="dark"
          reducedTransparencyFallbackColor="black"
        />

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={[Typography.black14Medium, { color: '#787878' }]}>SORT BY CATEGORY</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Text style={Typography.black18Regular}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ---------- ALL ---------- */}
          <Pressable
            style={styles.radioRow}
            onPress={() => setSelectedSortCategory("all")}
          >
            <View
              style={[
                styles.radio,

                { borderColor: selectedSortCategory === "all" ? Colors.secondary : "#D4D4D4", }
              ]}
            >
              {selectedSortCategory === "all" && <View style={selectedSortCategory === "all" && styles.radioActive} />}
            </View>
            <Text style={Typography.black14Medium}>All</Text>
          </Pressable>

          {/* ---------- CATEGORY LOOP ---------- */}
          {categories.map((cat) => (
            <Pressable
              key={cat._id}
              style={styles.radioRow}
              onPress={() => setSelectedSortCategory(cat._id)}
            >
              <View
                style={[
                  styles.radio,
                  { borderColor: selectedSortCategory === cat._id ? Colors.secondary : "#D4D4D4" }
                ]}
              >
                {selectedSortCategory === cat._id && <View style={styles.radioActive} />}
              </View>

              <Text style={Typography.black14Medium}>
                {cat.category_name}
              </Text>
            </Pressable>
          ))}

          {/* ---------- FOOTER ---------- */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={[Typography.black16Medium, { color: Colors.primary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                setShowSortModal(false);
                onCategoryChange(selectedSortCategory);
              }}
            >
              <Text style={[Typography.black16Medium, { color: "#fff" }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LocalityInfoSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightBg,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingVertical: 10,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  filterContainer: {
    backgroundColor: "#DADADA",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  filterIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primaryText,
  },

  cardContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: Spacing.modalBorderRadius,
    marginTop: 10,
    gap: 10,
  },

  arrow: {
    width: 14,
    height: 14,
    objectFit: "contain",
    tintColor: "#000",
  },

  phoneCard: {
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: Spacing.modalBorderRadius,
    padding: 10,
  },

  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  callBtn: {
    height: 34,
    width: 34,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  callIcon: {
    height: 20,
    width: 20,
    tintColor: Colors.primary,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },

  radio: {
    width: 19,
    height: 19,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  radioActive: {
    width: 13,
    height: 13,
    borderRadius: 9,
    backgroundColor: Colors.secondary,
  },

  sheetFooter: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },

  applyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
});

