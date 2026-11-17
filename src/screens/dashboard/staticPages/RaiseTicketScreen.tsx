import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { launchImageLibrary } from "react-native-image-picker";
import * as Yup from "yup";

import { CustomButton, ViewContainer } from "../../../components";
import { Icons } from "../../../assets/icons";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { RootState } from "../../../redux/store";

import {
  addSupportTicket,
  getIssueList,
  uploadMedia,
} from "../../../redux/slices/profileSlice";

import { ticketValidation } from "../../../utils/validation";

const RaiseTicketScreen = () => {
  const navigation = useNavigation();
  const dispatch: any = useDispatch();

  const { issueList = [] } = useSelector((state: RootState) => state.profile);
  const [open, setOpen] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    dispatch(getIssueList());
  }, []);

  // -----------------------------------
  // PICK → UPLOAD → SET PREVIEW URL
  // -----------------------------------
  const pickImage = async (setFieldValue: any) => {
    try {
      const result: any = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.7,
      });

      if (!result?.assets?.length) return;

      const file = result.assets[0];

      const uploadPayload = {
        file: {
          uri: file.uri,
          type: file.type,
          fileName: file.fileName,
        },
        type: "support",
      };

      setUploadLoading(true);

      const res: any = await dispatch(uploadMedia(uploadPayload)).unwrap();


      if (res?.statusCode === 200 && res?.data?.url) {
        setFieldValue("image_url", res.data.url);
      } else {
        Alert.alert("Upload Failed", "Could not upload image");
      }
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert(
        "Upload Failed",
        error?.message || "Something went wrong while uploading"
      );
    } finally {
      setUploadLoading(false);
    }
  };


  return (
    <ViewContainer
      headerTitle="Raise new Ticket"
      contentContainerStyle={{ paddingHorizontal: 0, flex: 1 }}
    >
      <Formik
        initialValues={{
          issue_type: "",
          description: "",
          image_url: "",
        }}
        validationSchema={Yup.object().shape({
          issue_type: Yup.string().required("Please select an issue type"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload = {
              issue_type_id: values.issue_type,
              description: values.description,
              image_url: values.image_url,
            };

            // API CALL inside try
            const res: any = await dispatch(addSupportTicket(payload)).unwrap();

            setSubmitting(false);

            // SUCCESS
            if (res?.ticket_id) {
              navigation.goBack();
            } else {
              Alert.alert("Error", "Failed to create ticket");
            }

          } catch (error: any) {
            setSubmitting(false);
            Alert.alert("Request Failed", error);
            console.log("TICKET ERROR:", error);
          }
        }}
      >

        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
        }) => (
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: Spacing.screenHorizontalPadding,
                backgroundColor: Colors.lightBg,
                flex: 1,
                paddingBottom: 110,
              }}
            >
              {/* ISSUE TYPE */}
              <Text style={[Typography.black14Medium, { marginTop: "6%" }]}>
                Issue Type
              </Text>

              <TouchableOpacity
                onPress={() => setOpen(!open)}
                style={styles.dropdownBox}
              >
                <Text
                  style={[
                    Typography.black14Regular,
                    {
                      color: values.issue_type
                        ? Colors.primaryText
                        : Colors.secondaryText,
                    },
                  ]}
                >
                  {
                    issueList.find((x) => x.id === values.issue_type)
                      ?.issue_type || "Select Issue Type"
                  }
                </Text>

                <Image
                  source={Icons.downArrow}
                  style={[styles.arrow, { transform: [{ rotate: open ? "180deg" : "0deg" }] }]}
                />
              </TouchableOpacity>

              {touched.issue_type && errors.issue_type && (
                <Text style={styles.errorText}>{errors.issue_type}</Text>
              )}

              {open && (
                <View style={styles.dropdownMenu}>
                  {issueList.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        setFieldValue("issue_type", item.id);
                        setOpen(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        values.issue_type === item.id && styles.selectedItem,
                      ]}
                    >
                      <Text style={Typography.black14Regular}>{item.issue_type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* DESCRIPTION */}
              <Text style={[Typography.black14Medium, { marginTop: 20 }]}>
                Description
              </Text>

              <TextInput
                placeholder="Describe your issue (10–250 characters)"
                style={styles.textArea}
                multiline
                value={values.description}
                placeholderTextColor={Colors.secondaryText}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
              />

              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              {/* IMAGE UPLOAD OR SHOW IMAGE */}
              <Text style={[Typography.black14Medium, { marginTop: 20 }]}>
                Attach Screenshot (Optional)
              </Text>

              {values.image_url ? (
                <TouchableOpacity
                  onPress={() => pickImage(setFieldValue)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: values.image_url }}
                    style={styles.previewImage}
                  />
                  <Text style={styles.changePhotoText}>Tap to change</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={() => pickImage(setFieldValue)}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <>
                      <Image source={Icons.upload} style={{ width: 26, height: 26 }} />
                      <Text style={{ color: Colors.primaryText, marginTop: 6 }}>
                        Upload
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* SUBMIT BUTTON */}
            <View style={styles.fixedBottom}>
              <CustomButton
                disabled={isSubmitting}
                title={isSubmitting ? "Submitting..." : "Submit"}
                onPress={handleSubmit}
              />
            </View>
          </Pressable>
        )}
      </Formik>
    </ViewContainer>
  );
};

export default RaiseTicketScreen;

//
// ---------------- STYLES ----------------
//
const styles = StyleSheet.create({
  dropdownBox: {
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrow: {
    width: 12,
    height: 7,
    resizeMode: "contain",
  },
  dropdownMenu: {
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  selectedItem: {
    backgroundColor: "#FFECE6",
  },
  textArea: {
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border20,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    color: Colors.primaryText,
  },
  uploadBox: {
    height: 140,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border20,
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginTop: 10,
  },
  changePhotoText: {
    textAlign: "center",
    marginTop: 8,
    color: Colors.primary,
    ...Typography.black14Medium,
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border20,
    backgroundColor: "#fff",
  },
  errorText: {
    ...Typography.black12Regular,
    color: Colors.error,
    marginTop: 4,
  },
});
