import React, { useRef } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Colors } from "../../theme/colors";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
  setError?: (val: boolean) => void;
  inputWidth?: number;
  inputHieght?: number
}

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  error = false,
  setError,
  inputWidth = 50,
  inputHieght = 55
}) => {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    // Clear error when typing
    if (error && setError) {
      setError(false);
    }

    // Handle paste (multiple characters)
    if (text.length > 1) {
      const numericText = text.replace(/[^0-9]/g, '');
      const newOtp = [...value];

      // Fill as many fields as possible
      for (let i = 0; i < numericText.length && index + i < value.length; i++) {
        newOtp[index + i] = numericText[i];
      }

      onChange(newOtp);

      // Focus on next empty field or last field
      const nextIndex = Math.min(index + numericText.length, value.length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    const newOtp = [...value];

    if (numericText) {
      // Set the digit
      newOtp[index] = numericText;
      onChange(newOtp);

      // Move to next input
      if (index < value.length - 1) {
        inputs.current[index + 1]?.focus();
      } else {
        inputs.current[index]?.blur();
      }
    } else if (text === '' && value[index]) {
      // User cleared the field (not backspace, but direct clear)
      newOtp[index] = '';
      onChange(newOtp);
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    console.log(`🔑 Key: "${nativeEvent.key}" at index ${index}, value: "${value[index]}"`);

    if (nativeEvent.key === 'Backspace') {
      const newOtp = [...value];

      if (value[index]) {
        // Current field has value - clear it
        newOtp[index] = '';
        onChange(newOtp);
      } else if (index > 0) {
        // Current field is empty - move to previous and clear it
        newOtp[index - 1] = '';
        onChange(newOtp);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => ref && (inputs.current[index] = ref)}
          style={[
            styles.input,
            error ? styles.errorInput : styles.normalInput,
            { width: inputWidth, height: inputHieght }
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          placeholder=""
          selectTextOnFocus
          {...(index === 0
            ? {
              textContentType: "oneTimeCode",
              autoComplete:
                Platform.OS === "android"
                  ? "sms-otp"
                  : "one-time-code",
            }
            : {})}
        />
      ))}
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 7,
    textAlign: "center",
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },
  normalInput: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryExtraLight,
  },
  errorInput: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
});