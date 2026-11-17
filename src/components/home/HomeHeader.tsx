import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import { Images } from "../../assets/images";
import { Spacing, Typography } from "../../theme/typography";
import { DROPDOWN_OPTIONS, topTabs } from "../../utils/helper";
import { changePostType, setLocality } from "../../redux/slices/postSlice";
import { RootState } from "../../redux/store";

const HomeHeader = ({ showOfferCard = true, activeTab, onTabChange, onLocationPress, selectedLocationLabel }) => {
  const { postType, totalPostCount, totalPeople } = useSelector((s: RootState) => s.post);

  const dispatch = useDispatch();

  const [showLocalzDropdown, setShowLocalzDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const onQAPress = () => {
    setActiveDropdown("qa");
    setShowLocalzDropdown(true);
  };

  const onLocalzPress = () => {
    setActiveDropdown("localz");
    setShowLocalzDropdown(true);
  };

  const truncateText = (text: string, limit = 8) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <View style={{ zIndex: 10 }}>
      {/* 🔸 Tabs */}
      <View style={{ backgroundColor: showOfferCard === false ? '#fff' : Colors.lightBg }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {topTabs.map((tab, index) => {
            const active = index === activeTab;
            const isLocalz = tab.label.toLowerCase() === "localz";
            const isQA = tab.label.toLowerCase() === "qa";
            return (
              <Pressable
                key={index}
                style={styles.tabItem}
                onPress={() => {
                  // 👉 Localz dropdown
                  if (isLocalz) {
                    onLocalzPress();
                    onTabChange(index, tab.label); // Pass tab label
                    return;
                  }

                  if (isQA) {
                    onQAPress();
                    onTabChange(index, tab.label); // Pass tab label
                    return;
                  }

                  // 👉 Normal tabs
                  onTabChange(index, tab.label); // Pass tab label
                  dispatch(changePostType(tab.label.toLowerCase()));
                  dispatch(setLocality({}));
                }}
                hitSlop={10}
              >
                <Image
                  source={tab.icon}
                  style={[
                    styles.tabIcon,
                    { tintColor: active ? Colors.secondary : Colors.primary },
                  ]}
                />

                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text
                    style={[
                      Typography.black13Bold,
                      { color: active ? Colors.secondary : Colors.primary },
                    ]}
                  >
                    {tab.label?.toLowerCase() === "global" && selectedLocationLabel
                      ? truncateText(selectedLocationLabel || tab.label, 8)
                      : tab.label}
                  </Text>

                  {/* 🔽 Arrow (ONLY VISUAL, NO TOUCHABLE) */}
                  {tab.isArrow && (
                    activeTab === index && tab.label?.toLowerCase() === "global" ?
                      <TouchableOpacity
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => onLocationPress()}
                      >
                        <Image
                          source={Icons.fillArrow}
                          style={{
                            width: 12,
                            height: 12,
                            marginStart: 4,
                            objectFit: "contain",
                            tintColor: active ? Colors.secondary : Colors.primary,
                          }}
                        />
                      </TouchableOpacity>
                      :
                      <Image
                        source={Icons.fillArrow}
                        style={{
                          width: 12,
                          height: 12,
                          marginStart: 4,
                          objectFit: "contain",
                          tintColor: active ? Colors.secondary : Colors.primary,
                        }}
                      />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {showLocalzDropdown && activeDropdown && (
          <>
            {/* 🔴 BACKDROP */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowLocalzDropdown(false)}
            />

            <View style={[styles.localzDropdownWrapper, { left: activeDropdown === 'qa' ? 180 : 150 }]}>
              {DROPDOWN_OPTIONS[activeDropdown].map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.localzItem}
                  onPress={() => {
                    dispatch(changePostType(item.type));
                    setShowLocalzDropdown(false);
                  }}
                  android_ripple={{ color: "#eee" }}
                >
                  <Image source={item.icon} style={styles.localzIcon} />
                  <Text style={styles.localzText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* 🔸 Gradient Cards */}
        {showOfferCard === true && (
          <View style={styles.cardRow}>
            {[
              {
                text: "Find Products,\nServices, Anything",
                icon: Images.products,
              },
              {
                text: "Find Coupons\n& Offers",
                icon: Images.coupon,
              },
            ].map((card, idx) => (
              <TouchableOpacity key={idx} activeOpacity={0.9} style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#FFFFFF", "#FFEAE2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.cardLeft}>
                    <Text style={Typography.black12Bold}>{card.text}</Text>
                  </View>

                  <View style={styles.iconWrapper}>
                    <Image source={card.icon} style={styles.cardIcon} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {postType === 'pincode' && (
          <View style={styles.cardRow}>
            {[
              {
                text: totalPeople,
                body: 'People',
                icon: Images.products,
              },
              {
                text: totalPostCount,
                body: "Total Posts",
                icon: Images.coupon,
              },
            ].map((card, idx) => (
              <TouchableOpacity key={idx} activeOpacity={0.9} style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#FFFFFF", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.cardLeft}>
                    <Text style={Typography.black16Bold}>{card.text}</Text>
                    <Text style={[Typography.black13Regular, { color: Colors.secondaryText }]}>{card.body}</Text>
                  </View>

                  <View style={styles.iconWrapper}>
                    <Image source={card.icon} style={styles.cardIcon} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  avatarBorder: {
    padding: 2,
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primaryExtraLight
  },
  tabRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 32,
  },
  tabItem: {
    alignItems: "center",
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: "contain",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    gap: 10,
    paddingHorizontal: Spacing.modalBorderRadius,
    paddingVertical: 6,
  },
  cardLeft: {
    flex: 1,
  },
  cardText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
    lineHeight: 20,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  localzDropdownWrapper: {
    position: "absolute",
    top: 60,
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    borderWidth: 1,
    borderColor: Colors.border10,
    zIndex: 9999,
    elevation: 4,
    paddingLeft: 14,
    paddingRight: 22,
    paddingVertical: 20
  },
  localzItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBottom: 16,
  },
  localzIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
    resizeMode: "contain",
  },
  localzText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
  },
});