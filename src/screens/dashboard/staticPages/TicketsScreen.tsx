import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "@react-native-community/blur";
import { useDispatch } from "react-redux";

import { Icons } from "../../../assets/icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../../../theme/colors";
import { Spacing, Typography } from "../../../theme/typography";
import { getSupportList } from "../../../redux/slices/profileSlice";
import { capitalizeFirstLetter, formatFullDate } from "../../../utils/helper";

const LIMIT = 10;

const TicketsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // -----------------------------
  // API CALL
  // -----------------------------
  const loadTickets = async (requestedPage = 1) => {
    if (loading || (!hasMore && requestedPage !== 1)) return;

    setLoading(true);

    try {
      const res: any = await dispatch(
        getSupportList({ page: requestedPage, limit: LIMIT })
      ).unwrap();

      const items = res?.items || [];
      console.log('items>>>>', items);

      if (requestedPage === 1) {
        setTickets(items);
      } else {
        setTickets((prev) => [...prev, ...items]);
      }

      setHasMore(items.length === LIMIT);
      setPage(requestedPage);
    } catch (error) {
      console.log("Error fetching tickets:", error);
    }

    setLoading(false);
  };

  // Load page 1
  useFocusEffect(
    React.useCallback(() => {
      loadTickets(1);
    }, [])
  );

  const loadMore = () => {
    if (hasMore && !loading) {
      loadTickets(page + 1);
    }
  };

  const handleTicketPress = (ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTicket(null), 300);
  };

  const handleAddPress = () => {
    navigation.navigate("RaiseTicketScreen");
  };

  const renderTicketCard = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[Typography.black14Bold, { width: '80%' }]}>Ticket ID: #{item.ticket_id}</Text>

        <View
          style={[
            styles.statusBadge,
            item.status === "pending"
              ? styles.pendingBadge
              : styles.resolvedBadge,
          ]}
        >
          <Text style={[Typography.black12Regular, { color: "#fff" }]}>
            {capitalizeFirstLetter(item.status)}
          </Text>
        </View>
      </View>

      <Text style={[Typography.black14Medium, { color: Colors.primary }]}>
        {item.issue_type}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          Typography.black14Regular,
          { color: Colors.secondaryText, marginTop: 4 },
        ]}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={Icons.arrowLeft} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={Typography.black18Bold}>Tickets</Text>

          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Text style={[Typography.black20Medium, { color: "#fff" }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <FlatList
          data={tickets}
          renderItem={renderTicketCard}
          keyExtractor={(item) => item.ticket_id}
          contentContainerStyle={[
            styles.listContainer,
            tickets.length === 0 && { flex: 1, justifyContent: "center" }
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading && tickets.length > 0 ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Tickets Available</Text>
              </View>
            )
          }
        />

        {/* DETAILS MODAL */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurAmount={2}
              blurType="dark"
            />

            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Image
                  source={Icons.cross}
                  style={styles.closeIcon}
                  tintColor="#fff"
                />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedTicket && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text
                        style={[
                          Typography.black14Bold,
                          { color: Colors.gray30 },
                        ]}
                      >
                        TICKET ID : #{selectedTicket.ticket_id}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          selectedTicket.status === "pending"
                            ? styles.pendingBadge
                            : styles.resolvedBadge,
                        ]}
                      >
                        <Text style={[Typography.black12Regular, { color: "#fff" }]}>
                          {capitalizeFirstLetter(selectedTicket?.status)}
                        </Text>
                      </View>
                    </View>

                    {/* ISSUE TYPE */}
                    <View style={styles.modalSection}>
                      <Text style={Typography.black14Medium}>Issue Type</Text>
                      <View style={styles.inputField}>
                        <Text style={Typography.black14Bold}>
                          {selectedTicket?.issue_type}
                        </Text>
                      </View>
                    </View>

                    {/* DESCRIPTION */}
                    <View style={styles.modalSection}>
                      <Text style={Typography.black14Medium}>
                        Issue Description
                      </Text>
                      <View style={[styles.inputField, styles.textAreaField]}>
                        <Text style={Typography.black14Bold}>
                          {selectedTicket?.description}
                        </Text>
                      </View>
                    </View>

                    {/* CREATED DATE */}
                    <View style={styles.modalSection}>
                      <Text style={Typography.black14Medium}>Created On</Text>
                      <View style={styles.inputField}>
                        <Text style={Typography.black14Bold}>
                          {formatFullDate(selectedTicket.created_at)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default TicketsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    height: 20,
    width: 20,
    objectFit: "contain",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: "#FFF",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 30,
  },

  pendingBadge: {
    backgroundColor: "#FF9100",
  },
  resolvedBadge: {
    backgroundColor: "#09B265",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 10,
    maxHeight: "85%",
  },
  closeButton: {
    position: "absolute",
    top: -44,
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  modalSection: {
    marginBottom: 20,
  },

  inputField: {
    borderWidth: 1,
    borderColor: Colors.border20,
    borderRadius: 4,
    marginTop: '2%',
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textAreaField: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  closeIcon: {
    height: 20,
    width: 20,
    objectFit: 'contain'
  },
  dropdownIcon: {
    height: 5,
    width: 9,
    objectFit: "contain",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },

  emptyText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
    textAlign: "center",
  },

});
