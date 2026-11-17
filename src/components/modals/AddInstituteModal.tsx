import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Alert } from "react-native";
import { Colors } from "../../theme/colors";
import { CustomButton, CustomDropdown, InputField } from "../common";
import { Spacing, Typography } from "../../theme/typography";
import { BlurView } from "@react-native-community/blur";
import { Formik } from "formik";
import { useDispatch } from "react-redux";
import { addOrganization } from "../../redux/slices/profileSlice";
import { instituteSchema } from "../../utils/validation";
import { getStateCity } from "../../redux/slices/authSlice";

type Item = { id: string | number; label: string; value: string | number };

interface Props {
  visible: boolean;
  onClose: () => void;
  organizationType?: string; // "school" | "college" | "company"
  stateOptions: Item[];
}


const AddInstituteModal: React.FC<Props> = ({
  visible,
  onClose,
  stateOptions,
  organizationType = "college",
}) => {
  const dispatch = useDispatch();
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);

  const handleSubmitForm = async (values: any, resetForm: any) => {
    try {
      const payload = {
        state_id: values.state,
        district_id: values.district,
        organization_name: values.name,
        organization_type: organizationType,
      };

      console.log("FINAL PAYLOAD:", payload);

      const res: any = await dispatch(addOrganization(payload)).unwrap();
      const isSuccess = (code: any) => ["200", "201", 200, 201].includes(code);

      if (isSuccess(res?.statusCode)) {
        Alert.alert("Success", "Your request has been sent to the admin for approval");
        resetForm();
        onClose();
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={2}
          blurType="dark"
          reducedTransparencyFallbackColor="black"
        />

        <View style={styles.box}>
          <Text style={[Typography.black14Bold, { color: "#3C3C3C", marginBottom: 10 }]}>
            {organizationType === 'company' ? 'Add Company' : 'Add Institute'}
          </Text>

          <Formik
            initialValues={{
              state: "",
              district: "",
              name: "",
            }}
            validationSchema={instituteSchema}
            onSubmit={(values, { resetForm }) => handleSubmitForm(values, resetForm)}
          >
            {({ values, errors, touched, setFieldValue, handleSubmit }) => (
              <>
                <CustomDropdown
                  placeholder="Select State"
                  data={stateOptions}
                  selectedValue={values.state}
                  onSelect={async (item: any) => {
                    try {
                      setFieldValue("state", item.value);

                      const res: any = await dispatch(
                        getStateCity({ search: item?.label })
                      ).unwrap();

                      setDistrictOptions(
                        (res || []).map((i: any) => ({
                          id: i.district_id,
                          label: i.district_name,
                          value: i.district_id,
                        }))
                      );
                    } catch (err) {
                      console.log("Error fetching districts:", err);
                    }
                  }}

                  isLeftIcon={true}
                />
                {touched.state && errors.state && (
                  <Text style={styles.error}>{errors.state}</Text>
                )}

                <CustomDropdown
                  placeholder="Select District"
                  data={districtOptions}
                  selectedValue={values.district}
                  onSelect={(item: any) => setFieldValue("district", item.value)}
                  isLeftIcon={true}
                />
                {touched.district && errors.district && (
                  <Text style={styles.error}>{errors.district}</Text>
                )}

                <InputField
                  placeholder={organizationType === 'company' ? 'Add company name' : organizationType === 'school' ? "Add school name" : 'Add college name'}
                  value={values.name}
                  onChangeText={(t) => setFieldValue("name", t)}
                />
                {touched.name && errors.name && (
                  <Text style={styles.error}>{errors.name}</Text>
                )}

                <View style={styles.row}>
                  <CustomButton
                    title="Cancel"
                    onPress={onClose}
                    buttonStyle={{
                      width: "49%",
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: Colors.primary,
                    }}
                    textColor={Colors.primary}
                  />

                  <CustomButton
                    title="Add"
                    onPress={handleSubmit as any}
                    buttonStyle={{ width: "49%" }}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

export default AddInstituteModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
  },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
});
