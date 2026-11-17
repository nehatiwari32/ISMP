import React, { useState, memo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
  Image,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { Icons } from "../../assets/icons";

interface InputFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  wrapperStyle?: ViewStyle;
  inputStyle?: TextStyle;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  secure?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  containerStyle,
  wrapperStyle,
  inputStyle,
  rightComponent,
  leftComponent,
  secure = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secure);

  const toggleSecure = () => setIsSecure(!isSecure);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (isFocused) return Colors.secondary;
    return Colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            Typography.black14Medium,
            { color: Colors.secondaryText, marginBottom: 8 },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          wrapperStyle,
          { borderColor: getBorderColor() },
        ]}
      >
        {leftComponent && <View style={styles.iconLeft}>{leftComponent}</View>}

        <TextInput
          style={[
            Typography.black14Regular,
            { color: Colors.primaryTextDark, flex: 1 },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secure ? (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconRight}>
            <Image
              source={isSecure ? Icons.eyeOff : Icons.eyeOn}
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        ) : (
          rightComponent && <View style={styles.iconRight}>{rightComponent}</View>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export default memo(InputField);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    height: 22,
    width: 22,
    resizeMode: "contain",
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
