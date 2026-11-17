import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";

import { CustomButton, InputField, ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { RegisterValidationSchema } from "../../../utils/validation";

const RegisterNowScreen = () => {
  const navigation = useNavigation<any>();
  const formikRef = useRef<any>(null);

  const handleSubmitForm = (values: any) => {
    console.log("✅ Register Payload:", values);
    // API / Payment call here
  };

  return (
    <ViewContainer
      isHeader
      headerTitle="Register Now"
      backgroundColor={Colors.lightBg}
      containerStyle={{ paddingHorizontal: 0 }}
      bottomFixedComponent={
        <CustomButton
          title="Pay Now"
          onPress={() => formikRef.current?.handleSubmit()}
        />
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          passes: "02",
          name: "Nitin Kumar",
          mobile: "9546549251",
          email: "nitin123@gmail.com",
          gst: "",
        }}
        validationSchema={RegisterValidationSchema}
        onSubmit={handleSubmitForm}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
        }) => (
          <View style={styles.formContainer}>
            <InputField
              label="Number Of Passes"
              value={values.passes}
              keyboardType="number-pad"
              onChangeText={handleChange("passes")}
              error={touched.passes ? errors.passes : ""}
            />

            <InputField
              label="Name"
              value={values.name}
              onChangeText={handleChange("name")}
              error={touched.name ? errors.name : ""}
            />

            <InputField
              label="Mobile Number"
              value={`+91 ${values.mobile}`}
              editable={false}
            />

            <InputField
              label="Email"
              value={values.email}
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              error={touched.email ? errors.email : ""}
            />

            <InputField
              label="GST Number"
              placeholder="Enter GST number"
              value={values.gst}
              onChangeText={handleChange("gst")}
            />
          </View>
        )}
      </Formik>
    </ViewContainer>
  );
};

export default RegisterNowScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    ...Typography.black18Bold,
  },
  formContainer: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 24,
  },

});
