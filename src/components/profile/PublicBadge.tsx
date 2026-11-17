import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  Modal,
  Text,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useNavigation } from "@react-navigation/native";

import { Icons } from "../../assets/icons";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

type FieldVisibility = {
  visibility?: string;
  friends_except?: string[];
  specific_friends?: string[];
};

type Props = {
  fieldVisibility?: FieldVisibility;
  onChange?: (newValue: FieldVisibility) => void;
};

const OPTIONS = [
  "Public",
  "Friends",
  "Friends Except",
  "Specific Friends",
  "Not shown",
];

const PublicBadge: React.FC<Props> = ({ fieldVisibility = {}, onChange }) => {
  const navigation = useNavigation<any>();

  const [showMenu, setShowMenu] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("Public");

  const [friendsExcept, setFriendsExcept] = useState<string[]>([]);
  const [specificFriends, setSpecificFriends] = useState<string[]>([]);

  // -------------------------------------------------
  // Load initial values from server/state
  // -------------------------------------------------
  useEffect(() => {
    const {
      visibility = "public",
      friends_except = [],
      specific_friends = [],
    } = fieldVisibility || {};

    if (specific_friends?.length > 0) {
      setSelectedLabel("Specific Friends");
      setSpecificFriends(specific_friends);
    } else if (friends_except?.length > 0) {
      setSelectedLabel("Friends Except");
      setFriendsExcept(friends_except);
    } else if (visibility === "friends") {
      setSelectedLabel("Friends");
    } else if (visibility === "only_me") {
      setSelectedLabel("Not shown");
    } else {
      setSelectedLabel("Public");
    }
  }, [fieldVisibility]);

  // -------------------------------------------------
  // Emit final visibility update to parent
  // -------------------------------------------------
  const emitChange = (label: string) => {
    if (label === "Friends Except") {
      onChange?.({ visibility: "friends_except", friends_except: friendsExcept });
    } else if (label === "Specific Friends") {
      onChange?.({
        visibility: "specific_friends",
        specific_friends: specificFriends,
      });
    } else if (label === "Friends") {
      onChange?.({ visibility: "friends" });
    } else if (label === "Not shown") {
      onChange?.({ visibility: "only_me" });
    } else {
      onChange?.({ visibility: "public" });
    }
  };

  // -------------------------------------------------
  // Handle selecting visibility option
  // -------------------------------------------------
  const handleOptionTap = (opt: string) => {
    setSelectedLabel(opt);
    setShowMenu(false);

    if (opt === "Friends Except" || opt === "Specific Friends") {
      const alreadySelected =
        opt === "Friends Except" ? friendsExcept : specificFriends;

      navigation.navigate("FriendPicker", {
        title: opt === "Friends Except" ? "Exclude Friends" : "Select Friends",
        selectedList: alreadySelected,
        onSave: (list: string[]) => handleSaveFriends(opt, list),
      });

      return;
    }

    emitChange(opt);
  };

  // -------------------------------------------------
  // Handle save from full-screen Friend Picker
  // -------------------------------------------------
  const handleSaveFriends = (label: string, list: string[]) => {
    if (label === "Friends Except") {
      setFriendsExcept(list);
      onChange?.({ visibility: "friends_except", friends_except: list });
    } else {
      setSpecificFriends(list);
      onChange?.({ visibility: "specific_friends", specific_friends: list });
    }
  };

  return (
    <>
      {/* Badge UI */}
      <TouchableOpacity style={styles.badge} onPress={() => setShowMenu(true)}>
        <Image source={Icons.fillEye} style={styles.eye} />
        <Text style={styles.badgeText}>{selectedLabel}</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          {Platform.OS === "ios" ? (
            <BlurView style={styles.blur} blurType="dark" blurAmount={4} />
          ) : (
            <View style={styles.blur} />
          )}

          <View style={styles.sheet}>
            <View style={styles.drag} />

            <View style={styles.headerRow}>
              <Text style={styles.heading}>WHO CAN SEE?</Text>
              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Image source={Icons.cross} style={styles.cross} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => handleOptionTap(opt)}
              >
                <View
                  style={[
                    styles.radio,
                    selectedLabel === opt && styles.radioSelected,
                  ]}
                >
                  {selectedLabel === opt && <View style={styles.radioInner} />}
                </View>

                <Text style={styles.optionText}>{opt}</Text>

                {opt === "Friends Except" && friendsExcept.length > 0 && (
                  <Text style={styles.smallInfo}>
                    {friendsExcept.length} excluded
                  </Text>
                )}
                {opt === "Specific Friends" && specificFriends.length > 0 && (
                  <Text style={styles.smallInfo}>
                    {specificFriends.length} selected
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PublicBadge;

// -------------------------------------------------
// Styles
// -------------------------------------------------
const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  eye: { width: 14, height: 14 },
  badgeText: { ...Typography.black12Regular, color: Colors.primary },

  modalWrapper: { flex: 1, justifyContent: "flex-end" },
  blur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 40,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  drag: {
    width: 70,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  heading: { ...Typography.black14Medium, color: Colors.secondaryText },
  cross: { width: 22, height: 22, tintColor: Colors.secondaryText },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  optionText: {
    ...Typography.black14Regular,
    marginLeft: 12,
    flex: 1,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border20,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.secondary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },

  smallInfo: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
    marginRight: 6,
  },
});
