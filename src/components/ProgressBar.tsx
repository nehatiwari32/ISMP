import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface Props {
  step: number;
}

const ProgressBar = ({ step }: Props) => {

  return (
    <View>
      {/* Step info */}
      <View style={styles.infoContainer}>
        <Text style={styles.percentText}>{step}%</Text>
        <Text style={[Typography.black10Medium, { color: '#6F6F6F' }]}>Completed</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBackground}>
        <Animated.View style={[styles.progressFill, { width: `${step}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  percentText: {
    ...Typography.black14Bold,
    color: Colors.primary,
  },
  percentSubText: {
    marginStart: 4,
    fontSize: 12,
    fontWeight: '400',
    color: Colors.progressSubTxt,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
});

export default React.memo(ProgressBar);
