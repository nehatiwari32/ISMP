import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch, useSelector } from 'react-redux';

import GradientAvatar from '../GradientAvatar';
import EmojiPicker from '../EmojiPickerProps';
import { Icons } from '../../assets/icons';
import { Images } from '../../assets/images';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { backgroundColors, MAX_SELECTION } from '../../utils/helper';
import { RootState } from '../../redux/store';
import {
  addLocalFile,
  bulkMedia,
  removeFile,
  uploadMedia,
} from '../../redux/slices/profileSlice';
import { fetchHashTags } from '../../redux/slices/postSlice';
import { MediaFile, PostComposerProps } from '../../utils/interfaces';
import { getFriends } from '../../redux/slices/friendSlice';

const getSafeUri = (val: any) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val?.url || val?.uri || val?.path || '';
  }
  return '';
};

const PostComposer: React.FC<PostComposerProps> = ({
  caption,
  setCaption,
  openDocumentPicker,

  isRecording,
  recordingDuration,
  startAudioRecording,
  stopAudioRecording,

  documentLoading,

  showEmojiPicker,
  setShowEmojiPicker,

  showColorPicker,
  setShowColorPicker,

  currentFormatting,
  setCurrentFormatting,
  setSelection,
  showProfile = true,
  backgroundColor,
  setBackgroundColor,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const dispatch = useDispatch();
  const { uploadedFiles, userProfile } = useSelector(
    (state: RootState) => state.profile,
  );
  console.log('uploadedFiles>>>>', uploadedFiles);

  const [cameraLoading, setCameraLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // ⭐ NEW: Suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<
    'hashtag' | 'mention' | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    const text = caption ?? '';
    const position = cursorPosition ?? 0;

    // Find last # or @ before cursor
    const lastHashIndex = text.lastIndexOf('#', position - 1);
    const lastMentionIndex = text.lastIndexOf('@', position - 1);

    // Check if space exists after trigger
    const hasSpaceAfterHash =
      lastHashIndex >= 0 && text.slice(lastHashIndex, position).includes(' ');

    const hasSpaceAfterMention =
      lastMentionIndex >= 0 &&
      text.slice(lastMentionIndex, position).includes(' ');

    // ⭐ HASHTAG MODE
    if (
      lastHashIndex >= 0 &&
      lastHashIndex > lastMentionIndex &&
      !hasSpaceAfterHash
    ) {
      const query = text.slice(lastHashIndex + 1, position).trim();

      setSearchQuery(query);
      setSuggestionType('hashtag');
      setShowSuggestions(true);
      return;
    }

    // ⭐ MENTION MODE
    if (
      lastMentionIndex >= 0 &&
      lastMentionIndex > lastHashIndex &&
      !hasSpaceAfterMention
    ) {
      const query = text.slice(lastMentionIndex + 1, position).trim();

      setSearchQuery(query);
      setSuggestionType('mention');
      setShowSuggestions(true);
      return;
    }

    // ⭐ RESET MODE
    setSearchQuery('');
    setSuggestionType(null);
    setShowSuggestions(false);
  }, [caption, cursorPosition]);

  useEffect(() => {
    if (!suggestionType) return;

    const timer = setTimeout(() => {
      if (suggestionType === 'hashtag') {
        fetchHashtagSuggestions();
      }

      if (suggestionType === 'mention') {
        fetchFriendSuggestions(searchQuery);
      }
    }, 300); // debounce delay

    return () => clearTimeout(timer);
  }, [suggestionType, searchQuery]);

  // ⭐ Fetch hashtag suggestions
  const fetchHashtagSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const result = await dispatch(
        fetchHashTags({ page: 1, limit: 10 }),
      ).unwrap();

      setHashtags(result?.items || []);
    } catch (error) {
      console.log('Error fetching hashtags:', error);
      setHashtags([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  // ⭐ Fetch friend suggestions
  const fetchFriendSuggestions = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      const result = await dispatch(
        getFriends({ page: 1, limit: 10, search: query }),
      ).unwrap();

      setFriends(result?.items || []);
    } catch (error) {
      console.log('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const text = caption;
    const position = cursorPosition;

    if (suggestionType === 'hashtag') {
      const lastHashIndex = text.lastIndexOf('#', position - 1);
      const beforeHash = text.slice(0, lastHashIndex);
      const afterCursor = text.slice(position);
      const newText = `${beforeHash}#${suggestion.name || suggestion.hashtag
        } ${afterCursor}`;
      setCaption(newText);
      setCursorPosition(
        beforeHash.length + (suggestion.name || suggestion.hashtag).length + 2,
      );
    } else if (suggestionType === 'mention') {
      const lastMentionIndex = text.lastIndexOf('@', position - 1);
      const beforeMention = text.slice(0, lastMentionIndex);
      const afterCursor = text.slice(position);
      const newText = `${beforeMention}@${suggestion.name || suggestion.username
        } ${afterCursor}`;
      setCaption(newText);
      setCursorPosition(
        beforeMention.length +
        (suggestion.name || suggestion.username).length +
        2,
      );
    }

    setShowSuggestions(false);
    setSuggestionType(null);

    // Focus back on input
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const removeUploadedFile = index => {
    dispatch(removeFile(index));
  };

  const toggleBold = () => {
    setCurrentFormatting(prev => ({ ...prev, bold: !prev.bold }));
  };

  const toggleItalic = () => {
    setCurrentFormatting(prev => ({ ...prev, italic: !prev.italic }));
  };

  // ⭐ Set background color - default black if none selected
  const setBackgroundColorHandler = (color: string) => {
    setBackgroundColor(color);
    setCurrentFormatting(prev => ({
      ...prev,
      color: '#FFFFFF', // White text
      align: 'center', // Center align
    }));
    setShowColorPicker(false);
  };

  const toggleAlignment = () => {
    // Don't allow manual alignment when background is set

    setCurrentFormatting(prev => {
      let nextAlign = 'left';

      if (prev.align === 'left') {
        nextAlign = 'center';
      } else if (prev.align === 'center') {
        nextAlign = 'right';
      } else if (prev.align === 'right') {
        nextAlign = 'left';
      }

      return { ...prev, align: nextAlign };
    });
  };

  // ⭐ Toggle color picker - set default black background when opened
  const handleColorPickerToggle = () => {
    if (!showColorPicker && !backgroundColor) {
      // Opening picker for first time - set default black
      setBackgroundColorHandler('#000000');
    }
    setShowColorPicker(!showColorPicker);
  };

  const openCamera = async () => {
    try {
      setCameraLoading(true);

      const media = await ImagePicker.openCamera({
        cropping: false,
        mediaType: 'any',
        includeBase64: false,
      });

      if (!media) return;

      const safeUri = getSafeUri(media.path || media.sourceURL || media.uri);

      const result = await dispatch(
        uploadMedia({
          file: {
            uri: safeUri,
            type: media.mime || 'image/jpeg',
            fileName: media.filename || `media_${Date.now()}`,
          },
          type: 'user',
        }),
      ).unwrap();

      const uploaded = {
        uri: getSafeUri(result?.data),
        status: 'uploaded',
        id: `server-${Date.now()}`,
        type: media.mime?.includes('video') ? 'video' : 'image',
      };

      dispatch(addLocalFile(uploaded));
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Camera Error', 'Unable to open camera');
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const openGallery = async () => {
    try {
      setGalleryLoading(true);
      const files = await ImagePicker.openPicker({
        mediaType: 'any',
        multiple: true,
        compressImageQuality: 0.8,
        includeBase64: false,
        maxFiles: MAX_SELECTION,
      });

      if (!files || files.length === 0) return;

      const selectedFiles = Array.isArray(files) ? files : [files];

      const bulkPayload = selectedFiles.map(f => ({
        uri: getSafeUri(f.path),
        type: f.mime,
        name: f.filename || `media-${Date.now()}-${Math.random()}`,
      }));

      const result = await dispatch(
        bulkMedia({ files: bulkPayload, type: 'user' }),
      ).unwrap();

      const uploadedList = result?.data?.urls || [];

      uploadedList.forEach((url, index) => {
        const original = selectedFiles[index];
        const isVideo = original.mime?.includes('video');

        dispatch(
          addLocalFile({
            uri: url,
            status: 'uploaded',
            type: isVideo ? 'video' : 'image',
            id: `server-${Date.now()}-${index}`,
          }),
        );
      });
    } catch (error) {
      console.log('Gallery error:', error);
    } finally {
      setGalleryLoading(false);
    }
  };

  const renderMediaItem = ({
    item,
    index,
  }: {
    item: MediaFile;
    index: number;
  }) => {
    const isVideo = item.type === 'video';
    const isAudio = item.type === 'audio';
    const isDocument = item.type === 'document';

    return (
      <View style={styles.mediaItemContainer}>
        {isDocument ? (
          <View style={styles.docContainer}>
            <Image source={Icons.document} style={styles.docIcon} />
            <Text numberOfLines={1} style={styles.docName}>
              {item.name || 'Document'}
            </Text>
          </View>
        ) : isAudio ? (
          <View style={styles.audioThumbnail}>
            <Image source={Icons.audio} style={styles.audioIconLarge} />
            <Text style={styles.audioLabel}>Audio</Text>
          </View>
        ) : (
          <FastImage
            source={{ uri: item.uri }}
            style={styles.mediaThumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}

        {isVideo && (
          <View style={styles.videoIndicator}>
            <Text style={styles.videoIcon}>▶</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeUploadedFile(index)}
        >
          <Image source={Icons.cross} style={styles.removeIcon} />
        </TouchableOpacity>

        <Text style={styles.mediaIndex}>{index + 1}</Text>
      </View>
    );
  };

  // ⭐ Render suggestion item
  const renderSuggestionItem = ({ item }) => {
    if (suggestionType === 'hashtag') {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSuggestionSelect(item)}
        >
          <Text style={styles.suggestionHash}>#</Text>
          <Text style={styles.suggestionText}>{item.name || item.hashtag}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSuggestionSelect(item)}
        >
          {item.profile_photo_url ? <GradientAvatar
            source={
              item.profile_photo_url
                ? { uri: item.profile_photo_url }
                : Icons.placeholder
            }
            size={32}
            borderWidth={1}
          />
            :
            <View style={styles.fallbackAvatar}>
              <Image
                source={Icons.placeholderIcon}
                style={{ height: 18, width: 18, objectFit: 'contain' }}
                tintColor={Colors.primary}
              />
            </View>
          }
          <View style={styles.suggestionUserInfo}>
            <Text style={styles.suggestionText}>
              {item.name || item.username}
            </Text>
            {item.username && (
              <Text style={styles.suggestionUsername}>{item.username}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* USER SECTION */}
      {showProfile === true && (
        <View style={styles.userSection}>

          {userProfile?.profile_photo_url ?
            <GradientAvatar
              source={
                userProfile?.profile_photo_url
                  ? { uri: userProfile.profile_photo_url }
                  : Icons.placeholder
              }
              size={34}
              borderWidth={1}
            />
            :
            <View style={styles.fallbackAvatar}>
              <Image
                source={Icons.placeholderIcon}
                style={{ height: 18, width: 18, objectFit: 'contain' }}
                tintColor={Colors.primary}
              />
            </View>
          }
          <Text style={styles.userName}>
            {userProfile?.name || userProfile?.full_name || ''}
          </Text>
        </View>
      )}

      {/* POST BOX - WITH BACKGROUND COLOR */}
      <View
        style={[
          styles.postBox,
          backgroundColor && {
            backgroundColor: backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.captionContainer,
            backgroundColor && styles.captionContainerWithBg,
          ]}
        >
          <TextInput
            ref={textInputRef}
            style={[
              styles.captionInput,
              {
                fontWeight: currentFormatting.bold ? 'bold' : 'normal',
                fontStyle: currentFormatting.italic ? 'italic' : 'normal',
                color: currentFormatting.color,
                textAlign: currentFormatting.align,
              },
            ]}
            placeholder="Speak from your heart"
            placeholderTextColor={
              backgroundColor ? 'rgba(255,255,255,0.7)' : '#828692'
            }
            multiline
            maxLength={500}
            value={caption}
            onChangeText={setCaption}
            onSelectionChange={e => {
              setSelection(e.nativeEvent.selection);
              setCursorPosition(e.nativeEvent.selection.start);
            }}
            textAlignVertical="top"
          />
          <Text
            style={{
              alignSelf: 'flex-end',
              fontSize: 12,
              color: '#888',
              marginTop: 4,
            }}
          >
            {caption.length} / 200
          </Text>

          {/* ⭐ SUGGESTIONS DROPDOWN */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {loadingSuggestions ? (
                <View style={styles.suggestionLoadingContainer}>
                  <ActivityIndicator color={Colors.primary} size="small" />
                  <Text style={styles.suggestionLoadingText}>
                    {suggestionType === 'hashtag'
                      ? 'Loading hashtags...'
                      : 'Loading friends...'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={suggestionType === 'hashtag' ? hashtags : friends}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item, index) => `${suggestionType}-${index}`}
                  style={styles.suggestionsList}
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={styles.noSuggestionsText}>
                      {suggestionType === 'hashtag'
                        ? 'No hashtags found'
                        : 'No friends found'}
                    </Text>
                  }
                />
              )}
            </View>
          )}
        </View>

        {uploadedFiles.length > 0 && (
          <View style={styles.mediaGridContainer}>
            <Text
              style={[
                styles.mediaGridTitle,
                backgroundColor && { color: '#FFFFFF' },
              ]}
            >
              Media ({uploadedFiles.length})
            </Text>
            <FlatList
              data={uploadedFiles}
              renderItem={renderMediaItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {backgroundColor && (
          <View style={styles.colorPickerRow}>
            <TouchableOpacity
              style={[styles.colorCircle, styles.removeColorButton]}
              onPress={() => {
                setBackgroundColor(null);
                setCurrentFormatting(prev => ({
                  ...prev,
                  color: Colors.primaryText,
                  align: 'left',
                }));
              }}
            >
              <Image source={Icons.cross} style={styles.removeColorIcon} />
            </TouchableOpacity>

            {/* Color options */}
            {backgroundColors.map((color, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  backgroundColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setBackgroundColorHandler(color)}
              />
            ))}
          </View>
        )}

        {/* FORMATTING BAR */}
        <View style={styles.formattingBar}>
          <TouchableOpacity onPress={handleColorPickerToggle}>
            <ImageBackground
              source={Images.bgColor}
              style={[
                styles.formatBtn,
                backgroundColor && styles.formatBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.formatIconText,
                  { fontWeight: 'bold', color: '#fff' },
                ]}
              >
                Aa
              </Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formatBtn,
              currentFormatting.bold && styles.formatBtnActive,
            ]}
            onPress={toggleBold}
          >
            <Text style={[styles.formatIconText, { fontWeight: 'bold' }]}>
              B
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formatBtn,
              currentFormatting.italic && styles.formatBtnActive,
            ]}
            onPress={toggleItalic}
          >
            <Text style={[styles.formatIconText, { fontStyle: 'italic' }]}>
              I
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formatBtn,
              currentFormatting.align === 'right' && styles.formatBtnActive,
            ]}
            onPress={toggleAlignment}
          >
            <Image
              source={Icons.allignment}
              style={{ height: 16, width: 16 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* MEDIA BUTTONS */}
      <View style={styles.mediaOptions}>
        <TouchableOpacity style={styles.mediaBtn} onPress={openCamera}>
          {cameraLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Image source={Icons.cameraGreen} style={styles.mediaIcon} />
              <Text style={styles.mediaBtnText}>Camera</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaBtn} onPress={openGallery}>
          {galleryLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Image source={Icons.galleryPink} style={styles.mediaIcon} />
              <Text style={styles.mediaBtnText}>Photo/Videos</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediaBtn, isRecording && styles.mediaBtnRecording]}
          onPress={isRecording ? stopAudioRecording : startAudioRecording}
        >
          {isRecording && (
            <View
              style={[
                styles.recordingIndicator,
                styles.recordingIndicatorActive,
              ]}
            />
          )}
          <Image source={Icons.audio} style={styles.mediaIcon} />
          <Text
            style={[styles.mediaBtnText, isRecording && styles.recordingText]}
          >
            {isRecording ? `${recordingDuration}s` : 'Audio'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaOptions}>
        <TouchableOpacity style={styles.mediaBtn} onPress={openDocumentPicker}>
          {documentLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Image source={Icons.document} style={styles.mediaIcon} />
              <Text style={styles.mediaBtnText}>Document</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => textInputRef.current?.focus()}
        >
          <Image source={Icons.link} style={styles.mediaIcon} />
          <Text style={styles.mediaBtnText}>Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediaBtn, showEmojiPicker && styles.mediaBtnActive]}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Text style={{ fontSize: 14 }}>😊</Text>
          <Text
            style={[
              styles.mediaBtnText,
              showEmojiPicker && styles.mediaBtnTextActive,
            ]}
          >
            Emoji
          </Text>
        </TouchableOpacity>
      </View>

      {/* EMOJI PICKER */}
      {showEmojiPicker && (
        <Pressable
          onPress={() => setShowEmojiPicker(false)}
          style={styles.emojiOverlay}
        >
          <Pressable style={styles.pickerWrapper}>
            <EmojiPicker
              onEmojiSelect={emoji => setCaption(prev => prev + emoji)}
            />
          </Pressable>
        </Pressable>
      )}
    </ScrollView>
  );
};

