import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Contacts from "react-native-contacts";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "../../../theme/colors";
import {
  CommonListingCard,
  SearchField,
  SuggestedFriendCard,
  ViewContainer,
} from "../../../components";
import { Spacing, Typography } from "../../../theme/typography";
import {
  randomSuggestedFrnd,
  setUserContacts,
} from "../../../redux/slices/friendSlice";
import { RootState } from "../../../redux/store";
import { getAppUrlLink } from "../../../redux/slices/authSlice";
import { sendInviteSMS } from "../../../utils/helper";

const FriendRequestScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const { appData } = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [randomSuggested, setRandomSuggested] = useState<any[]>([]);
  const [requestStatus, setRequestStatus] = useState<Record<string, boolean>>({});
  const [permissionDenied, setPermissionDenied] = useState(false);


  /* ---------------- LOAD CONTACTS ---------------- */
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setPermissionDenied(true);
            fetchRandomSuggestions();
            return;
          }
        }

        const allContacts = await Contacts.getAll();

        const cleaned = allContacts
          .filter((c) => c.phoneNumbers?.length > 0)
          .map((c) => ({
            id: c.recordID,
            name: c.displayName || "Unnamed Contact",
            phone: c.phoneNumbers[0]?.number || "",
          }));

        if (cleaned.length === 0) {
          setPermissionDenied(true);
          fetchRandomSuggestions();
          return;
        }

        dispatch(setUserContacts(cleaned));
        dispatch(getAppUrlLink())
        setContacts(cleaned);
      } catch (err) {
        console.log("Contacts error:", err);
        setPermissionDenied(true);
        fetchRandomSuggestions();
      }
    };

    loadContacts();
  }, []);

  /* ---------------- RANDOM SUGGESTIONS ---------------- */
  const fetchRandomSuggestions = async () => {
    try {
      const res = await dispatch(
        randomSuggestedFrnd()
      ).unwrap();

      setRandomSuggested(res?.users || []);
    } catch (err) {
      console.log("Random suggestion error:", err);
    }
  };

  /* ---------------- SEARCH ---------------- */
  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone.includes(searchText)
    );
  }, [contacts, searchText]);

  const filteredRandomSuggested = useMemo(() => {
    return randomSuggested.filter((item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [randomSuggested, searchText]);

  /* ---------------- REQUEST HANDLERS ---------------- */
  const handleSendRequest = async (item: any) => {
    // 🔹 Open SMS app
    await sendInviteSMS(item.phone, appData);

    // 🔹 Mark as requested (UI only)
    setRequestStatus((prev) => ({
      ...prev,
      [item.id]: true,
    }));
  };

  const handleRemoveRandom = (userId: string) => {
    setRandomSuggested((prev) =>
      prev.filter((item) => item.user_id !== userId)
    );
  };

  /* ---------------- RENDER ---------------- */
  return (
    <ViewContainer
      headerTitle="Friends"
      rightText="Skip"
      onRightPress={() => navigation.navigate("SetBusinessProfile")}
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.lightBg,
          paddingHorizontal: Spacing.screenHorizontalPadding,
        }}
      >
        {/* 🔍 Search */}
        <View style={styles.searchBox}>
          <SearchField
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by name"
          />
        </View>

        {/* -------- CONTACTS MODE -------- */}
        {!permissionDenied && filteredContacts.length > 0 && (
          <>
            <Text style={[Typography.black16Bold, { marginVertical: 12 }]}>
              Contact Friends
            </Text>

            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isRequested = requestStatus[item.id];

                return (
                  <CommonListingCard
                    title={item.name}
                    subTitle={item.phone}
                    buttonTitle={
                      isRequested ? "Request Sent" : "Send Request"
                    }
                    onPress={() =>
                      !isRequested && handleSendRequest(item)
                    }
                    containerStyle={{
                      opacity: isRequested ? 0.6 : 1,
                    }}
                    showIcon
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
            />
          </>
        )}

        {/* -------- RANDOM SUGGESTIONS MODE -------- */}
        {(permissionDenied || filteredContacts.length === 0) && (
          <FlatList
            data={filteredRandomSuggested}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            keyExtractor={(item, index) => `${item.user_id}-${index}`}
            contentContainerStyle={{ paddingVertical: 16 }}
            renderItem={({ item }) => (
              <SuggestedFriendCard
                friend={item}
                onRequestSent={handleRemoveRandom}
                onRemove={handleRemoveRandom}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No suggestions found.
              </Text>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ViewContainer>
  );
};

export default FriendRequestScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  searchBox: {
    marginTop: 18,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.secondaryText,
    marginTop: 30,
    fontSize: 14,
  },
});
