import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { scaleFont } from '../utils/helper';
import { InputField } from './common';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (category: string, subCategory: string) => void;
}

const AddCategoryModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  const handleSave = () => {
    const trimmedCategory = category.trim();
    const trimmedSubCategory = subCategory.trim();

    if (!trimmedCategory) return;
    onSave(trimmedCategory, trimmedSubCategory);
    setCategory('');
    setSubCategory('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Add Business Category</Text>

          {/* Category Input */}
          <InputField
            placeholder="Add Category"
            value={category}
            onChangeText={setCategory}
          />

          {/* Subcategory Input */}
          <InputField
            placeholder="Add Sub category"
            value={subCategory}
            onChangeText={setSubCategory}
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#fff', borderWidth: 1, borderColor:Colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: Colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleSave}>
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddCategoryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.primaryText,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
