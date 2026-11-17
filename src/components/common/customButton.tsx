import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface CustomButtonProps {
  title?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  textColor?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
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
  accessibilityLabel,
  accessibilityHint,
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

  const computedLabel = accessibilityLabel || title || 'Button';
  const computedHint =
    accessibilityHint ||
    (loading
      ? 'Please wait, loading in progress.'
      : disabled
        ? 'Button disabled'
        : 'Double tap to activate.');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.6 : 1,
        },
        buttonStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={computedLabel}
      accessibilityHint={computedHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? '#fff' : color}
        />
      ) : (
        <Text style={[Typography.black16Bold, { color: labelColor }, textStyle]}>
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
    height: 44,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    width: '82%'
  },

});
