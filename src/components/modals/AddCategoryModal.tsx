import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { Formik } from "formik";

import { InputField } from '../common';
import { Colors } from '../../theme/colors';
import { Spacing, Typography } from '../../theme/typography';
import { useDispatch } from 'react-redux';
import { addCategory, addIntrest, addProfession, getCategories, getIntrest, getProfession } from '../../redux/slices/profileSlice';
import { Icons } from '../../assets/icons';
import * as Yup from "yup";

interface Props {
  visible: boolean;
  onClose: () => void;
  type?: string;
  title?: string;
}

/* -----------------------------------------------------
    ✅ VALIDATION SCHEMA (FIXED & CORRECT)
------------------------------------------------------ */
const CategorySchema = Yup.object().shape({
  category: Yup.string()
    .trim()
    .required("Category name is required"),

  subCategories: Yup.array()
    .of(
      Yup.string()
        .trim()
        .required("Subcategory cannot be empty")
    )
    .min(1, "At least one subcategory is required")
    .max(10, "Maximum 10 subcategories allowed"),
});

/* -----------------------------------------------------
    ✅ MAIN MODAL COMPONENT
------------------------------------------------------ */
const AddCategoryModal: React.FC<Props> = ({ visible, onClose, type, title }) => {
  const dispatch = useDispatch();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>

          <Text style={[Typography.black14Bold, { marginBottom: 8 }]}>
            {title || "Add Business Category"}
          </Text>

          {/* 🟩 FORMIK START */}
          <Formik
            initialValues={{
              category: "",
              subCategories: [""],
            }}
            validationSchema={CategorySchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                const cleanedSubCats = values.subCategories
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0);

                const payload = {
                  category_name: values.category.trim(),
                  sub_categories: cleanedSubCats,
                };

                let res;

                // 🔥 Call API based on type
                if (type === "interest") {
                  res = await dispatch(addIntrest(payload)).unwrap();
                }
                else if (type === "business") {
                  res = await dispatch(addCategory(payload)).unwrap();
                }
                else {
                  res = await dispatch(addProfession(payload)).unwrap();
                }

                // 🔥 Check response
                const validStatus = [200, 201, "200", "201"];

                if (validStatus.includes(res?.statusCode)) {
                  Alert.alert("Success", "Your request has been sent to the admin for approval");
                  resetForm();
                  onClose();

                  if (type === "interest") {
                    dispatch(getIntrest());
                  } else if (type === "business") {
                    dispatch(getCategories());
                  } else {
                    dispatch(getProfession())
                  }
                }

              } catch (err: any) {
                Alert.alert("Error", err?.error || err);
              }
            }}

          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => (
              <>
                {/* ---------------- CATEGORY FIELD ---------------- */}
                <InputField
                  placeholder="Add Category"
                  value={values.category}
                  onChangeText={handleChange("category")}
                  containerStyle={{ marginBottom: 8 }}
                />
                {touched.category && errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}

                {/* ---------------- SUBCATEGORY FIELDS ---------------- */}
                {values.subCategories.map((item, index) => (
                  <View key={index} style={styles.subRow}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        placeholder="Add Sub category"
                        value={item}
                        containerStyle={{ marginBottom: 8 }}
                        onChangeText={(t) => {
                          const updated = [...values.subCategories];
                          updated[index] = t;
                          setFieldValue("subCategories", updated);
                        }}
                      />

                      {/* ❗ Show error for each subcategory */}
                      {touched.subCategories &&
                        touched.subCategories[index] &&
                        errors.subCategories &&
                        errors.subCategories[index] && (
                          <Text style={styles.errorText}>
                            {errors.subCategories[index]}
                          </Text>
                        )}
                    </View>

                    {/* ❌ Remove Subcategory */}
                    {values.subCategories.length > 1 && (
                      <TouchableOpacity
                        onPress={() => {
                          const updated = [...values.subCategories];
                          updated.splice(index, 1);
                          setFieldValue("subCategories", updated);
                        }}
                        style={styles.iconBtn}
                      >
                        <Image
                          source={Icons.cross}
                          style={styles.cross}
                          tintColor={Colors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* ❗ Global list-level error */}
                {touched.subCategories &&
                  typeof errors.subCategories === "string" && (
                    <Text style={styles.errorText}>{errors.subCategories}</Text>
                  )}

                {/* ---------------- ADD MORE BUTTON ---------------- */}
                <TouchableOpacity
                  onPress={() => {
                    if (values.subCategories.length >= 10) {
                      Alert.alert("Limit", "You can add up to 10 subcategories only.");
                      return;
                    }
                    setFieldValue("subCategories", [...values.subCategories, ""]);
                  }}
                >
                  <Text style={styles.plus}>+ Add more</Text>
                </TouchableOpacity>

                {/* ---------------- BUTTONS ---------------- */}
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.primary },
                    ]}
                    onPress={onClose}
                  >
                    <Text style={[styles.btnText, { color: Colors.primary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                    <Text style={styles.btnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
          {/* 🟩 FORMIK END */}

        </View>
      </View>
    </Modal>
  );
};

export default AddCategoryModal;

/* -----------------------------------------------------
    ✅ STYLES
------------------------------------------------------ */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    marginVertical: 2,
  },

  plus: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },
  iconBtn: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cross: {
    height: 18,
    width: 18,
    objectFit: "contain",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
});
