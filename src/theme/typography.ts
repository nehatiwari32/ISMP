import { StyleSheet, TextStyle } from 'react-native';
import { Colors } from './colors';
import { scaleFont } from '../utils/helper';

export const Spacing = {
  screenHorizontalPadding: 20,
  modalBorderRadius: 10,
};

export const Fonts = {
  avenirExtrabold: 'AvenirLTStd-Black',
  avenirBold: 'AvenirLTStd-Heavy',
  avenirRegular: 'AvenirLTStd-Book',
  avenirMedium: 'AvenirLTStd-Medium',
};

export const Typography = StyleSheet.create({

  /* ============================
        FONT SIZE 10
  ============================ */
  black10Regular: {
    fontSize: scaleFont(10),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black10Medium: {
    fontSize: scaleFont(10),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black10Bold: {
    fontSize: scaleFont(10),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

   black11Regular: {
    fontSize: scaleFont(11),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black11Medium: {
    fontSize: scaleFont(11),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black11Bold: {
    fontSize: scaleFont(11),
    lineHeight: scaleFont(14),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  /* ============================
        FONT SIZE 12
  ============================ */
  black12Regular: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black12Medium: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black12Bold: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  black13Regular: {
    fontSize: scaleFont(13),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black13Medium: {
    fontSize: scaleFont(13),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black13Bold: {
    fontSize: scaleFont(13),
    lineHeight: scaleFont(17),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  /* ============================
        FONT SIZE 14
  ============================ */
  black14Regular: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black14Medium: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black14Bold: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  /* ============================
        FONT SIZE 16
  ============================ */
  black16Regular: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black16Medium: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black16Bold: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  /* ============================
        FONT SIZE 18
  ============================ */
  black18Regular: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(25),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black18Medium: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(25),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black18Bold: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(25),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

  /* ============================
        FONT SIZE 20
  ============================ */
  black20Regular: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black20Medium: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black20Bold: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

 black22Regular: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black22Medium: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black22Bold: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,

   black24Regular: {
    fontSize: scaleFont(24),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirRegular,
    fontWeight: '400',
    color: Colors.primaryText,
  } as TextStyle,

  black24Medium: {
    fontSize: scaleFont(24),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirMedium,
    fontWeight: '500',
    color: Colors.primaryText,
  } as TextStyle,

  black24Bold: {
    fontSize: scaleFont(24),
    lineHeight: scaleFont(28),
    fontFamily: Fonts.avenirBold,
    fontWeight: '600',
    color: Colors.primaryText,
  } as TextStyle,
});
