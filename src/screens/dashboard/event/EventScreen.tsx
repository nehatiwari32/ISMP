import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import {
  AppTabBar,
  BannerSlider,
  HomeHeader,
  SectionDivider,
  ViewContainer,
} from "../../../components";
import { Colors } from "../../../theme/colors";
import { eventsTab } from "../../../utils/helper";
import { Icons } from "../../../assets/icons";
import { Spacing, Typography } from "../../../theme/typography";
import { Images } from "../../../assets/images";
import { fetchEventList } from "../../../redux/slices/eventSlice";

// Mock data for categories
const topCategories = [
  { id: "1", name: "Concerts", icon: Images.concertIMG },
  { id: "2", name: "Arts", icon: Images.concertIMG },
  { id: "3", name: "Fitness", icon: Images.concertIMG },
  { id: "4", name: "Business", icon: Images.concertIMG },
];

const EventScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { eventCategories, loading, page, hasMore } = useSelector(
    (state) => state.event
  );

  const [headerTab, setHeaderTab] = useState(0);
  const [activeTab, setActiveTab] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = (pageNum = 1) => {
    dispatch(fetchEventList({ page: pageNum, limit: 10 }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents(1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadEvents(page + 1);
    }
  };

  const handleTabChange = (index, tabLabel) => {
    setHeaderTab(index);
    const label = tabLabel?.toLowerCase();

    if (label === "global" || label === "localz" || label === "qa") {
      navigation.navigate("Home");
    } else if (label === "friends") {
      navigation.navigate("FriendScreen");
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const formatTime = (time) => {
    return moment(time, "HH:mm").format("h:mm A");
  };

  const formatPrice = (eventType, fee) => {
    if (eventType === "free") {
      return "Free";
    }
    return `₹${fee}`;
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Image source={item.icon} style={styles.categoryIcon} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEventCard = ({ item: event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetailsScreen", { eventId: event._id })}
    >
      <View style={styles.eventImageContainer}>
        <Image
          source={
            event.media_url
              ? { uri: event.media_url }
              : Images.defaultEventImage
          }
          style={styles.eventImage}
        />
        <View
          style={[
            styles.priceTag,
            event.event_type === "free" && { backgroundColor: Colors.secondary },
          ]}
        >
          <Text style={styles.priceText}>
            {formatPrice(event.event_type, event.entry_fee)}
          </Text>
        </View>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventLocation} numberOfLines={1}>
          {event.venue || "Venue not specified"}
        </Text>
        <Text style={styles.eventDate}>
          {formatDate(event.event_date)} • {formatTime(event.start_time)}
        </Text>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description}
        </Text>

        <View style={styles.eventFooter}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Image source={Icons.like} style={styles.statIcon} />
              <Text style={styles.statText}>
                {event.likes_count >= 1000
                  ? `${(event.likes_count / 1000).toFixed(1)}k`
                  : event.likes_count}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Image source={Icons.eyeOn} style={styles.statIcon} />
              <Text style={styles.statText}>
                {event.views_count >= 1000
                  ? `${(event.views_count / 1000).toFixed(1)}k`
                  : event.views_count}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            console.log("Join event:", event._id);
          }}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterText}>Filter</Text>
        <Image source={Icons.filter} style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderEventSection = ({ item: categoryData, index }) => {
    if (!categoryData.items || categoryData.items.length === 0) {
      return null;
    }

    return (
      <View style={styles.section} key={categoryData.category._id}>
        {renderSectionHeader(categoryData.category.category_name)}
        <FlatList
          data={categoryData.items}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsRowHorizontal}
          decelerationRate="fast"
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No events available at the moment</Text>
    </View>
  );

  // Extract categories for dropdown
  const allCategories =
    eventCategories?.map((cat) => cat.category).filter(Boolean) || [];

  return (
    <ViewContainer
      isHeader={false}
      isHomeHeader={true}
      backgroundColor={Colors.backgroundLight}
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <HomeHeader activeTab={headerTab} onTabChange={handleTabChange} />
      <SectionDivider />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;

          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Location and Categories Row */}
        <View style={styles.topSection}>
          <View style={styles.rowAlign}>
            <Image
              source={Icons.mapPin}
              tintColor={Colors.secondary}
              style={styles.locationIcon}
            />
            <Text style={styles.labelTxt}>Global</Text>
            <Image source={Icons.fillArrow} style={styles.fillIcon} />
          </View>

          <AppTabBar
            tabs={eventsTab}
            active={activeTab}
            onChange={(val) => setActiveTab(val)}
            categories={allCategories}
          />

          <TouchableOpacity style={styles.helpButton}>
            <Image source={Icons.help} style={styles.helpIcon} />
          </TouchableOpacity>
        </View>

        {/* All Categories Section */}
        <View style={styles.section}>
          <Text style={styles.allCategoriesTitle}>All Categories</Text>
          <FlatList
            data={topCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <BannerSlider />
        </View>

        {/* Dynamic Event Sections */}
        {loading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : eventCategories && eventCategories.length > 0 ? (
          <>
            {eventCategories.map((categoryData, index) =>
              renderEventSection({ item: categoryData, index })
            )}

            {loading && page > 1 && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </>
        ) : (
          renderEmptyState()
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </ViewContainer>
  );
};

export default EventScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: Colors.lightBg,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationIcon: {
    height: 16,
    width: 16,
    resizeMode: "contain",
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "38%",
  },
  fillIcon: {
    height: 10,
    width: 10,
    resizeMode: "contain",
    tintColor: Colors.secondary,
  },
  labelTxt: {
    ...Typography.black14Bold,
    color: Colors.secondary,
    marginTop: "1%",
  },
  helpButton: {
    padding: 4,
  },
  helpIcon: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    tintColor: Colors.secondary,
  },
  section: {
    marginTop: 10,
  },
  allCategoriesTitle: {
    ...Typography.black16Bold,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
    gap: 12,
  },
  categoryCard: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 42,
    resizeMode: "contain",
    marginBottom: 6,
  },
  categoryText: {
    ...Typography.black12Bold,
  },
  bannerContainer: {
    marginTop: 16,
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.screenHorizontalPadding,
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.black16Bold,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.filterBG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  filterText: {
    ...Typography.black12Medium,
  },
  filterIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  eventsRowHorizontal: {
    paddingHorizontal: Spacing.screenHorizontalPadding,
    gap: 12,
  },
  eventCard: {
    width: 180,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderRadius: 8,
    marginRight: 12,
  },
  eventImageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  priceTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    ...Typography.black10Bold,
    color: "#fff",
  },
  eventContent: {
    padding: 12,
  },
  eventLocation: {
    ...Typography.black11Bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  eventDate: {
    ...Typography.black12Medium,
    color: Colors.primary,
    marginBottom: 6,
  },
  eventTitle: {
    ...Typography.black13Bold,
    marginBottom: 6,
  },
  eventDescription: {
    ...Typography.black13Regular,
    color: Colors.secondaryText,
    lineHeight: 16,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 19,
    height: 19,
    resizeMode: "contain",
    tintColor: Colors.secondaryTextDark,
  },
  statText: {
    ...Typography.black12Regular,
    color: Colors.secondaryTextDark,
  },
  joinButton: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 50,
    alignSelf: "center",
  },
  joinButtonText: {
    ...Typography.black14Bold,
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
});