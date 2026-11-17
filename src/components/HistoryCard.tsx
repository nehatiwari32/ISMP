import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

interface Props {
  title: string;
  date: string;
  points: number;
  icon?: any
}

const HistoryCard: React.FC<Props> = ({ title, date, points, icon }) => {
  return (
    <View style={styles.card}>
      {/* Left side */}
      <View style={styles.left}>
        <View style={styles.iconBg}>
          <Image source={icon} style={styles.icon} />
        </View>
        <View>
          <Text style={Typography.black16Medium}>{title}</Text>
          <Text
            style={[
              Typography.black12Medium,
              { marginTop: 3, color: Colors.secondaryText },
            ]}
          >
            {date}
          </Text>
        </View>
      </View>

      {/* Right side (points) */}
      <Text style={[Typography.black16Bold, { color: Colors.secondary }]}>
        +{points} pts
      </Text>
    </View>
  );
};

export default HistoryCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    width: 17,
    height: 17,
    resizeMode: "contain",
  },
});
