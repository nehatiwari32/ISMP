import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommonListingCard, SearchField } from '../../../components';
import { Colors } from '../../../theme/colors';
import { Icons } from '../../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import {
  getSearchUser,
  getRecentSearchHistory,
  deleteRecentSearch,
} from '../../../redux/slices/userActionSlice';
import { Typography } from '../../../theme/typography';

const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedFunction = (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedFunction;
};

const SearchUserScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const initialFetchDone = useRef(false);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  console.log('searchResults>>>>', searchResults);

  const focusInput = () => {
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;

      const fetchRecentSearches = async () => {
        try {
          const res = await dispatch(
            getRecentSearchHistory({ page: 1, limit: 5 }) as any,
          ).unwrap();
          setRecentSearches(res?.items || []);
        } catch (error) {
          console.error('Recent search error:', error);
        }
      };

      fetchRecentSearches();
    }
  }, [dispatch]);

  const triggerSearch = async text => {
    if (!text || text.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await dispatch(getSearchUser(text)).unwrap();
      setSearchResults(res?.items || []);
    } catch (e) {
      console.log('Search Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(triggerSearch, 600);

  const handleSearchChange = text => {
    setSearch(text);
    debouncedSearch(text);
  };

  const handleFriendAction = user => {
    navigation.navigate('OtherUserProfileScreen', { userId: user.user_id });
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      setDeletingItems(prev => new Set(prev).add(searchId));

      await dispatch(deleteRecentSearch({ searchId }) as any).unwrap();

      const res = await dispatch(
        getRecentSearchHistory({ page: 1, limit: 5 }) as any,
      ).unwrap();
      setRecentSearches(res?.items || []);
    } catch (error) {
    } finally {
      // Remove from loading state
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(searchId);
        return newSet;
      });
    }
  };

  console.log('recentSearches', recentSearches);

  /** EMPTY LIST UI */
  const renderRecentSearches = () => {
    if (search.trim().length === 0) {
      return (
        <View style={styles.recentSearchSection}>
          <View style={styles.recentSearchHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllRecentSearch')}
            >
              {recentSearches.length > 5 && (
                <Text style={styles.seeAll}>See all</Text>
              )}
            </TouchableOpacity>
          </View>
          {recentSearches.length > 0 ? (
            recentSearches.map((item, index) => (
              <TouchableOpacity
                onPress={item?.searched_user ? () => handleFriendAction(item) : undefined}>
                <CommonListingCard
                  key={item._id || index}
                  title={item?.search_query || item?.username}
                  subTitle={
                    item?.searched_user
                      ? item?.searched_user?.username ||
                      item?.searched_user?.name
                      : ''
                  }
                  image={
                    item?.searched_user?.profile_photo_url ||
                    item?.profile_photo_url
                  }
                  showIcon={true}
                  isIcon={
                    deletingItems.has(item?.search_id) ? 'loading' : Icons.cross
                  }
                  iconStyle={{
                    tintColor: Colors.primary,
                    height: 18,
                    width: 18,
                  }}
                  onMenuToggle={() => handleDeleteSearch(item?.search_id)}
                />
              </TouchableOpacity>

            ))
          ) : (
            <Text style={styles.noRecentText}>No recent searches</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Image source={Icons.search} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* BACK + SEARCH FIELD */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={Icons.arrowLeft} style={styles.backIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={focusInput}
          style={styles.searchWrapper}
          activeOpacity={1}
        >
          <SearchField
            ref={inputRef}
            placeholder="Search here..."
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH RESULTS */}
      <View style={styles.container}>
        {loading && searchResults.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.user_id}
            ListEmptyComponent={renderRecentSearches}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleFriendAction(item)}>
                <CommonListingCard
                  title={item?.full_name || item?.name}
                  subTitle={item?.username}
                  image={item?.profile_photo_url}
                  showIcon={false}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchUserScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  backIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: Colors.secondaryText,
  },

  searchWrapper: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  recentSearchSection: {
    flex: 1,
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 16,
  },

  sectionTitle: {
    ...Typography.black14Bold,
    paddingHorizontal: 4,
  },

  seeAll: {
    ...Typography.black13Regular,
    color: Colors.primary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  noRecentText: {
    ...Typography.black14Regular,
    textAlign: 'center',
    marginTop: 40,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    tintColor: Colors.secondaryText,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: 'center',
  },

  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
});
