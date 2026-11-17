import React, { memo, ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { scaleFont } from '../../utils/helper';
import CustomButton from './CustomButton';
import { Spacing, Typography } from '../../theme/typography';
import { BlurView } from '@react-native-community/blur';

const { width } = Dimensions.get('window');

interface CommonModalProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  body?: ReactNode;
  btnRow?: boolean;
  image?: any;
  btnTitle?: string;
  btnRowTitle1?: string;
  btnRowTitle2?: string;
  closeOnBackdrop?: boolean;
  onConfirm?: () => void;
  secondaryBody?: string;
  imgStyle?: any;
  isShowBtn?: boolean
}

const CommonModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  title,
  body,
  btnRow = false,
  btnTitle,
  btnRowTitle1,
  btnRowTitle2,
  onConfirm,
  closeOnBackdrop = true,
  image,
  secondaryBody,
  imgStyle,
  isShowBtn = true
}) => {

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Blur background */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={2}
          blurType="dark"
          reducedTransparencyFallbackColor="black"
        />

        {/* Click outside to close */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
        />

        {/* Centered modal */}
        <View style={styles.centeredView}>
          <Pressable style={styles.modalView} onPress={handleModalPress}>
            {image && <Image source={image} style={imgStyle ? imgStyle : styles.imgStyle} />}

            {title ? <Text style={[Typography.black18Bold, { textAlign: 'center', marginBottom: '5%' }]}>{title}</Text> : null}

            <View style={styles.bodyContainer}>
              {typeof body === 'string' ? (
                <Text style={[Typography.black14Regular, { color: Colors.secondaryText, textAlign: 'center' }]}>{body}</Text>
              ) : (
                body
              )}
              {secondaryBody && <Text style={[Typography.black14Bold, { color: Colors.secondary }]}>{secondaryBody}</Text>}
            </View>
            {isShowBtn ?
              <>
                {btnRow ? (
                  <View style={styles.rowButtonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryBtn]}
                      onPress={onClose}
                    >
                      <Text style={[Typography.black14Bold, { color: Colors.primary }]}>
                        {btnRowTitle1 || 'Cancel'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={onConfirm}
                    >
                      <Text style={[Typography.black14Bold, { color: '#fff' }]}>
                        {btnRowTitle2 || 'Confirm'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <CustomButton
                    title={btnTitle || 'Continue'}
                    onPress={onConfirm}
                  />
                )}
              </>
              : null
            }

          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default memo(CommonModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centeredView: {
    width: width * 0.88,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalView: {
    width: '100%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Spacing.modalBorderRadius,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  imgStyle: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: scaleFont(18),
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 12,
  },

  bodyContainer: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },

  rowButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 0.48,
  },
  secondaryBtn: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

});
