import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  UIManager,
  ScrollView,
  ImageBackground,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useRoute } from '@react-navigation/native';

import { Colors } from '../../../theme/colors';
import { Icons } from '../../../assets/icons';
import { Images } from '../../../assets/images';
import {
  AppAvatar,
  GradientBox,
  ViewContainer,
} from '../../../components';
import { Spacing, Typography } from '../../../theme/typography';
import { fetchOtherUserProfile } from '../../../redux/slices/postSlice';
import { postCategoryData } from '../../../utils/helper';
import {
  sendFriendRequest,
  cancelFriendRequest,
} from '../../../redux/slices/friendSlice';
import {
  blockUser,
  unFollowUser,
  unFriendUser,
} from '../../../redux/slices/userActionSlice';
import { unblockUserAsync } from '../../../redux/slices/profileSlice';
import Toast from 'react-native-toast-message';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OtherUserProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { otherUserData } = useSelector((state: any) => state.post);

  const userId = (route.params as any)?.userId;
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [requestSentTime, setRequestSentTime] = useState<number | null>(null);
  const [canCancelRequest, setCanCancelRequest] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        dispatch(fetchOtherUserProfile(userId) as any);
      }
    }, [userId, dispatch]),
  );

  // ✅ Check if user can cancel request (within 1 minute)
  useEffect(() => {
    if (requestSentTime) {
      const checkCancelability = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - requestSentTime;
        const oneMinute = 60 * 1000; // 1 minute in milliseconds

        if (elapsedTime < oneMinute) {
          setCanCancelRequest(true);
        } else {
          setCanCancelRequest(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      };

      // Check immediately
      checkCancelability();

      // Check every second
      timerRef.current = setInterval(checkCancelability, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setCanCancelRequest(false);
    }
  }, [requestSentTime]);

  // ✅ Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);


  const displayProfile = otherUserData?.user_info;
  const friendsStatus = otherUserData?.user_info?.friends_status;
  const followStatus = otherUserData?.user_info?.follow_status;
  const friendRequestStatus = otherUserData?.user_info?.friend_request_status;
  const friendRequestedUpdatedAt =
    otherUserData?.user_info?.friend_requested_updated_at;
  const blockStatus = otherUserData?.user_info?.blocked_status;
  const showUnfriend = friendsStatus === true;
  const showUnfollow = followStatus === 'following';

  useEffect(() => {
    if (friendRequestStatus === 'pending' && friendRequestedUpdatedAt) {
      const serverTime = new Date(friendRequestedUpdatedAt).getTime();
      setRequestSentTime(serverTime);
    } else {
      setRequestSentTime(null);
    }
  }, [friendRequestStatus, friendRequestedUpdatedAt]);

  const getUpdatedPostCategoryData = () => {
    const stats = otherUserData?.post_type_stats || {};

    // ✅ CALL the function (important)
    const baseData = postCategoryData(otherUserData);

    return baseData.map(item => {
      let count = 0;
      let type = '';

      if (item.title === 'Global Post') {
        count = stats.global || 0;
        type = 'global';
      } else if (item.title === 'Locality Post') {
        count = stats.pincode || 0;
        type = 'pincode';
      } else if (item.title === 'Localz Info') {
        count = stats.locality_info || 0;
        type = 'locality_info';
      } else if (item.title === 'Localz Problems') {
        count = stats.locality_problems || 0;
        type = 'locality_problems';
      } else if (item.title === 'Que/Ans Post') {
        count = stats.QA || 0;
        type = 'QA';
      } else if (item.title === 'District Post') {
        count = stats.district || 0;
        type = 'district';
      }

      return { ...item, count, type };
    });
  };

  const dynamicPostCategoryData = getUpdatedPostCategoryData();

  const stats = [
    {
      label: 'Posts',
      value: otherUserData?.total_posts,
      navigation: 'PostCategoriesScreen',
    },
    {
      label: 'Friends',
      value: otherUserData?.total_friends,
      navigation: 'FriendScreen',
    },
    {
      label: 'Followers',
      value: otherUserData?.total_followers,
      navigation: 'FollowersList',
    },
    {
      label: 'Following',
      value: otherUserData?.total_following,
      navigation: 'FollowingList',
    },
    { label: 'Likes', value: otherUserData?.total_likes, navigation: '' },
  ];

  // ✅ Handle post category card click
  const handlePostCategoryClick = useCallback(
    (item: any) => {
      if (item.count > 0 && userId) {
        navigation.navigate('FriendPostScreen', {
          friendId: userId,
          type: item.type,
        });
      }
    },
    [userId, navigation],
  );

  // ✅ Send Friend Request
  const handleSendRequest = async () => {
    try {
      setLoading(true);

      await dispatch(sendFriendRequest({ target_user_id: userId })).unwrap();
      // Refresh profile to get updated status
      await dispatch(fetchOtherUserProfile(userId) as any);

      Alert.alert('Success', 'Friend request sent successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.data || 'Failed to send request');
      console.log('Request failed', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel Friend Request
  const handleCancelRequest = async () => {
    try {
      setLoading(true);

      await dispatch(cancelFriendRequest({ target_user_id: userId })).unwrap();

      // Clear the request sent time
      setRequestSentTime(null);

      // Refresh profile to get updated status
      await dispatch(fetchOtherUserProfile(userId) as any);

      Alert.alert('Success', 'Friend request cancelled');
    } catch (err: any) {
      Alert.alert('Error', err?.data || 'Failed to cancel request');
      console.log('Cancel request failed', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Message (for friends)
  const handleMessage = () => {
    navigation.navigate('ChatScreen', { userId: userId });
  };

  // ✅ Unfriend User
  const handleUnfriend = async () => {
    Alert.alert(
      'Unfriend User',
      'Are you sure you want to unfriend this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setMenuVisible(false);

              await dispatch(unFriendUser({ friend_user_id: userId })).unwrap();

              await dispatch(fetchOtherUserProfile(userId) as any);

              Alert.alert('Success', 'User unfriended successfully');
            } catch (err: any) {
              Alert.alert('Error', err?.data || 'Failed to unfriend user');
              console.log('Unfriend failed', err);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ✅ Block User
  const handleBlock = async () => {
    Alert.alert('Block User', 'Are you sure you want to block this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            setMenuVisible(false);

            await dispatch(blockUser({ blocked_user_id: userId })).unwrap();

            Alert.alert('Success', 'User blocked successfully');
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err?.data || 'Failed to block user');
            console.log('Block failed', err);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleUnblock = async () => {
    try {
      const res: any = await dispatch(
        unblockUserAsync({
          unblocked_user_id: userId,
        }),
      ).unwrap();

      setShowModal(false);
      setSelectedUser(null);

      await dispatch(fetchOtherUserProfile(userId));

      Toast.show({
        type: 'success',
        text1: res?.message || 'User unblocked successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Failed to unblock user',
      });
    }
  };

  // ✅ Unfollow User
  const handleUnfollow = async () => {
    Alert.alert(
      'Unfollow User',
      'Are you sure you want to unfollow this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setMenuVisible(false);

              await dispatch(unFollowUser({ follow_user_id: userId })).unwrap();

              // Refresh profile
              await dispatch(fetchOtherUserProfile(userId) as any);

              Alert.alert('Success', 'User unfollowed successfully');
            } catch (err: any) {
              Alert.alert('Error', err?.data || 'Failed to unfollow user');
              console.log('Unfollow failed', err);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ✅ Get button text and handler based on friendship status
  console.log('friendsStatus>>>>', friendsStatus);

  const getButtonConfig = () => {
    if (blockStatus === true) {
      return {
        text: 'Blocked',
        handler: undefined,
        disabled: true,
      };
    }

    if (friendRequestStatus === 'accepted') {
      return {
        text: 'Message',
        handler: handleMessage,
        disabled: false,
      };
    }

    if (friendRequestStatus === 'pending') {
      if (canCancelRequest) {
        return {
          text: 'Cancel Request',
          handler: handleCancelRequest,
          disabled: false,
        };
      }

      return {
        text: 'Requested',
        handler: () => { },
        disabled: true,
      };
    }

    return {
      text: 'Send Request',
      handler: handleSendRequest,
      disabled: false,
    };
  };

  const buttonConfig = getButtonConfig();

  const renderCard = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() => handlePostCategoryClick(item)}
        disabled={item.count === 0}
        activeOpacity={0.7}
      >
        <GradientBox colors={['#FFF7F3', '#FFE9E2']}>
          <View>
            <Text style={Typography.black16Bold}>{item.count}</Text>
            <Text
              style={[
                Typography.black12Regular,
                { color: Colors.secondaryText, marginTop: 2 },
              ]}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.iconBg} />
          <Image source={item.icon} style={styles.icon} />
        </GradientBox>
      </TouchableOpacity>
    );
  };

  // ✅ Menu Options Component
  const MenuModal = () => (
    <Modal
      visible={menuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          {/* ✅ If BLOCKED → Show ONLY Unblock */}
          {blockStatus === true ? (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                setSelectedUser(displayProfile);
                setShowModal(true);
              }}
            >
              <Image
                source={Icons.blockUser}
                style={styles.menuIcon}
                tintColor="red"
              />
              <Text style={[styles.menuText, { color: 'red' }]}>
                Unblock User
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* ✅ Show ONLY if friend */}
              {showUnfriend && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleUnfriend}
                  activeOpacity={0.7}
                >
                  <Image source={Icons.unfriend} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Unfriend User</Text>
                </TouchableOpacity>
              )}

              {/* ✅ Block always visible */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleBlock}
                activeOpacity={0.7}
              >
                <Image source={Icons.blockUser} style={styles.menuIcon} />
                <Text style={styles.menuText}>Block User</Text>
              </TouchableOpacity>

              {/* ✅ Show ONLY if following */}
              {showUnfollow && (
                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={handleUnfollow}
                  activeOpacity={0.7}
                >
                  <Image
                    source={Icons.notification}
                    style={styles.menuIcon}
                    tintColor={Colors.primary}
                  />
                  <Text style={[styles.menuText, { color: Colors.primary }]}>
                    Unfollow User
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );

  console.log('displayProfile?.username', displayProfile?.username);

  return (
    <ViewContainer
      isHeader
      headerTitle="Profile"
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: Colors.lightBg, flex: 1 }}
      >
        <View>
          <Image
            source={
              displayProfile?.cover_photo_url
                ? { uri: displayProfile?.cover_photo_url }
                : Images.coverPhoto
            }
            style={styles.coverImage}
          />
          <View style={styles.avatarWrap}>
            <AppAvatar
              imageUrl={displayProfile?.profile_photo_url}
              name={displayProfile?.name || displayProfile?.full_name}
              size={85}
              borderWidth={2}
            />
          </View>
        </View>

        <View style={{ marginTop: 50 }}>
          <View style={{ alignSelf: 'center' }}>
            {displayProfile?.name && (
              <View style={styles.centerRow}>
                <Text style={Typography.black14Bold}>
                  {displayProfile?.name || displayProfile?.full_name}
                </Text>
              </View>
            )}
          </View>
          {displayProfile?.username && (
            <View style={styles.centerRow}>
              <Text
                style={[
                  Typography.black14Regular,
                  { color: Colors.secondaryText, textAlign: 'center' },
                ]}
              >
                {displayProfile?.username}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          {stats.map((item, i) => (
            <View
              key={i}
              style={[
                styles.statBox,
                i < stats.length - 1 && styles.statBorder,
              ]}
            >
              <Text style={Typography.black16Bold}>{item.value}</Text>
              <Text
                style={[
                  Typography.black12Regular,
                  { color: Colors.secondaryText },
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ✅ Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.messageButton,
              buttonConfig.disabled && styles.disabledButton,
            ]}
            onPress={buttonConfig.handler}
            disabled={buttonConfig.disabled || loading}
          >
            {loading ? (
              <ActivityIndicator size={'small'} color={Colors.primary} />
            ) : (
              <Text
                style={[
                  Typography.black14Medium,
                  {
                    color: buttonConfig.disabled
                      ? Colors.secondaryText
                      : Colors.primary,
                  },
                ]}
              >
                {buttonConfig.text}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setMenuVisible(true)}
          >
            <Image
              source={Icons.more}
              style={[styles.moreIcon, { transform: [{ rotate: '90deg' }] }]}
            />
          </TouchableOpacity>
        </View>

        {otherUserData?.user_info?.user_type === 'business' && (
          <ImageBackground
            source={Images.gradientBg1}
            style={styles.adBox}
            imageStyle={styles.adBgImage}
          >
            <View>
              <Text style={[Typography.black16Bold, { color: '#444444' }]}>
                Business Details
              </Text>
              <Text
                style={[
                  Typography.black13Regular,
                  { color: Colors.secondaryText },
                ]}
              >
                View Business Details
              </Text>
              <Image source={Images.greenArrow} style={styles.adArrow} />
            </View>
            <Image source={Images.businessIcon} style={styles.adIcon} />
          </ImageBackground>
        )}

        <View style={styles.wrapper}>
          <FlatList
            data={dynamicPostCategoryData}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={item => item.id.toString()}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedUser?.profile_photo_url ? (
              <Image
                source={{ uri: selectedUser?.profile_photo_url }}
                style={styles.modalAvatar}
              />
            ) : (
              <View style={styles.avatar}>
                <Image
                  source={Icons.placeholderIcon}
                  style={{ height: 16, width: 16 }}
                  tintColor={Colors.primary}
                />
              </View>
            )}

            <Text style={styles.modalText}>
              Are you sure you want to Unblock{' '}
              <Text style={{ fontWeight: '600' }}>
                {selectedUser?.full_name}
              </Text>
              ?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.confirmBtn} onPress={handleUnblock}>
                <Text style={styles.confirmText}>Unblock</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <MenuModal />
    </ViewContainer>
  );
};

export default OtherUserProfileScreen;

const styles = StyleSheet.create({
  coverImage: { width: '100%', height: 160 },
  avatarWrap: { position: 'absolute', bottom: -40, alignSelf: 'center' },

  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  smallArrow: {
    width: 12,
    height: 6,
    objectFit: 'contain',
    tintColor: '#111827',
  },

  profileType: {
    backgroundColor: '#F3B14A',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 26,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 10,
  },

  badge: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 6,
    gap: 6,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 10,
    marginTop: 14,
    maxWidth: '90%',
    alignItems: 'flex-start',
  },
  badgeIcon: { width: 18, height: 18, objectFit: 'contain' },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 4,
    gap: 20,
  },
  messageButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    borderColor: Colors.secondaryText,
    opacity: 0.6,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
  statsRow: { flexDirection: 'row', marginHorizontal: 24, marginVertical: 18 },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: '#E5E5E5' },

  twoColumnContainer: { flexDirection: 'row', gap: 12, marginHorizontal: 20 },
  gradientBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },

  gradientBgImage: {
    resizeMode: 'contain',
  },

  boxIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  adBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },

  adBgImage: {
    borderRadius: 14,
    resizeMode: 'cover',
  },
  adArrow: { objectFit: 'contain', height: 24, width: 39, marginTop: 4 },
  adIcon: { width: 74, height: 71, objectFit: 'contain' },
  wrapper: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontalPadding,
    backgroundColor: Colors.lightBg,
  },
  listContent: {
    paddingBottom: 20,
  },

  boxContainer: {
    width: '48.5%',
    marginBottom: 16,
  },

  iconBg: {
    position: 'absolute',
    right: 0,
    height: 76,
    width: 60,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    backgroundColor: '#F3B14A',
    opacity: 0.06,
  },

  icon: {
    width: 32,
    height: 32,
    objectFit: 'contain',
    tintColor: Colors.primary,
  },

  // ✅ Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    backgroundColor: '#FFF7F3',
  },
  menuIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primary,
    marginRight: 8,
  },
  menuText: {
    ...Typography.black14Medium,
    color: Colors.secondaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },

  modalText: {
    ...Typography.black18Bold,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: '#F15A24',
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },

  cancelText: {
    ...Typography.black16Medium,
    color: Colors.primary,
  },

  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },

  confirmText: {
    ...Typography.black16Bold,
    color: '#fff',
  },
});
