import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Contacts from "react-native-contacts";

import ViewContainer from "../../../components/ViewContainer";
import { Colors } from "../../../theme/colors";
import {
  AppTabBar,
  HomeHeader,
  SearchField,
  FriendRequestCard,
  SuggestedFriendCard,
  CommonListingCard,
} from "../../../components";

import { useDispatch, useSelector } from "react-redux";

import {
  getFriendRequestList,
  getSuggestedFriends,
  getFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeSuggestedFriend,
  removeSuggestedFrnd,
  setUserContacts,
} from "../../../redux/slices/friendSlice";

import { Icons } from "../../../assets/icons";
import { friendsTab } from "../../../utils/helper";
import { Typography } from "../../../theme/typography";

const LIMIT = 50;

const FriendScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { contacts } = useSelector(
    (state: any) => state.friend
  );


  const [activeTab, setActiveTab] = useState("friend_request");
  const [headerTab, setHeaderTab] = useState(4);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [acceptLoadingId, setAcceptLoadingId] = useState("");
  const [rejectLoadingId, setRejectLoadingId] = useState("");
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const [list, setList] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      let res;

      if (activeTab === "friend_request") {
        res = await dispatch(
          getFriendRequestList({ page: 1, limit: LIMIT, type: "received" })
        ).unwrap();

        setList(res?.requests || []);
      }

      if (activeTab === "suggestion") {
        res = await dispatch(
          getSuggestedFriends({
            page: 1,
            limit: LIMIT,
            search: searchText || undefined,
          })
        ).unwrap();

        setList(res?.items || []);
      }

      if (activeTab === "your_friends") {
        res = await dispatch(
          getFriends({
            page: 1,
            limit: LIMIT,
            search: searchText || undefined,
          })
        ).unwrap();

        setList(res?.items || []);
      }

      if (activeTab === "contact") {
        loadContacts();
      }
    } catch (e) {
      setList([])
      console.log("API Error:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchText, dispatch]);

  // 🔥 Load API based on TAB
  useEffect(() => {
    setSearchText("");
    loadData();
    loadContacts()
  }, [activeTab]);


  useEffect(() => {
    if (
      activeTab !== "suggestion" &&
      activeTab !== "your_friends"
    )
      return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadData();
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText]);

  // ✔ Accept request
  const handleAccept = async (item) => {
    const requestId = item?.requester?._id;

    setAcceptLoadingId(requestId);

    try {
      await dispatch(
        acceptFriendRequest({ requester_user_id: requestId })
      ).unwrap();

      setList((prev) => prev.filter((i) => i?.requester?._id !== requestId));
    } catch (e) {
      Alert.alert("Error", e?.data);
    } finally {
      setAcceptLoadingId("");
    }
  };

  // ✔ Reject request
  const handleReject = async (item) => {
    const requestId = item?.requester?._id;

    setRejectLoadingId(requestId);

    try {
      await dispatch(
        rejectFriendRequest({ requester_user_id: requestId })
      ).unwrap();

      setList((prev) => prev.filter((i) => i?.requester?._id !== requestId));
    } catch (e) {
      Alert.alert("Error", e?.data);
    } finally {
      setRejectLoadingId("");
    }
  };

  const handleRemoveFromList = (id) => {
    setList(prev => prev.filter(item => item.user_id !== id));
  };

  const removeFromSuggested = (userId) => {
    handleRemoveFromList(userId)
    dispatch(removeSuggestedFriend(userId))
    dispatch(getSuggestedFriends({ page: 1, limit: LIMIT })).unwrap()

  };

  const removeFriend = (userId) => {
    handleRemoveFromList(userId)
    dispatch(removeSuggestedFrnd({ target_user_id: userId }))
  };

  const loadContacts = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      const allContacts = await Contacts.getAll();

      const cleaned = allContacts
        .filter((c) => c.phoneNumbers?.length > 0)
        .map((c) => ({
          id: c.recordID,
          name: c.displayName || "Unnamed Contact",
          phone: c.phoneNumbers[0]?.number || "N/A",
        }));
      dispatch(setUserContacts(cleaned))
    } catch (err) {
      console.log(err);
    }
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyBox}>
        <Text style={Typography.black12Medium}>
          No data found
        </Text>
      </View>
    );
  };

  // 🔥 TAB BASED COMPONENT RENDER
  const renderItem = ({ item }) => {
    if (activeTab === "friend_request") {
      return (
        <FriendRequestCard
          item={item}
          acceptLoading={acceptLoadingId === item?.requester?._id}
          rejectLoading={rejectLoadingId === item?.requester?._id}
          onAccept={() => handleAccept(item)}
          onReject={() => handleReject(item)}
        />
      );
    }

    if (activeTab === "suggestion") {
      return (
        <SuggestedFriendCard friend={item} onRequestSent={removeFromSuggested} onRemove={removeFriend} />
      );
    }

    if (activeTab === "your_friends") {
      return (
        <CommonListingCard
          title={item?.name}
          subTitle={item?.username}
          image={item?.profile_photo_url}
          showIcon={true}
          isIcon={Icons.more}
        />
      );
    }

    if (activeTab === "contact") {
      return (
        <CommonListingCard
          title={item?.displayName}
          subTitle={item?.phoneNumbers[0]?.number}
          buttonTitle={"Send Request"}
          onPress={() => console.log("Pressed")}
          showIcon={true}
        />
      );
    }

    return null;
  };

  const getActiveLabel = () => {
    switch (activeTab) {
      case "friend_request":
        return "Friend Request";

      case "suggestion":
        return "Suggested Friends";

      case "your_friends":
        return `${list?.length || 0} Friends`;

      case "contact":
        return "";

      default:
        return "";
    }
  }

  const handleTabChange = (index, tabLabel) => {
    setHeaderTab(index);

    // Navigate based on tab selection
    const label = tabLabel?.toLowerCase();

    if (label === "global" || label === "localz" || label === "qa") {
      // Navigate to Home screen for these tabs
      navigation.navigate("Home");

    } else if (label === "events") {
      // Already on Events screen, do nothing
      return;
    }
  };

  return (
    <ViewContainer
      isHeader={false}
      isHomeHeader={true}
      backgroundColor={Colors.backgroundLight}
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <HomeHeader
        activeTab={headerTab}
        onTabChange={handleTabChange}
      />

      <View style={styles.wrapper}>
        {activeTab !== "friend_request" && <SearchField
          placeholder="Search by name, college, company..."
          value={""}
          onChangeText={() => { }}
        />}
        <View style={{ marginVertical: 16, }}>
          <AppTabBar
            tabs={friendsTab}
            active={activeTab}
            onChange={(val) => setActiveTab(val)}
          />
        </View>

        {activeTab === "contact" && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[Typography.black16Bold]}>  {getActiveLabel()}</Text>
          {activeTab === "suggestion" && <Text style={[Typography.black13Regular, { color: Colors.primary }]} onPress={() => navigation.navigate('AllSuggestedFriends')}>See All</Text>}
        </View>}

        {loading && list?.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            key={activeTab === "suggestion" ? "suggestionGrid" : "normalList"}
            data={list}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}

            // 🔥 Only suggestion shows 2-column grid
            numColumns={activeTab === "suggestion" ? 2 : 1}
            columnWrapperStyle={
              activeTab === "suggestion" ? { justifyContent: "space-around" } : null
            }
          />
        )}

        {activeTab === "friend_request" &&
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
              <Text style={[Typography.black16Bold]}>Invite Friends</Text>
              {/* <Text style={[Typography.black13Regular, { color: Colors.primary }]}>See All</Text> */}
            </View>

            <FlatList
              data={contacts.slice(0, 10)}
              keyExtractor={(item) => item._id?.toString()}
              renderItem={({ item }) => (
                <CommonListingCard
                  title={item.name}
                  subTitle={item.phone}
                  buttonTitle={"Invite "}
                  onPress={() => console.log("Pressed")}
                  showIcon={true}
                />
              )}
            />
          </>}
      </View>
    </ViewContainer>
  );
};

export default FriendScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.lightBg,
  },
  emptyBox: {
    marginTop: 50,
    alignItems: "center",
  },
});
