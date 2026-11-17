import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Alert, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { Formik } from "formik";
import { useDispatch } from "react-redux";

import CustomDropdown from "./CustomDropdown";
import SearchDropdown from "./SearchDropdown";
import InputField from "./InputField";
import useOrganizationSearch from "../../hooks/useOrganizationSearch";
import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import { addCategory, addDegree, getDegree } from "../../redux/slices/profileSlice";
import { DegreeSchema } from "../../utils/validation";
import { Spacing, Typography } from "../../theme/typography";

type CollegeRowProps = {
  index: number;
  row: any;
  degreeOptions: { id: string; label: string; value: string }[];
  remove: (index: number) => void;
  setFieldValue: (path: string, value: any) => void;
};

const CollegeRow: React.FC<CollegeRowProps> = ({ index, row, degreeOptions, remove, setFieldValue }) => {
  // Hook used inside component — valid
  const dispatch = useDispatch()

  const search = useOrganizationSearch("college");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {index > 0 && (
        <TouchableOpacity onPress={() => remove(index)} style={{ alignSelf: "flex-end", marginBottom: 4 }}>
          <Image source={Icons.cross} style={{ width: 18, height: 18, tintColor: Colors.secondary }} />
        </TouchableOpacity>
      )}

      <CustomDropdown
        label="Degree"
        placeholder="Select Degree"
        data={degreeOptions}
        showAddNew={true}
        selectedValue={row.degree}
        onSelect={(item: any) => setFieldValue(`college[${index}].degree`, item.value)}
        isLeftIcon={true}
        onAddNew={() => setShowModal(true)}
      />

      <SearchDropdown
        label="College Name"
        placeholder="St."
        value={row.collegeName}
        searchValue={search.search}
        isBold={true}
        onChangeText={(text) => {
          search.setSearch(text);
          setFieldValue(`college[${index}].collegeName`, text);
        }}
        visible={search.visible}
        list={search.list}
        onSelect={(item) => {
          search.setSearch('');
          setFieldValue(`college[${index}].collegeName`, item.name);
          setFieldValue(`college[${index}].orgId`, item._id);
          search.setVisible(false);
        }}
        onClose={() => search.setVisible(false)}
      />

      <InputField
        label="Year of Passing"
        placeholder="Enter Year"
        maxLength={4}
        value={row.passingYear}
        onChangeText={(t: string) => setFieldValue(`college[${index}].passingYear`, t)}
        keyboardType="number-pad"
        containerStyle={{ marginBottom: 0, }}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.box}>

            <Text style={[Typography.black14Bold, { marginBottom: 8 }]}>
              {"Add Degree"}
            </Text>

            {/* 🟩 FORMIK START */}
            <Formik
              initialValues={{
                degree: "",
              }}
              validationSchema={DegreeSchema}
              onSubmit={async (values, { resetForm }) => {
                setLoading(true)
                try {

                  const payload = {
                    degree: values.degree.trim(),
                  };

                  const res = await dispatch(addDegree(payload)).unwrap();

                  setLoading(false)
                  const validStatus = [200, 201, "200", "201"];

                  if (validStatus.includes(res?.statusCode)) {
                    Alert.alert("Success", "Your request has been sent to the admin for approval");
                    dispatch(getDegree());
                    resetForm();
                    setShowModal(false);

                  }

                } catch (err: any) {
                  setLoading(false)
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
              }) => (
                <>
                  {/* ---------------- CATEGORY FIELD ---------------- */}
                  <InputField
                    placeholder="Add Category"
                    value={values.degree}
                    onChangeText={handleChange("degree")}
                    error={touched.degree && (errors.degree as string)}
                  />

                  {/* ---------------- BUTTONS ---------------- */}
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.primary },
                      ]}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={[styles.btnText, { color: Colors.primary }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={loading} style={styles.btn} onPress={handleSubmit}>
                      {loading ? <ActivityIndicator color={'#fff'} size={"small"} /> : <Text style={styles.btnText}>Add</Text>}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
            {/* 🟩 FORMIK END */}

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default CollegeRow;

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

});