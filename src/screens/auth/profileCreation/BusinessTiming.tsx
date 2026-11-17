import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { Formik } from "formik";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Colors } from "../../../theme/colors";
import { ProgressBar, AuthContainer, CompletionModal } from "../../../components";
import { Icons } from "../../../assets/icons";
import {
  fetchBusinessUserProfile,
  resetProfileData,
  setProfileProgress,
  updateBusinessProfile,
} from "../../../redux/slices/profileSlice";
import { getLoginProfile, updateProfileCompleted } from "../../../redux/slices/authSlice";
import { Spacing, Typography } from "../../../theme/typography";
import { calculateProfileProgress } from "../../../utils/helper";

const generateTimeOptions = () => {
  const times = [
    { label: "Holiday", value: "00:00" }
  ];

  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time24 = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;

      // Skip 00:00 since it's already added as Holiday
      if (time24 === "00:00") continue;

      const momentTime = moment(time24, "HH:mm");
      const time12 = momentTime.format("h:mm A");

      times.push({
        label: time12,
        value: time24,
      });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const BusinessTimingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { user } = useSelector((state: any) => state.auth);
  const { profilePayload, profileProgress } = useSelector((state: any) => state.profile);

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useFocusEffect(
    useCallback(() => {
      const steps = {
        step1: true,
        step2: true,
        step3: false,
      };
      const newProgress = calculateProfileProgress(
        user.addresses,
        steps
      );

      dispatch(setProfileProgress(newProgress));

      // optional cleanup
      return () => { };
    }, [user.addresses])
  );

  // 🕒 Initial Values
  const initialValues = {
    timings: days.map((day) => {
      const prev = profilePayload?.openingHours?.find(
        (d: any) => d.day?.toLowerCase() === day.toLowerCase()
      );
      return {
        day,
        openTime: prev?.openTime || "",
        closeTime: prev?.closeTime || "",
      };
    }),
  };

  // 🕓 Dropdown States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [dropdownMode, setDropdownMode] = useState<"open" | "close">("open");
  const [applyToAll, setApplyToAll] = useState(false);

  const formikRef = useRef<any>(null);

  // ✅ Apply to all checkbox toggle
  const handleApplyToAllToggle = () => {
    if (!formikRef.current) return;

    if (!applyToAll) {
      // Check if first day has any timing set
      const firstDay = formikRef.current.values.timings[0];
      if (!firstDay.openTime && !firstDay.closeTime) {
        Alert.alert(
          "No Timing Selected",
          "Please select at least opening or closing time for Monday before applying to all days."
        );
        return;
      }

      // When enabling "Apply to All", apply first day timing to all days
      const updated = formikRef.current.values.timings.map((t: any) => ({
        ...t,
        openTime: firstDay.openTime,
        closeTime: firstDay.closeTime,
      }));
      formikRef.current.setFieldValue("timings", updated);
    }

    setApplyToAll(!applyToAll);
  };

  // ✅ Clear all timings
  const handleClearAll = () => {
    if (!formikRef.current) return;

    Alert.alert(
      "Clear All Timings",
      "Are you sure you want to clear all opening and closing times?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            const updated = formikRef.current.values.timings.map((t: any) => ({
              ...t,
              openTime: "",
              closeTime: "",
            }));
            formikRef.current.setFieldValue("timings", updated);
            // ✅ Uncheck "Apply to All" after clearing
            setApplyToAll(false);
          },
        },
      ]
    );
  };

  // ✅ Open dropdown
  const handleTimePress = (index: number, type: "open" | "close") => {
    setDropdownMode(type);
    setDropdownIndex(index);
    setDropdownOpen(true);
  };

  // ✅ Select time from dropdown
  const handleTimeSelect = (timeValue: string) => {
    if (dropdownIndex === null || !formikRef.current) return;

    const updated = [...formikRef.current.values.timings];
    const field = dropdownMode === "open" ? "openTime" : "closeTime";
    const otherField = dropdownMode === "open" ? "closeTime" : "openTime";

    // ✅ If Holiday (00:00) selected, set both times to 00:00 for ONLY this day
    if (timeValue === "00:00") {
      updated[dropdownIndex].openTime = "00:00";
      updated[dropdownIndex].closeTime = "00:00";
      formikRef.current.setFieldValue("timings", updated);
      setDropdownOpen(false);
      return;
    }

    // ✅ Validation: Opening ≠ Closing (but allow 00:00 for holiday)
    if (updated[dropdownIndex][otherField] === timeValue) {
      Alert.alert("Invalid Time", "Opening and closing time cannot be the same!");
      setDropdownOpen(false);
      return;
    }

    updated[dropdownIndex][field] = timeValue;
    formikRef.current.setFieldValue("timings", updated);
    setDropdownOpen(false);

    if (applyToAll) {
      const updatedAll = formikRef.current.values.timings.map((t: any) => ({
        ...t,
        [field]: timeValue,
      }));
      formikRef.current.setFieldValue("timings", updatedAll);
    }
  };

  // ✅ Clear time properly
  const handleClearTime = (index: number, type: "open" | "close") => {
    if (!formikRef.current) return;

    Alert.alert(
      "Clear Time",
      `Clear ${type === "open" ? "opening" : "closing"} time?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            const updated = [...formikRef.current.values.timings];
            const field = type === "open" ? "openTime" : "closeTime";
            updated[index][field] = "";
            formikRef.current.setFieldValue("timings", updated);
          },
        },
      ]
    );
  };

  // ✅ Format time to 12h (show "Holiday" for 00:00)
  const formatTime12h = (time24: string) => {
    if (!time24) return null;
    if (time24 === "00:00") return "Holiday";
    return moment(time24, "HH:mm").format("h:mm A");
  };

  // ✅ Submit handler with validation
  const handleFormikSubmit = async (values: any) => {
    // ✅ NEW: Check if at least one day has timings filled
    const hasAnyTiming = values.timings.some((t: any) =>
      t.openTime || t.closeTime
    );

    if (!hasAnyTiming) {
      Alert.alert(
        "No Timings Set",
        "Please set opening and closing times for at least one day before submitting."
      );
      return;
    }

    // ✅ Validation - Check if any day has only opening OR only closing time filled
    const hasIncompleteTimings = values.timings.some((t: any) => {
      const hasOpenOnly = t.openTime && !t.closeTime && t.openTime !== "00:00";
      const hasCloseOnly = !t.openTime && t.closeTime && t.closeTime !== "00:00";
      return hasOpenOnly || hasCloseOnly;
    });

    if (hasIncompleteTimings) {
      Alert.alert(
        "Incomplete Timings",
        "Please fill both opening and closing times for all days, or leave both empty."
      );
      return;
    }

    // ✅ Validation: Check if opening = closing (except 00:00)
    const hasInvalidTime = values.timings.some((t: any) =>
      t.openTime && t.closeTime &&
      t.openTime !== "00:00" &&
      t.openTime === t.closeTime
    );

    if (hasInvalidTime) {
      Alert.alert("Validation Error", "Opening and closing time cannot be the same!");
      return;
    }

    const openingHours = values.timings.map((t: any) => {
      // ✅ Holiday case: 00:00
      if (t.openTime === "00:00" && t.closeTime === "00:00") {
        return {
          day: t.day.toLowerCase(),
          isClosed: false,
          openTime: "00:00",
          closeTime: "00:00",
        };
      }

      // ✅ Closed case: no times set
      if (!t.openTime && !t.closeTime) {
        return {
          day: t.day.toLowerCase(),
          isClosed: true,
          openTime: null,
          closeTime: null,
        };
      }

      // ✅ Normal case
      return {
        day: t.day.toLowerCase(),
        isClosed: false,
        openTime: t.openTime || null,
        closeTime: t.closeTime || null,
      };
    });

    const payload = { ...profilePayload, openingHours };

    try {
      const res = await dispatch(updateBusinessProfile(payload)).unwrap();
      if (res?.statusCode === 200 || res?.statusCode === "200") {
        navigation.navigate("EducationWork", { type: "business" });
      }
    } catch (err: any) {
      Alert.alert("Error", err?.data || "Something went wrong");
    }
  };

  const handleSubmitPress = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  return (
    <AuthContainer
      headerTitle="Set Business Profile"
      showLogo={false}
      onPress={handleSubmitPress}
      btnTitle="Submit"
      showbtn={true}
      rightTxt="Skip"
      isRight
      secondBGColor={Colors.lightBg}
      onRightPress={() => setShowCompletionModal(true)}
    >
      <View style={{ paddingHorizontal: Spacing.screenHorizontalPadding, paddingTop: 10 }}>
        <ProgressBar step={profileProgress} />

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleFormikSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, errors }) => (
            <>
              {/* ✅ Apply to All Checkbox + Clear All Button */}
              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={styles.applyAllCheckbox}
                  onPress={handleApplyToAllToggle}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, applyToAll && styles.checkboxActive]}>
                    {applyToAll && <Image source={Icons.check} style={styles.checkIcon} />}
                  </View>
                  <Text style={styles.applyAllText}>Apply same timing to all days</Text>
                </TouchableOpacity>

                {/* ✅ NEW: Clear All Button (shown when "Apply to All" is checked) */}
                {applyToAll && (
                  <TouchableOpacity
                    style={styles.clearAllBtn}
                    onPress={handleClearAll}
                    activeOpacity={0.7}
                  >
                    <Image source={Icons.cross} style={styles.clearAllIcon} />
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
              >
                {values.timings.map((item, index) => (
                  <View key={item.day} style={styles.row}>
                    <Text style={[Typography.black14Bold, { color: '#515768', width: '24%' }]}>
                      {item.day}
                    </Text>

                    {/* Opening Time */}
                    <View style={styles.timeWrapper}>
                      <TouchableOpacity
                        style={styles.timeBox}
                        onPress={() => handleTimePress(index, "open")}
                        activeOpacity={0.7}
                      >
                        <Image source={Icons.clock} style={styles.clockIcon} />
                        <Text
                          style={[
                            Typography.black12Medium,
                            { color: item.openTime ? Colors.primaryText : Colors.secondaryText },
                          ]}
                        >
                          {formatTime12h(item.openTime) || "Opening time"}
                        </Text>
                      </TouchableOpacity>
                      {item.openTime && item.openTime !== "00:00" && (
                        <TouchableOpacity
                          onPress={() => handleClearTime(index, "open")}
                          style={styles.clearBtn}
                        >
                          <Image source={Icons.cross} style={styles.clearIcon} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Closing Time */}
                    <View style={styles.timeWrapper}>
                      <TouchableOpacity
                        style={styles.timeBox}
                        onPress={() => handleTimePress(index, "close")}
                        activeOpacity={0.7}
                      >
                        <Image source={Icons.clock} style={styles.clockIcon} />
                        <Text
                          style={[
                            Typography.black12Medium,
                            { color: item.closeTime ? Colors.primaryText : Colors.secondaryText },
                          ]}
                        >
                          {formatTime12h(item.closeTime) || "Closing time"}
                        </Text>
                      </TouchableOpacity>
                      {item.closeTime && item.closeTime !== "00:00" && (
                        <TouchableOpacity
                          onPress={() => handleClearTime(index, "close")}
                          style={styles.clearBtn}
                        >
                          <Image source={Icons.cross} style={styles.clearIcon} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {typeof errors.timings === "string" && (
                  <Text style={styles.errorText}>{errors.timings}</Text>
                )}
              </ScrollView>
            </>
          )}
        </Formik>
      </View>

      {showCompletionModal === true &&
        <CompletionModal
          visible={showCompletionModal}
          progress={profileProgress}
          onContinue={() => setShowCompletionModal(false)}
          onCompleteNow={() => {
            dispatch(updateProfileCompleted(true));
            dispatch(resetProfileData());
            dispatch(fetchBusinessUserProfile());
            dispatch(getLoginProfile());
            setShowCompletionModal(false)
          }}
        />}

      {/* Time Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                Select {dropdownMode === "open" ? "Opening" : "Closing"} Time
              </Text>
              <TouchableOpacity onPress={() => setDropdownOpen(false)}>
                <Image source={Icons.cross} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeOption,
                    item.value === "00:00" && styles.holidayOption
                  ]}
                  onPress={() => handleTimeSelect(item.value)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    item.value === "00:00" && styles.holidayOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </AuthContainer>
  );
};

export default BusinessTimingScreen;

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 10,
  },
  applyAllCheckbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checkboxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: "#fff",
  },
  applyAllText: {
    ...Typography.black14Medium,
    color: Colors.primaryText,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: "#fff",
  },
  clearAllIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.error,
    marginRight: 6,
  },
  clearAllText: {
    ...Typography.black12Medium,
    color: Colors.error,
  },
  container: {
    marginTop: 10,
    paddingBottom: 120,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    justifyContent: "space-between",
    marginBottom: 14,
  },
  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "35%",
  },
  timeBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  clockIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
    marginRight: 8,
    tintColor: Colors.secondaryText,
  },
  clearBtn: {
    marginLeft: 6,
    padding: 4,
  },
  clearIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.error,
  },
  errorText: {
    ...Typography.black12Medium,
    color: Colors.error,
    marginTop: 4,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownTitle: {
    ...Typography.black16Medium,
    color: Colors.primaryText,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.secondaryText,
  },
  timeOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  holidayOption: {
    backgroundColor: Colors.primaryExtraLight,
  },
  timeOptionText: {
    ...Typography.black14Medium,
    color: Colors.primaryText,
  },
  holidayOptionText: {
    ...Typography.black13Medium,
    color: Colors.primary,
  },
});