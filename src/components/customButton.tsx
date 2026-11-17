import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../theme/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  textColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
  buttonStyle,
  textStyle,
  color = Colors.primary,
  textColor,
}) => {
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'filled' ? color : 'transparent';

  const borderColor =
    variant === 'outlined' ? color : 'transparent';

  const labelColor =
    variant === 'filled'
      ? textColor || '#fff'
      : textColor || color;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.6 : 1,
        },
        variant === 'outlined' && styles.outlined,
        buttonStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? '#fff' : color}
        />
      ) : (
        <Text style={[styles.text, { color: labelColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
export default memo(
  CustomButton,
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.loading === nextProps.loading &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.variant === nextProps.variant &&
    prevProps.color === nextProps.color &&
    prevProps.textColor === nextProps.textColor
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
  },
});
