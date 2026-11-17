import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";

import { Colors } from "../../theme/colors";
import { Images } from "../../assets/images";

const { width } = Dimensions.get("window");

const banners = [
  Images.banner,
  Images.banner,
  Images.banner,
];

const AUTO_SLIDE_INTERVAL = 5000; 

const BannerSlider = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex =
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1;

        scrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });

        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // ✅ Update index on manual swipe
  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner, index) => (
          <View key={index} style={{ width }}>
            <View style={styles.bannerCard}>
              <Image source={banner} style={styles.banner} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerSlider;


const styles = StyleSheet.create({

  bannerCard: {
    marginHorizontal: 16,
  },

  banner: {
    width: "100%",
    height: 140,
    borderRadius: 12,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },

  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});
