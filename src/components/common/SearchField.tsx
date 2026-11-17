import React, { memo, forwardRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Icons } from '../../assets/icons';

interface Props extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: ViewStyle;
}

const SearchField = forwardRef<TextInput, Props>(
  ({ placeholder, value, onChangeText, containerStyle, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.inputWrapper}>
          <Image source={Icons.search} style={styles.searchIcon} />

          <TextInput
            ref={ref}
            style={[Typography.black14Regular, { flex: 1, paddingVertical: 0 }]}
            placeholder={placeholder}
            placeholderTextColor={Colors.secondaryText}
            value={value}
            onChangeText={onChangeText}
            {...props}
          />
        </View>
      </View>
    );
  }
);

export default memo(SearchField);

const styles = StyleSheet.create({
  container: { marginBottom: 0 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: Colors.secondaryText,
  },
});
