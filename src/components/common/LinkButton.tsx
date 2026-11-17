import React, { memo } from 'react';
import { Text, TouchableOpacity, StyleSheet, TextStyle, ViewStyle, Image } from 'react-native';
import { Colors } from '../../theme/colors';
import { scaleFont } from '../../utils/helper';
import { Typography } from '../../theme/typography';

interface LinkButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  underline?: boolean;
  disabled?: boolean;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  leftIcon?: any;
  iconColor?: any
}

const LinkButton: React.FC<LinkButtonProps> = ({
  title,
  onPress,
  color = Colors.primary,
  underline = false,
  disabled = false,
  textStyle,
  containerStyle,
  leftIcon,
  iconColor
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {leftIcon && <Image source={leftIcon} style={styles.arrowIcon} tintColor={iconColor} />}
      <Text
        style={[
          Typography.black14Bold,
          { color, textDecorationLine: underline ? 'underline' : 'none', opacity: disabled ? 0.6 : 1 },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(LinkButton, (prev, next) => prev.title === next.title && prev.disabled === next.disabled);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowIcon: {
    height: 22,
    width: 22,
    objectFit: 'contain'
  },
  text: {
    fontSize: scaleFont(14),
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
  },
});
