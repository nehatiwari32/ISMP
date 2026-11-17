import React, {  useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

interface SearchDropdownProps {
  placeholder?: string;
  value: string;
  searchValue: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  list: any[];
  onSelect: (item: any) => void;
  onClose: () => void;
  showLocality?: boolean;
}

/**
 * Simple SearchDropdown Component
 * Use this if your existing SearchDropdown component has issues with onSelect
 */
const SimpleSearchDropdown: React.FC<SearchDropdownProps> = ({
  placeholder = 'Search...',
  searchValue,
  onChangeText,
  visible,
  list,
  onSelect,
  showLocality = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleSelect = (item: any) => {
    console.log('✅ SimpleSearchDropdown: Item selected', item);
    onSelect(item);
    // onClose(); // Don't call onClose here, let parent handle it
  };

  const renderItem = ({ item,  }: { item: any; index: number }) => {
    const displayName = item.locality_name || item.name || 'Unknown';
    const pincode = item.pincode || '';

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.suggestionText}>{displayName}</Text>
          {showLocality && pincode && (
            <Text style={styles.suggestionSubtext}>
              Pincode: {pincode}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        value={searchValue}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {visible && list.length > 0 && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item, index) => 
              item._id || item.locality_id || index.toString()
            }
            style={styles.flatList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {visible && list.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flatList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  suggestionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noResultsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    marginTop: -8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SimpleSearchDropdown;