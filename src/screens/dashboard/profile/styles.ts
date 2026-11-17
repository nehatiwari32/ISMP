import { StyleSheet } from "react-native";
import { Spacing, Typography } from "../../../theme/typography";
import { Colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  containerInner: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: Spacing.screenHorizontalPadding,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  publicRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryExtraLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  publicRightText: {
    ...Typography.black12Regular,
    color: Colors.primary,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
  },
  smallLabel: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
  },
  row: { flexDirection: "row", gap: 8, marginTop: 6 },
  block: { marginBottom: 12 },
  crossWrap: { position: "absolute", right: 8, top: 8 },
  addMore: { color: Colors.secondary, fontWeight: "600" },
  bottomFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: '100%',
  },
  cancelBtn: {
    width: '49%',
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#fff'
  },
  saveBtn: {
    width: '49%',
  },
  calendarIcon: {
    width: 18,
    height: 18,
    objectFit: 'contain',
    tintColor: Colors.primary
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  genderBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: 114,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 8,
    justifyContent: 'center'
  },

  genderBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  genderIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primaryLight,
  },

  genderIconActive: {
    tintColor: "#fff",
  },

  genderText: {
    ...Typography.black14Regular,
    color: Colors.primaryLight,
    textAlign: 'center'
  },

  genderTextActive: {
    color: "#fff",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },

  chipText: {
    ...Typography.black12Regular,
  },

  chipRemove: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    marginLeft: 6,
  },
  row2: {
    flexDirection: "row",
    gap: 10
  },

  half: { flex: 1 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  crossIcon: { height: 20, width: 20, alignSelf: "flex-end" },

  workBlock: {
    paddingBottom: 10,
  },
  avatarWrap: { alignItems: "flex-start", marginBottom: 20 },
  avatarIcon: { width: 60, height: 60, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLoading: { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" },
  avatarCam: { position: "absolute", left: "70%", bottom: -4 },
  userIcon: {
    height: 30,
    width: 30,
    objectFit: 'contain',
    tintColor: '#fff',
    alignSelf: "center",
  },
  camIcon: { width: 34, height: 34, resizeMode: "contain" },
  addLocalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondaryLight,
    marginVertical: 14
  },
  addLocalitySymbol: {
    ...Typography.black20Regular,
    color: Colors.secondary,
    marginRight: 4,
  },
  addLocalityText: {
    ...Typography.black14Bold,
    color: Colors.secondary,
  },
  addressContainer: {
    backgroundColor: Colors.primaryExtraLight,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Spacing.modalBorderRadius,
    marginTop: 8
  },
  locationIcon: { height: 24, width: 24, marginRight: 8, objectFit: 'contain' },
  ghostContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
    marginBottom: 20,
  },
  ghostContent: {
    flexDirection: "row",
    flex: 1,
  },
  ghostIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginRight: 10,
  },
  ghostTextContainer: {
    flex: 1,
  },
  ghostTitle: {
    ...Typography.black16Medium,
    color: Colors.primaryText,
  },
  ghostSubtitle: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
    marginTop: 2,
  },
});