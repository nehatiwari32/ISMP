import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View, Text } from 'react-native';
import { Colors } from '../../theme/colors';
import { Icons } from '../../assets/icons';
import { Typography } from '../../theme/typography';

interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  label?: string,
  backgroundColor?: any;
  borderColor?: any
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onPress, size = 20, label, backgroundColor, borderColor }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={[
          styles.box,
          { width: size, height: size, backgroundColor: backgroundColor ? backgroundColor : checked ? Colors.secondary  : '#fff', borderColor: borderColor ? borderColor : checked ? Colors.secondary : Colors.primary },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {checked && (
          <Image style={styles.checkMark} source={Icons.check} tintColor={'#fff'} />
        )}
      </TouchableOpacity>
      {label && <Text style={[Typography.black13Medium, { marginStart: 8 }]}>{label}</Text>}
    </View>
  );
};

export default CustomCheckbox;

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkedBox: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  checkMark: {
    height: 16,
    width: 16,
    objectFit: 'contain'
  }
});
