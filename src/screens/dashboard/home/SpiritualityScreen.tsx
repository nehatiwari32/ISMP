import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Spacing, Typography } from "../../../theme/typography";
import { ViewContainer } from "../../../components";
import { Colors } from "../../../theme/colors";

const Spirituality = ({ route }: any) => {
  const { categoryId, categoryName } = route.params;

  const { localityInfoList } = useSelector(
    (state: RootState) => state.post
  );

  /* ---------- Filter data safely ---------- */
  const filteredData = useMemo(() => {
    return localityInfoList?.filter(
      (item) => item.category_id === categoryId
    ) || [];
  }, [localityInfoList, categoryId]);

  return (
    <ViewContainer
      headerTitle={categoryName || "Spirituality"}
      containerStyle={{ paddingHorizontal: 0 }}
    >
      <ScrollView>
        {filteredData.length === 0 ? (
          <Text style={styles.emptyText}>
            No data available
          </Text>
        ) : (
          filteredData.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={Typography.black16Bold}>
                {item.title}
              </Text>

              {!!item.description && (
                <Text style={styles.description}>
                  {item.description}
                </Text>
              )}

              {!!item.address && (
                <Text style={styles.address}>
                  Address: {item.address}
                </Text>
              )}

              {!!item.media && (
                <Image
                  source={{ uri: item.media }}
                  style={styles.image}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ViewContainer>
  );
};

export default Spirituality;
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryExtraLight,
    padding: Spacing.screenHorizontalPadding,
    marginBottom: 16,
    borderRadius: 16,
  },
  description: {
    ...Typography.black12Regular,
    marginTop: 10,
  },
  address: {
    ...Typography.black12Bold,
    color: Colors.primary,
    marginVertical: 12,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    resizeMode: "cover",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    ...Typography.black14Regular,
    color: Colors.secondaryText,
  },
});