import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

import { CommonHeader, CustomButton, ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";
import { Typography } from "../../../theme/typography";
import { Spacing } from "../../../theme/typography";
import { Icons } from "../../../assets/icons";
import { viewEvent } from "../../../redux/slices/eventSlice";
import { formatCount, formatDate, formatTime } from "../../../utils/helper";

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { eventId } = route?.params;

  const [selectedTab, setSelectedTab] = useState<"interested" | "not_interested">("interested");
  const [eventDetails, setEventDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (eventId) {
      getEventDetails()
    }
  }, [eventId, dispatch]);

  const getEventDetails = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ unwrap() gives direct API payload
      const res = await dispatch(viewEvent(eventId)).unwrap();

      console.log("✅ Event Details:", res);
      setEventDetails(res);
    } catch (error: any) {
      console.log("❌ View Event Error:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, eventId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${eventDetails?.title}`,
        title: eventDetails?.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <ViewContainer
        isHeader={false}
        backgroundColor={Colors.backgroundLight}
        containerStyle={{ paddingHorizontal: 0 }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </ViewContainer>
    );
  }

  if (!eventDetails) {
    return (
      <ViewContainer
        isHeader={false}
        backgroundColor={Colors.backgroundLight}
        containerStyle={{ paddingHorizontal: 0 }}
      >
        <CommonHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(viewEvent(eventId) as any)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ViewContainer>
    );
  }

  return (
    <ViewContainer
      isHeader={false}
      backgroundColor={Colors.lightBg}
      containerStyle={{ paddingHorizontal: 0, paddingBottom: 120 }}
      bottomFixedComponent={
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "interested" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("interested")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "interested" && styles.tabTextActive,
              ]}
            >
              Interested
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "not_interested" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("not_interested")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "not_interested" && styles.tabTextActive,
              ]}
            >
              Not Interested
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.headerContainer}>
        <ImageBackground
          source={{ uri: eventDetails?.media_url }}
          style={styles.bannerGradient}
        >

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={Icons.arrowLeft}
              style={styles.backIcon}
            // tintColor="#fff"
            />
          </TouchableOpacity>
        </ImageBackground>
      </View>

      <View style={styles.contentContainer}>
        <View style={{ backgroundColor: '#fff', padding: 20 }}>
          {/* Fee Badge and Menu */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.feeBadge,
              ]}
            >
              <Text style={styles.feeText}>
                {`Fee: ₹${eventDetails.entry_fee}`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowMoreMenu(!showMoreMenu)}>
              <Image source={Icons.more} style={styles.menuIcon} />
            </TouchableOpacity>
            {showMoreMenu && (
              <>
                {/* 🔹 Popup Menu */}
                <View style={styles.moreMenu}>
                  {/* Share */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMoreMenu(false);
                      handleShare();
                    }}
                  >
                    <Image source={Icons.share} style={styles.menuIconSmall} />
                    <Text style={styles.menuText}>Share Event</Text>
                  </TouchableOpacity>

                  {/* Report */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMoreMenu(false);
                      console.log("Report clicked");
                      // navigation.navigate("ReportEvent", { eventId })
                    }}
                  >
                    <Image
                      source={Icons.report}
                      style={[styles.menuIconSmall, { tintColor: Colors.error }]}
                    />
                    <Text style={[styles.menuText, { color: Colors.error }]}>
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle}>{eventDetails.title}</Text>

          {/* Location */}
          <View style={styles.infoRow}>
            <Text style={styles.locationText}>
              {eventDetails.location || "Valasaravakkam, Chennai"}
            </Text>
          </View>

          {/* Date and Time */}
          <View style={styles.infoRow}>
            <Image
              source={Icons.calendar}
              style={styles.infoIcon}
              tintColor={Colors.primary}
            />
            <Text style={styles.dateTimeText}>
              {formatDate(eventDetails.event_date)}
            </Text>
            <Image
              source={Icons.clock}
              style={[styles.infoIcon, { marginLeft: 16 }]}
              tintColor={Colors.primary}
            />
            <Text style={styles.dateTimeText}>
              {formatTime(eventDetails.start_time)}
            </Text>
          </View>

          {/* Venue Address */}
          <View style={styles.infoRow}>
            <Image
              source={Icons.location}
              style={styles.infoIcon}
              tintColor={Colors.secondaryText}
            />
            <Text style={styles.venueText} numberOfLines={1}>
              {eventDetails.venue}
            </Text>
          </View>

          {/* Get Directions */}
          <TouchableOpacity style={styles.directionsButton}>
            <Text style={styles.directionsText}>Get Directions</Text>
            <Image
              source={Icons.chervonLeft}
              style={styles.arrowIcon}
              tintColor={Colors.primary}
            />
          </TouchableOpacity>

          {/* Registered Friends */}
          <View style={styles.friendsContainer}>
            <View style={styles.friendsAvatars}>
              {/* Mock avatars - replace with actual friend images */}
              {[1, 2, 3].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.friendAvatar,
                    index > 0 && { marginLeft: -12 },
                  ]}
                >
                  <Image
                    source={Icons.addUser}
                    style={styles.friendAvatarImage}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.friendsText}>
              +{eventDetails.registered_count || 25} Registered Friends
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Image
                source={Icons.like}
                style={styles.statIcon}
                tintColor={Colors.secondaryText}
              />
              <Text style={styles.statText}>
                {formatCount(eventDetails.likes_count)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Image
                source={Icons.eyeOn}
                style={styles.statIcon}
                tintColor={Colors.secondaryText}
              />
              <Text style={styles.statText}>
                {formatCount(eventDetails.views_count)}
              </Text>
            </View>
          </View>

          {/* Register Button */}
          <CustomButton
            title="Register"
            onPress={() => navigation.navigate("RegisterNowScreen")}
            buttonStyle={{ marginBottom: 10, width: "100%" }}
          />
        </View>

        {/* About this Event */}
        {eventDetails.description &&
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.sectionContent}>
              {eventDetails.description}
            </Text>
          </View>}

        {/* Terms & Condition */}
        {eventDetails.terms_and_conditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Condition</Text>
            <Text style={styles.sectionContent}>
              {eventDetails.terms_and_conditions}
            </Text>
          </View>
        )}

      </View>
    </ViewContainer>
  );
};

