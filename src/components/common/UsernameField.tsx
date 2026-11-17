import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import InputField from "./InputField";
import { Colors } from "../../theme/colors";
import { checkExistingUserId } from "../../redux/slices/authSlice";
import { Typography } from "../../theme/typography";
import { SPECIAL_CHARS } from "../../utils/helper";

const UsernameField = ({ values, handleChange, handleBlur, errors, touched, label=true }: any) => {
  const dispatch = useDispatch<any>();

  const [username, setUsername] = useState(values?.user_id);
  const [localMsg, setLocalMsg] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 🔥 Generate Suggestions
  const generateSuggestions = (name: string) => {
    if (!name) return [];

    const base = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const randomNumber = () => Math.floor(100 + Math.random() * 900); // 3 digit
    const special = SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];

    return [
      `${base}${special}${randomNumber()}`,
      `${base}${randomNumber()}${special}`,
      `${special}${base}${randomNumber()}`
    ];
  };

  // 🔥 Debounced API Check
  useEffect(() => {
    if (!username) {
      setLocalMsg("");
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    if (username.length < 3) {
      setLocalMsg("Minimum 3 characters required");
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setIsChecking(true);
        setLocalMsg("Checking availability...");
        setSuggestions([]);

        const res: any = await dispatch(
          checkExistingUserId({ user_id: username })
        ).unwrap();

        if (res?.statusCode === 200 || res?.statusCode === "200") {
          setIsAvailable(true);
          setLocalMsg(res?.message || "Available");
        } else {
          setIsAvailable(false);
          setLocalMsg(res?.message || "Unavailable");

          // Generate suggestions if username is NOT available
          setSuggestions(generateSuggestions(username));
        }
      } catch (err: any) {
        console.log('err>>>>>', err);

        const msg =
          err?.message ||
          err?.data?.message ||
          err?.data ||
          err?.error ||
          err ||
          "Something went wrong";

        setIsAvailable(false);
        setLocalMsg(String(msg));
        setSuggestions(generateSuggestions(username));
      } finally {
        setIsChecking(false);
      }
    }, 700);

    return () => clearTimeout(delay);
  }, [username]);

  // 🔍 Ensure only string is returned to UI
  const getErrorText = () => {
    if (touched?.user_id && errors?.user_id) return String(errors?.user_id);
    if (isChecking) return "Checking availability...";
    if (!isAvailable && localMsg && !isChecking) return String(localMsg);
    if (username?.length < 3 && username?.length > 0) return String(localMsg);
    return "";
  };

  const showSuccess = isAvailable && !isChecking && username?.length >= 3;

  return (
    <>
      <InputField
        label={label ? "Create User ID/User name" : ""}
        placeholder="Create User ID / Username"
        value={username}
        onChangeText={(text: string) => {
          setUsername(text);
          handleChange("user_id")(text);
        }}
        onBlur={handleBlur("user_id")}
        error={getErrorText()}
        // rightComponent={
        //   showSuccess ? (
        //     <View style={styles.row}>
        //       <Image
        //         source={Icons.check}
        //         style={styles.successIcon}
        //         tintColor={Colors.secondary}
        //       />
        //       <Text style={[Typography.black12Regular, { color: Colors.secondary }]}>
        //         Available
        //       </Text>
        //     </View>
        //   ) : isAvailable === false ? (
        //     <View style={styles.row}>
        //       <Image
        //         source={Icons.cross}
        //         style={styles.errorIcon}
        //         tintColor={Colors.error}
        //       />
        //       <Text style={[Typography.black12Regular, { color: Colors.error }]}>
        //         Taken
        //       </Text>
        //     </View>
        //   ) : null
        // }
      />

      {/* ⭐ Suggestion Button */}
      {!isAvailable && suggestions.length > 0 && (
        <TouchableOpacity>
          <Text style={styles.suggestText}>
            Suggest a Username
          </Text>
        </TouchableOpacity>
      )}

      {/* ⭐ Suggestion List */}
      {!isAvailable && suggestions.length > 0 && (
        <View style={styles.suggestionList}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setUsername(item);
                handleChange("user_id")(item);
                setIsAvailable(null);
              }}
            >
              <Text style={styles.suggestionItem}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

export default UsernameField;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  successIcon: {
    width: 12,
    height: 12,
    tintColor: Colors.secondary,
    resizeMode: "contain",
  },
  errorIcon: {
    width: 12,
    height: 12,
    tintColor: Colors.error,
    resizeMode: "contain",
  },
  suggestText: {
    textAlign: "center",
    marginTop: 4,
    ...Typography.black13Regular,
    color: Colors.secondary,

  },
  suggestionList: {
    marginTop: 6,
    paddingHorizontal: 8,
  },
  suggestionItem: {
    color: Colors.primary,
    paddingVertical: 4,
    textAlign: "center",
    ...Typography.black14Regular
  }
});
