import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ViewContainer } from "../../../../components";
import { Colors } from "../../../../theme/colors";
import { Spacing, Typography } from "../../../../theme/typography";

import { fetchSeetings, updateSettings } from "../../../../redux/slices/profileSlice";
import { privacySettings } from "../../../../utils/helper";

// 🔥 Mapping UI keys → API keys
const fieldMap = {
  phone: "phone_number",
  email: "email",
  profile: "username",
  image: "profile_photo_url",

  school: "education_school",    // SEPARATE
  college: "education_college",  // SEPARATE

  location: "location",
  profession: "profession",
  work: "work",
  dob: "dob",
  identity: "identity",
  interests: "interests",
};


// ⭐ Reusable Radio Button
const RadioButton = ({ selected, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.radioOuter, selected && { borderColor: Colors.secondary }]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);


// ⭐ Reusable Privacy Card Component
const PrivacyCard = ({ title, value, onChange }) => {
  const options = ["only_me", "friends", "public"];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {options.map((opt) => (
        <View key={opt} style={styles.radioRow}>
          <RadioButton selected={value === opt} onPress={() => onChange(opt)} />

          <Text style={styles.radioLabel}>
            {opt === "only_me" ? "Only Me" : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ⭐ Main Screen
const PrivacySettingScreen = () => {
  const dispatch = useDispatch();
  const { profileSettings } = useSelector((state) => state.profile);

  const [values, setValues] = useState(null);

  // GET API call
  useEffect(() => {
    dispatch(fetchSeetings());
  }, []);

  // SET DEFAULT VALUES from backend
  useEffect(() => {
    if (profileSettings) {
      const state = {};

      Object.keys(fieldMap).forEach((key) => {
        const apiKey = fieldMap[key];

        // SPECIAL CASES: SCHOOL & COLLEGE
        if (key === "school") {
          state[key] =
            profileSettings["education_school"]?.visibility ||
            profileSettings["education"]?.visibility ||
            "public";
        } else if (key === "college") {
          state[key] =
            profileSettings["education_college"]?.visibility ||
            profileSettings["education"]?.visibility ||
            "public";
        } else {
          state[key] = profileSettings[apiKey]?.visibility || "public";
        }
      });

      setValues(state);
    }
  }, [profileSettings]);


  // AUTO SAVE (Instagram-like — no save button)
  const autoSave = useCallback(
    debounce((updatedValues) => {
      const payload = {
        profile_type: "personal",
        field_visibility: {},
      };

      // Build final payload for API
      Object.keys(updatedValues).forEach((key) => {
        const apiKey = fieldMap[key];
        payload.field_visibility[apiKey] = { visibility: updatedValues[key] };
      });

      dispatch(updateSettings(payload));
    }, 400),
    []
  );


  // When user changes any privacy field
  const handleChange = (field, value) => {
    const updated = { ...values, [field]: value };
    setValues(updated);
    autoSave(updated); // 🔥 No Save Button Needed
  };


  if (!values) return null;


  return (
    <ViewContainer headerTitle="Privacy Setting" containerStyle={{ paddingHorizontal: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        <Text style={[Typography.black18Medium, { marginBottom: 10 }]}>
          Privacy Setting
        </Text>

        <View>
          {privacySettings.map((item) => (
            <PrivacyCard
              key={item.key}
              title={item.label}
              value={values[item.key]}
              onChange={(v) => handleChange(item.key, v)}
            />
          ))}
        </View>

      </ScrollView>
    </ViewContainer>
  );
};

export default PrivacySettingScreen;

// ---------- Debounce Helper ----------
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: Colors.lightBg,
    paddingTop: 20,
    paddingBottom: 40
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
    gap: 10,
    marginBottom: 18,
  },

  cardTitle: {
    ...Typography.black16Medium,
    marginBottom: 12,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  radioLabel: {
    ...Typography.black14Regular,
    marginLeft: 10,
  },

  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#B5B5B5",
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
});