export default EventDetailsScreen;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: 240,
  },
  bannerGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },

  placeholderBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  placeholderIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  contentContainer: {
    marginHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feeBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },

  feeText: {
    ...Typography.black10Bold,
    color: "#fff",
  },
  menuIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    transform: [{ rotate: "90deg" }],
  },

  eventTitle: {
    ...Typography.black16Bold,
    fontSize: 20,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 8,
  },
  locationText: {
    ...Typography.black11Bold,
    color: Colors.primary,
  },
  dateTimeText: {
    ...Typography.black14Regular,
    color: Colors.primary,
    fontSize: 13,
  },
  venueText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
    fontSize: 13,
    flex: 1,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginLeft: '10%'
  },
  directionsText: {
    ...Typography.black12Regular,
    color: Colors.primary,
    textDecorationLine: 'underline',
    marginRight: 4,

  },
  arrowIcon: {
    width: 11,
    height: 11,
    resizeMode: "contain",
  },
  friendsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  friendsAvatars: {
    flexDirection: "row",
    marginRight: 12,
  },
  friendAvatar: {
    width: 24,
    height: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  friendAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  friendsText: {
    ...Typography.black13Regular,
    color: Colors.secondaryText,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#000"
  },
  statText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
  registerButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...Typography.black16Bold,
    color: "#fff",
  },
  section: {
    marginVertical: 20,
    backgroundColor: '#fff',
    padding: 20
  },
  sectionTitle: {
    ...Typography.black18Bold,
    fontSize: 17,
    marginBottom: 4,
  },
  sectionContent: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  tabText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
  tabTextActive: {
    ...Typography.black14Bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  errorText: {
    ...Typography.black16Bold,
    color: Colors.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.black14Bold,
    color: "#fff",
  },

  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 99,
  },

  moreMenu: {
    position: "absolute",
    top: 30, // 🔥 adjust if needed
    right: 0,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    zIndex: 100,
    elevation: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },

  menuIconSmall: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: Colors.primary,
  },

  menuText: {
    ...Typography.black14Regular,
    color: Colors.primaryTextDark,
  },

});