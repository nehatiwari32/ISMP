import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";

import { ViewContainer, InputField } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";
import { Spacing } from "../../../theme/typography";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import { createEvent } from "../../../redux/slices/eventSlice"; 
import { EventValidationSchema } from "../../../utils/validation";

const AddEventScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get loading state from Redux
  const { loading } = useSelector((state: any) => state.event);

  // Categories list
  const categories = [
    { _id: "1", category_name: "Music & Concerts" },
    { _id: "2", category_name: "Arts & Culture" },
    { _id: "3", category_name: "Sports & Fitness" },
    { _id: "4", category_name: "Business & Professional" },
    { _id: "5", category_name: "Food & Drink" },
    { _id: "6", category_name: "Health & Wellness" },
    { _id: "7", category_name: "Technology" },
    { _id: "8", category_name: "Education" },
    { _id: "9", category_name: "Medical" },
    { _id: "10", category_name: "Entertainment" },
  ];

  // Initial Form Values
  const initialValues = {
    category_id: "1",
    category_name: "Music & Concerts",
    title: "",
    description: "",
    venue: "",
    event_date: new Date(),
    start_time: new Date(),
    event_type: "paid",
    entry_fee: "",
    terms_and_conditions: "",
    location: "Valasaravakkam",
  };

  // Modal States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeForAPI = (time: Date) => {
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSelectMedia = () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedMedia(response.assets[0]);
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      // Calculate end time (2 hours after start time)
      const endTime = new Date(values.start_time.getTime() + 2 * 60 * 60 * 1000);

      // Prepare event data
      const eventData = {
        category_id: values.category_id,
        category: values.category_name,
        title: values.title,
        description: values.description,
        venue: values.venue,
        event_date: values.event_date.toISOString(),
        start_time: formatTimeForAPI(values.start_time),
        end_time: formatTimeForAPI(endTime),
        event_type: values.event_type,
        entry_fee: values.event_type === "paid" ? parseFloat(values.entry_fee) : 0,
        terms_and_conditions: values.terms_and_conditions,
        media_url: selectedMedia?.uri || "",
        location: values.location,
      };

      console.log("Event Data:", eventData);

      // Dispatch the API call
      const result = await dispatch(createEvent(eventData) as any);

      if (createEvent.fulfilled.match(result)) {
        // Success - navigate back or show success message
        console.log("Event created successfully:", result.payload);
        navigation.goBack();
      } else {
        // Error handling
        console.error("Failed to create event:", result.payload);
        // You can show an error toast/alert here
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={EventValidationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit: formikSubmit,
        setFieldTouched,
      }) => (
        <ViewContainer
          isHeader={false}
          backgroundColor={Colors.backgroundLight}
          containerStyle={{ paddingHorizontal: 0 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              disabled={loading}
            >
              <Image source={Icons.arrowLeft} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Event</Text>
            <TouchableOpacity
              onPress={() => formikSubmit()}
              style={styles.postButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* User Info */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfo}>
                <Image source={Icons.addUser} style={styles.profileImage} />
                <Text style={styles.userName}>Nitin Kumar</Text>
              </View>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setShowLocationModal(true)}
                disabled={loading}
              >
                <Image
                  source={Icons.mapPin}
                  style={styles.locationIcon}
                  tintColor={Colors.primary}
                />
                <Text style={styles.locationText}>{values.location}</Text>
                <Image
                  source={Icons.downArrow}
                  style={styles.dropdownIcon}
                  tintColor={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Upload Media */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Upload Media</Text>
              {selectedMedia ? (
                <View style={styles.selectedMediaContainer}>
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    style={styles.selectedMediaImage}
                  />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => setSelectedMedia(null)}
                    disabled={loading}
                  >
                    <Image source={Icons.cross} style={styles.removeMediaIcon} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleSelectMedia}
                  disabled={loading}
                >
                  <Image source={Icons.upload} style={styles.uploadIcon} />
                  <Text style={styles.uploadText}>Upload from Gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Category<Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.categoryInput,
                  touched.category_id && errors.category_id && styles.inputError,
                ]}
                onPress={() => {
                  setShowCategoryModal(true);
                  setFieldTouched("category_id");
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.categoryText,
                    !values.category_name && styles.placeholderText,
                  ]}
                >
                  {values.category_name || "Select Category"}
                </Text>
                {values.category_name ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFieldValue("category_id", "");
                      setFieldValue("category_name", "");
                    }}
                    disabled={loading}
                  >
                    <Image source={Icons.cross} style={styles.clearIcon} />
                  </TouchableOpacity>
                ) : (
                  <Image source={Icons.downArrow} style={styles.clearIcon} />
                )}
              </TouchableOpacity>
              {touched.category_id && errors.category_id && (
                <Text style={styles.errorText}>{errors.category_id}</Text>
              )}
            </View>

            {/* Title */}
            <InputField
              label="Title"
              placeholder="Enter event name"
              value={values.title}
              onChangeText={handleChange("title")}
              onBlur={handleBlur("title")}
              error={touched.title && errors.title ? errors.title : ""}
              containerStyle={styles.inputContainer}
              editable={!loading}
            />

            {/* Description */}
            <InputField
              label="Description"
              placeholder="Write event details..."
              value={values.description}
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
              error={
                touched.description && errors.description
                  ? errors.description
                  : ""
              }
              multiline
              numberOfLines={4}
              containerStyle={styles.inputContainer}
              wrapperStyle={styles.textAreaWrapper}
              editable={!loading}
            />

            {/* Date and Time */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.sectionLabel}>Select Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setShowDatePicker(true)}
                  disabled={loading}
                >
                  <Text style={styles.dateTimeText}>
                    {formatDate(values.event_date)}
                  </Text>
                  <Image
                    source={Icons.calendar}
                    style={styles.dateTimeIcon}
                    tintColor={Colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.sectionLabel}>Select Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setShowTimePicker(true)}
                  disabled={loading}
                >
                  <Text style={styles.dateTimeText}>
                    {formatTime(values.start_time)}
                  </Text>
                  <Image
                    source={Icons.clock}
                    style={styles.dateTimeIcon}
                    tintColor={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Venue */}
            <InputField
              label="Venue"
              placeholder="Enter Venue"
              value={values.venue}
              onChangeText={handleChange("venue")}
              onBlur={handleBlur("venue")}
              error={touched.venue && errors.venue ? errors.venue : ""}
              containerStyle={styles.inputContainer}
              editable={!loading}
            />

            {/* Map */}
            <View style={styles.mapContainer}>
              <Image source={Images.map} style={styles.mapImage} />
              <TouchableOpacity style={styles.mapButton} disabled={loading}>
                <Image
                  source={Icons.mapPin}
                  style={styles.mapButtonIcon}
                  tintColor={Colors.primary}
                />
                <Text style={styles.mapButtonText}>Locate on map</Text>
              </TouchableOpacity>
            </View>

            {/* Event Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Event Type</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setFieldValue("event_type", "free");
                    setFieldValue("entry_fee", "");
                  }}
                  disabled={loading}
                >
                  <View style={styles.radioButton}>
                    {values.event_type === "free" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Free</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFieldValue("event_type", "paid")}
                  disabled={loading}
                >
                  <View style={styles.radioButton}>
                    {values.event_type === "paid" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Paid</Text>
                </TouchableOpacity>
              </View>

              {values.event_type === "paid" && (
                <InputField
                  placeholder="Enter Entry Fees"
                  value={values.entry_fee}
                  onChangeText={handleChange("entry_fee")}
                  onBlur={handleBlur("entry_fee")}
                  error={
                    touched.entry_fee && errors.entry_fee ? errors.entry_fee : ""
                  }
                  keyboardType="numeric"
                  containerStyle={[
                    styles.inputContainer,
                    { marginTop: 12, marginBottom: 0 },
                  ]}
                  editable={!loading}
                />
              )}
            </View>

            {/* Terms & Conditions */}
            <InputField
              label="Terms & Conditions"
              placeholder="Enter Terms & Condition"
              value={values.terms_and_conditions}
              onChangeText={handleChange("terms_and_conditions")}
              onBlur={handleBlur("terms_and_conditions")}
              error={
                touched.terms_and_conditions && errors.terms_and_conditions
                  ? errors.terms_and_conditions
                  : ""
              }
              multiline
              numberOfLines={5}
              containerStyle={styles.inputContainer}
              wrapperStyle={styles.textAreaWrapper}
              editable={!loading}
            />

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Creating Event...</Text>
            </View>
          )}

          {/* Date Picker Modal */}
          <DatePicker
            modal
            open={showDatePicker}
            date={values.event_date}
            mode="date"
            minimumDate={new Date()}
            onConfirm={(date) => {
              setShowDatePicker(false);
              setFieldValue("event_date", date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
          />

          {/* Time Picker Modal */}
          <DatePicker
            modal
            open={showTimePicker}
            date={values.start_time}
            mode="time"
            onConfirm={(time) => {
              setShowTimePicker(false);
              setFieldValue("start_time", time);
            }}
            onCancel={() => {
              setShowTimePicker(false);
            }}
          />

          {/* Category Selection Modal */}
          <Modal
            visible={showCategoryModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
                  >
                    <Image source={Icons.cross} style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={categories}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => {
                        setFieldValue("category_id", item._id);
                        setFieldValue("category_name", item.category_name);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>
                        {item.category_name}
                      </Text>
                      {values.category_name === item.category_name && (
                        <View style={styles.checkCircle}>
                          <Image
                            source={Icons.check}
                            style={styles.checkIcon}
                            tintColor={"#fff"}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Pressable>
          </Modal>

          {/* Location Selection Modal */}
          <Modal
            visible={showLocationModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowLocationModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowLocationModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Location</Text>
                  <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                    <Image source={Icons.cross} style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={[
                    "Valasaravakkam",
                    "Velachery",
                    "T Nagar",
                    "Anna Nagar",
                    "Adyar",
                  ]}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => {
                        setFieldValue("location", item);
                        setShowLocationModal(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>{item}</Text>
                      {values.location === item && (
                        <View style={styles.checkCircle}>
                          <Image
                            source={Icons.check}
                            style={styles.checkIcon}
                            tintColor={"#fff"}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Pressable>
          </Modal>
        </ViewContainer>
      )}
    </Formik>
  );
};

export default AddEventScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  headerTitle: {
    ...Typography.black18Bold,
    flex: 1,
    textAlign: "center",
  },
  postButton: {
    padding: 4,
    minWidth: 50,
    alignItems: "center",
  },
  postButtonText: {
    ...Typography.black16Bold,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    ...Typography.black16Bold,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  locationText: {
    ...Typography.black13Bold,
    color: Colors.primary,
  },
  dropdownIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    borderStyle: "dashed",
    paddingVertical: 40,
    gap: 12,
    backgroundColor: "#fff",
  },
  uploadIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: Colors.secondaryText,
  },
  uploadText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
  selectedMediaContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  selectedMediaImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    padding: 6,
  },
  removeMediaIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  categoryInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  categoryText: {
    ...Typography.black14Regular,
  },
  placeholderText: {
    color: Colors.secondaryText,
  },
  clearIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    tintColor: Colors.secondaryText,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.black12Regular,
    color: Colors.error,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textAreaWrapper: {
    minHeight: 120,
    alignItems: "flex-start",
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  dateTimeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  dateTimeText: {
    ...Typography.black14Regular,
  },
  dateTimeIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  mapContainer: {
    position: "relative",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    height: 150,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mapButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -85 }, { translateY: -20 }],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  mapButtonIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  mapButtonText: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    ...Typography.black14Regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryItemText: {
    ...Typography.black14Regular,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    ...Typography.black16Bold,
    color: "#fff",
    marginTop: 12,
  },
});