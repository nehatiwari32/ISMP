import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Clipboard,
  ImageBackground,
} from "react-native";
import { Icons } from "../../assets/icons";
import { ViewContainer } from "../../components";
import { Colors } from "../../theme/colors";
import { Images } from "../../assets/images";
import { Spacing, Typography } from "../../theme/typography";

const ReferScreen = () => {
  const [referralCode] = useState("ABC123XYZ");
  const [tooltipVisible, setTooltipVisible] = useState(true);

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    alert("Referral code copied!");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} to sign up and earn rewards!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ViewContainer containerStyle={styles.container} headerTitle="Refer">
      <View style={{ backgroundColor: Colors.lightBg, flex: 1, paddingHorizontal: Spacing.screenHorizontalPadding }}>
        {/* Referral Card */}
        <ImageBackground
          source={Images.referBG}   // ⭐ background image
          style={styles.card}
          imageStyle={styles.cardBg}
        >
          {/* Tooltip */}
          {/* {tooltipVisible && (
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipArrow} />
              <View style={styles.tooltipBox}>
                <Text style={[Typography.black10Medium, { color: '#fff' }]}>
                  Share your referral link or code. When friends join, you earn
                  coupons to use for discounts, offers, or events.
                </Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setTooltipVisible(false)}
                >
                  <Image source={Icons.cross} style={{height: 16, width: 16, objectFit: 'contain'}} tintColor={Colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          )} */}

          {/* Referral Code */}
          <Text style={[Typography.black20Medium, { color: '#fff', marginBottom: 4, textAlign: 'center' }]}>Your Referral Code/Link</Text>
          <View style={styles.codeBox}>
            <Text style={[Typography.black24Medium, {color: '#fff'}]}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopyCode}>
              <Image source={Icons.copy} style={styles.copyIcon} tintColor={"#fff"} />
            </TouchableOpacity>
          </View>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Image source={Icons.share1} style={styles.shareIcon} />
            <Text style={[Typography.black16Bold, { color: Colors.primary }]}>Share Code</Text>
          </TouchableOpacity>
        </ImageBackground>

        {/* Overview Section */}
        <Text style={[Typography.black14Medium, { color: '#787878', marginBottom: 10 }]}>OVERVIEW</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Image source={Images.referal} style={styles.overviewIcon} />
            <View>
              <Text style={[Typography.black12Medium, { color: '#818181' }]}>Total Referrals</Text>
              <Text style={[Typography.black16Bold, { color: '#1A1A1A', marginTop: 4 }]}>10</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <Image source={Images.frnds} style={styles.overviewIcon} />
            <View>
              <Text style={[Typography.black12Medium, { color: '#818181' }]}>Friends Joined</Text>
              <Text style={[Typography.black16Bold, { color: '#1A1A1A', marginTop: 4 }]}>20</Text>
            </View>
          </View>
        </View>
      </View>
    </ViewContainer>
  );
};

export default ReferScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  card: {
    marginTop: '8%',
    borderRadius: 16,
    padding: 20,
    position: "relative",
    marginBottom: 20,
  },
  cardBg: {
    borderRadius: 16,
    resizeMode: 'cover',
  },
  tooltipContainer: {
    position: "absolute",
    top: -10,
    right: 0,
    left: 0,
    alignItems: "flex-end",
    zIndex: 9999
  },
  tooltipBox: {
    backgroundColor: Colors.secondary,
    padding: 10,
    borderRadius: 20,
    width: "80%",
    position: "relative",

  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.secondary,
    alignSelf: "center",
  },

  closeBtn: {
    position: "absolute",
    top: -4,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  codeBox: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  code: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
  copyIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain'
  },
  shareButton: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 30,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  shareIcon: {
    width: 15,
    height: 17,
    tintColor: Colors.primary,
    objectFit: 'contain'
  },


  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewCard: {
    flex: 0.48,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: 'row',
    gap: 10
  },
  overviewIcon: {
    width: 30,
    height: 30,
    objectFit: 'contain'
  },

});
