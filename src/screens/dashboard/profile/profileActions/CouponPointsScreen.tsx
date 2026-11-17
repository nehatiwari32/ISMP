import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { ViewContainer, AppTabBar, HistoryCard, CustomButton, InputField, CommonModal, GradientBox } from "../../../../components";
import { Typography } from "../../../../theme/typography";
import { Colors } from "../../../../theme/colors";
import { Images } from "../../../../assets/images";
import { Icons } from "../../../../assets/icons";

const CouponPointsScreen = () => {
  const [activeTab, setActiveTab] = useState("coupon");

  const [businessName, setBusinessName] = useState("");
  const [amountSpent, setAmountSpent] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <ViewContainer
      headerTitle="Coupon Points"
      containerStyle={{ paddingHorizontal: 0 }}
      bottomFixedComponent={
        activeTab === 'add' ? <CustomButton
          title="Submit"
          onPress={() => setShowModal(true)}
        />
          : null
      }
    >
      <View style={styles.wrapper}>

        {/* Top TabBar */}
        <View style={{ marginVertical: 16 }}>
          <AppTabBar
            tabs={[
              { label: "Coupon Points", value: "coupon" },
              { label: "Add Points", value: "add" },
            ]}
            active={activeTab}
            onChange={(val) => {
              setActiveTab(val);
            }}
          />
        </View>
        
        {activeTab === 'add' ?
          <View>
            <Text style={[Typography.black16Bold, { marginBottom: 10 }]}>
              Add Coupon Points
            </Text>

            <InputField
              label="Business Name"
              placeholder="Enter name"
              value={businessName}
              onChangeText={(text) => setBusinessName(text)}
            />

            <Text style={styles.label}>Upload Bill</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <Image source={Icons.upload} style={styles.uploadIcon} />
              <Text style={[Typography.black14Medium, { color: "#A3A3A3" }]}>
                Upload from Gallery
              </Text>
            </TouchableOpacity>

            <InputField
              label="Amount Spent"
              placeholder="Enter amount"
              value={amountSpent}
              onChangeText={(text) => setAmountSpent(text)}
              keyboardType="numeric"
            />
          </View>
          :
          <View>

            <GradientBox colors={['#FFFBF0', '#FFF4D6']} >
              <View>
                <Text style={[Typography.black16Bold, { color: "#444444" }]}>
                  400
                </Text>
                <Text
                  style={[
                    Typography.black12Regular,
                    { color: Colors.secondaryText },
                  ]}
                >
                  Coupon Points
                </Text>
              </View>

              {/* BACKGROUND BUBBLE */}
              <View style={styles.iconBg} />

              {/* VISIBLE ICON */}
              <Image source={Images.discount} style={styles.balanceIcon} />
            </GradientBox>

            <Text style={[Typography.black16Bold, { marginTop: 20 }]}>
              History
            </Text>

            <ScrollView
              style={{ marginTop: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {[1, 2, 3].map((item) => (
                <HistoryCard
                  key={item}
                  title="Referral Bonus"
                  date="5 Aug 2025"
                  points={70}
                  icon={Icons.share}
                />
              ))}
            </ScrollView>
          </View>
        }

      </View>
      <CommonModal
        visible={showModal}
        title="Admin Will Review"
        body={"Thank you for Submitting! Your data is currently under review by our admin."}
        isShowBtn={true}
        onClose={() => setShowModal(false)}
        image={Images.karmaIcon}
        imgStyle={{
          height: 138,
          width: 140,
          objectFit: 'contain',
          alignSelf: 'center',
          marginBottom: 20,
        }}
        isShowBtn={false}
      />
    </ViewContainer>
  );
};

export default CouponPointsScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: 16,
  },

  iconBg: {
    position: "absolute",
    right: 0,
    height: 80,
    width: 85,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    backgroundColor: "#F3B14A",
    opacity: 0.06,
  },

  balanceIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 10,
    zIndex: 10,
  },
  label: {
    ...Typography.black14Regular,
    marginBottom: 6,
    color: Colors.secondaryText,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: Colors.border10,
    borderRadius: 4,
    paddingVertical: 20,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    gap: 8,
    marginBottom: 14,
  },
  uploadIcon: {
    width: 23,
    height: 23,
    objectFit: "contain",
  },
});