export default PostComposer;

const styles = StyleSheet.create({
  emojiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userName: {
    ...Typography.black14Bold,
  },
  postBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 16,
  },
  captionContainer: {
    minHeight: 100,
  },
  captionContainerWithBg: {
    minHeight: 150,
  },
  captionInput: {
    ...Typography.black14Medium,
    lineHeight: 22,
    // minHeight: 60,
  },

  fallbackAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  // ⭐ SUGGESTIONS STYLES
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: 200,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionHash: {
    ...Typography.black13Bold,
    color: Colors.primary,
  },
  suggestionText: {
    flex: 1,
    ...Typography.black13Bold,
    color: Colors.primaryText,
  },

  suggestionUserInfo: {
    flex: 1,
  },
  suggestionUsername: {
    ...Typography.black13Bold,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  suggestionLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  suggestionLoadingText: {
    ...Typography.black13Bold,
    color: Colors.secondaryText,
  },
  noSuggestionsText: {
    textAlign: 'center',
    ...Typography.black13Bold,
    color: Colors.secondaryText,
    paddingVertical: 16,
  },

  mediaGridContainer: {
    marginVertical: 12,
  },
  mediaGridTitle: {
    ...Typography.black14Bold,
    color: Colors.primaryText,
    marginBottom: 8,
  },
  mediaItemContainer: {
    width: 160,
    height: 120,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.closeBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    width: 12,
    height: 12,
    tintColor: '#fff',
  },
  videoIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  videoIcon: {
    color: '#fff',
    fontSize: 8,
  },
  mediaIndex: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  // ⭐ COLOR PICKER ROW (HORIZONTAL INSIDE POST BOX)
  colorPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  colorCircleSelected: {
    borderColor: '#fff',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  removeColorButton: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeColorIcon: {
    width: 14,
    height: 14,
    tintColor: '#666',
  },

  formattingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    flexWrap: 'wrap',
  },
  formatBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryExtraLight,
    borderRadius: 8,
  },
  formatBtnActive: {
    backgroundColor: Colors.primaryExtraLight,
  },
  formatBtnDisabled: {
    opacity: 0.4,
  },
  formatIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  docContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  docIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.primary,
    marginBottom: 4,
  },
  docName: {
    fontSize: 10,
    color: Colors.primaryText,
    textAlign: 'center',
    width: '90%',
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 10,
  },
  mediaIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  mediaBtnText: {
    ...Typography.black14Medium,
    color: '#828692',
  },
  mediaBtnActive: {
    backgroundColor: '#EFF6FF',
  },
  mediaBtnTextActive: {
    color: Colors.primary,
  },
  audioThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIconLarge: {
    width: 30,
    height: 30,
    tintColor: Colors.primary,
  },
  audioLabel: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  mediaBtnRecording: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  recordingText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: -4,
  },
  recordingIndicatorActive: {
    backgroundColor: '#DC2626',
  },
});
